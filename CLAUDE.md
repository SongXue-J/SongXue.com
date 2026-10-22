# SongXue.com — Personal Academic Blog

Hugo static site with Hextra theme, bilingual (EN / 简体中文), optional R blogdown integration.

## Architecture

```
Blog/
├── hugo.yaml              # Site config (languages, menus, params)
├── hugo.work              # Hugo workspace: use ../
├── netlify.toml           # Netlify deploy config
├── content/               # Markdown content (bilingual)
│   ├── _index.md          # Homepage EN
│   ├── _index.zh-cn.md    # Homepage ZH
│   ├── about/             # Persona introduction
│   ├── cv/                # CV page (EN/ZH single-column web CV)
│   └── blog/              # Blog posts (subdir per post)
├── assets/                # CSS, JS, images (processed by Hugo)
├── static/                # Static files (favicon set, images, CV PDFs)
├── layouts/               # Template overrides (blog/, cv/, partials/)
├── scripts/               # print-cv.mjs (A4 PDF export)
├── i18n/                  # en.yaml, zh-cn.yaml translations
├── data/                  # icons.yaml, categories.yaml
├── docs/                  # Local site guide (gitignored)
├── themes/hextra/         # Vendored theme (also themes/github.com/imfing/hextra)
└── _reference/            # Archived template examples (excluded from build)
```

## Bilingual content convention

- `_index.md` = English version
- `_index.zh-cn.md` = Chinese version
- Both must have matching frontmatter structure
- Language switcher rendered automatically by Hextra

## Content workflow

- **Data analysis posts** (R visualization, single-cell pipelines): `.Rmd` → blogdown → `.md` output
- **Other posts** (software tips, AI workflows): plain `.md`
- Blog posts live in `content/blog/<slug>/index.md` + `index.zh-cn.md` (legacy blogdown posts such as `ADE_heatmap` use their original filenames)
- Frontmatter: `title`, `date`, `categories`, `tags`, `description`, `toc`
- CV pages: `content/cv/_index.md` + `content/cv/_index.zh-cn.md` (full single-column web CV); styles in `assets/css/custom.css`. Old `/cv/online/` URLs redirect to `/cv/`.

## AI usage disclosure（必填）

每篇博客文章（中英文版本各自）**必须**在正文最前面（标题/日期下方、正文第一段之前）添加一段 AI 使用声明，使用红色 Hextra 警告框 `{{< callout type="error" emoji="🤖" >}}`。

**中文模板**（写入 `index.zh-cn.md`）：

```markdown
{{< callout type="error" emoji="🤖" >}}
**AI 使用声明**：本文的大纲由作者确定，AI 工具（Claude 与 DeepSeek）辅助完成初稿起草与格式整理。作者已审校本文全部内容，并对准确性承担最终责任。
{{< /callout >}}
```

**英文模板**（写入 `index.md`）：

```markdown
{{< callout type="error" emoji="🤖" >}}
**AI disclosure**: The outline of this article was determined by the author. AI tools (Claude and DeepSeek) assisted with drafting the initial manuscript and formatting. The author has reviewed all content and takes final responsibility for its accuracy.
{{< /callout >}}
```

- 用途措辞可按每篇实际 AI 参与程度微调（双语文章可写「初稿起草、中英互译与格式整理」，数据文可加「代码示例」），但须保留「大纲由作者确定」与「作者审校并承担最终责任」表述。
- 仅中文的文章（如协议文）只加中文模板。

## Design conventions

- **Favicon**: pine tree emoji; files in `static/favicon*` + `site.webmanifest`; `layouts/partials/favicons.html` overrides Hextra's head links.
- **Article TOC**: `layouts/partials/toc-left.html` renders H2 only and is `calc(16rem + 1cm)` wide; hidden below `xl` (1280px).
- **Chinese font**: `html:lang(zh-cn) body` in `assets/css/custom.css` uses PingFang SC / Microsoft YaHei / Noto Sans SC.
- **CV page**: single-column serif CV at `/cv/` + `/zh-cn/cv/`; EN uses Georgia, ZH overrides to Times New Roman + SimSun (lining figures). Old `/cv/online/` URLs alias to `/cv/`; PDFs live in `static/files/` and are exported with `scripts/print-cv.mjs`.
- **AI disclosure**: red `type="error"` callout at the very top of every post (see above).

## Commands

```bash
hugo server                    # Dev server at http://localhost:1313
hugo --minify                  # Production build → public/
hugo new blog/my-post/index.md # New post scaffold (if archetypes exist)
node scripts/print-cv.mjs <url> <output.pdf> [footer-left] [en|zh]  # Export CV to A4 PDF (URL: /cv/ or /zh-cn/cv/)
```

## Deployment

- Live: <https://www.songxue-j.com/> (apex 301 → www)
- Push to `main` → Netlify auto-deploys via `netlify.toml`
- Repository: `github.com/SongXue-J/SongXue.com`
- Domain/DNS: Cloudflare Registrar + Cloudflare DNS (DNS only); Netlify hosts the build
- Build command: `hugo`, publish dir: `public/`
- Full deployment/DNS details: `docs/SITE-GUIDE.md` (local, gitignored)

## Subagent architecture

When tasks span multiple domains, spawn agents with clear isolation:

| Agent | Use for | Example |
|-------|---------|---------|
| **content** | Writing/editing posts, translating, managing frontmatter | "Write a post about FlowJo gating strategy" |
| **design** | CSS changes, layout templates, UI polish | "Redesign the homepage hero section" |
| **deploy** | Build, push, verify Netlify deploy, domain config | "Deploy and verify the site is live" |
| **review** | Proofread posts, check links, moderate comments | "Review the new single-cell post for accuracy" |
| **Explore** | Codebase search, finding patterns, research | "Find all posts tagged with 'R'" |

### When to use subagents
- Content changes affecting 3+ files → content agent
- Design iteration with live preview → design agent
- Multi-step deploy + verify → deploy agent
- For research/exploration across the codebase → Explore agent

### When NOT to use
- Single-file edits, typo fixes, minor frontmatter changes
- Tasks the main agent can complete in <3 trivial steps

## Skills

Project-local skills live in `f:/Website/.claude/skills/`.

- **`blog-i18n`**: Format + translate bilingual blog posts. Chinese H3 uses sequential numbering (reset per H2); English H3 uses `X.Y` parent-child numbering. Triggers: 翻译博客, i18n, bilingual, 格式化文稿. Depends on `baoyu-translate`.
- **`publish-tool`**: Package a local project, write bilingual README with GitHub-safe anchors, init git, and publish via GitHub Desktop. Triggers: 发布到 GitHub, 开源项目, publish to GitHub.
- **`baoyu-translate`**: AI translation with glossary support, used internally by `blog-i18n`. Three modes (quick/normal/refined).

## Theme note

Hextra is vendored twice: `themes/hextra/` (used by `theme: "hextra"`) and `themes/github.com/imfing/hextra/` (legacy module copy). `hugo.work` sets `use ../`. Prefer project overrides in `layouts/` and `assets/` over editing either theme copy.
