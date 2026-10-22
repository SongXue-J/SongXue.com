// Print a CV page to A4 PDF via Chrome DevTools Protocol.
// Usage: node scripts/print-cv.mjs <url> <output.pdf>
//
// Chrome's bare `--print-to-pdf` CLI can ignore `@page { size: A4 }` and emit
// US Letter. Page.printToPDF with preferCSSPageSize: true honors the CSS page.

import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const [url, output, footerLeft, lang] = process.argv.slice(2);
if (!url || !output) {
  console.error("Usage: node scripts/print-cv.mjs <url> <output.pdf> [footer-left] [en|zh]");
  process.exit(2);
}

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9333;
const profile = await fs.mkdtemp(path.join(os.tmpdir(), "cv-chrome-"));

const proc = spawn(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--no-default-browser-check",
  "about:blank",
], { stdio: "ignore" });

const json = async (u, opts) => {
  const res = await fetch(u, opts);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

let version;
for (let i = 0; i < 50; i++) {
  try {
    version = await json(`http://127.0.0.1:${port}/json/version`);
    break;
  } catch {
    await sleep(200);
  }
}
if (!version) {
  proc.kill();
  throw new Error("Chrome did not start");
}

const target = await json(
  `http://127.0.0.1:${port}/json/new?about:blank`,
  { method: "PUT" }
);

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let id = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
};

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const current = ++id;
    pending.set(current, (msg) =>
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
    );
    ws.send(JSON.stringify({ id: current, method, params }));
  });

try {
  await send("Page.enable");
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: "light" }],
  });

  const loaded = new Promise((resolve) => {
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === "Page.loadEventFired") {
        ws.removeEventListener("message", handler);
        resolve();
      }
    };
    ws.addEventListener("message", handler);
  });

  await send("Page.navigate", { url });
  await loaded;
  await send("Runtime.evaluate", {
    expression: "document.fonts.ready",
    awaitPromise: true,
  });
  await sleep(300);

  const pageLabel = lang === "zh"
    ? '第 <span class="pageNumber"></span> 页 / 共 <span class="totalPages"></span> 页'
    : 'Page <span class="pageNumber"></span> of <span class="totalPages"></span>';

  const footerFont = lang === "zh"
    ? "'Times New Roman','SimSun','Songti SC',serif"
    : "Georgia,'Noto Serif SC',serif";

  const footerTemplate = footerLeft
    ? `<div style="width:100%; padding:0 15mm; font-size:9px; color:#555; display:flex; justify-content:space-between; font-family:${footerFont};">
         <span>${footerLeft}</span>
         <span>${pageLabel}</span>
       </div>`
    : "<span></span>";

  const pdf = await send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: Boolean(footerLeft),
    headerTemplate: "<span></span>",
    footerTemplate,
    marginTop: 15 / 25.4,
    marginBottom: 17 / 25.4,
    marginLeft: 15 / 25.4,
    marginRight: 15 / 25.4,
  });

  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, Buffer.from(pdf.data, "base64"));
  console.log(`Wrote ${output}`);
} finally {
  ws.close();
  proc.kill();
  await sleep(300);
  await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
}
