---
title: "Claude Code + CC Switch + DeepSeek: Full Setup Guide for AI Agent"
date: 2026-05-26
categories: ["ai-agent"]
tags:
- Claude Code
- DeepSeek
- CC Switch
- AI Programming
- Setup Guide
description: "Connect DeepSeek, Xiaomi MiMo, and other models to Claude Code via CC Switch"
---

## 1. Why This Setup?

The primary reason is Anthropic's increasingly strict access restrictions on accounts registered in mainland China, compounded by high subscription costs — though I've never actually subscribed due to the cumbersome process.

With CC Switch + DeepSeek, you get an AI Agent that is affordable, stable, and functionally comparable. This guide should help anyone getting started with this workflow — including my past self.

{{< callout emoji="💡" >}}
**Core Architecture**: Positron IDE → Claude Code CLI → CC Switch Proxy → DeepSeek API (Anthropic-compatible endpoint)
{{< /callout >}}

| Component | Role | Cost |
|-----------|------|------|
| Positron IDE | IDE frontend, runs Claude Code terminal & VS Code extensions | Free / Open source |
| Claude Code CLI | Anthropic's official AI programming assistant | Free (API pay-per-use) |
| CC Switch | Provider switching GUI, routes API calls to third-party models | Free / Open source |
| DeepSeek API | Third-party LLM API with Anthropic-compatible endpoint | ~¥2/M tokens (cache hit) |

{{% details title="**Why Positron?**" closed="true" %}}
My previous experience was mainly with R Studio for R, but its plugin support for AI Agents is still immature. Although packages like [aisdk](https://yulab-smu.top/aisdk/) allow calling LLMs from R Studio, the ecosystem is far less developed than Claude Code's.

Then came Positron, with native R/Python support and a Claude Code extension. While its GUI and some keyboard shortcuts differ from what I was used to in R Studio, the ability to seamlessly integrate Claude into my workflow makes this trade-off entirely acceptable.
{{% /details %}}

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────┐
│              Positron IDE (VS Code Fork)          │
│  ┌─────────────┐  ┌──────────────────────────┐   │
│  │ VS Code Ext  │  │  Terminal (claude cmd)   │   │
│  └──────┬──────┘  └───────────┬──────────────┘   │
└─────────┼─────────────────────┼──────────────────┘
          │                     │
          ▼                     ▼
┌──────────────────────────────────────────────────┐
│        Claude Code CLI (@anthropic-ai/claude-code)│
│        Reads env config from ~/.claude/settings   │
│        ANTHROPIC_BASE_URL → routes to DeepSeek    │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│            CC Switch Desktop App (v3.14+)         │
│   • Manages multiple provider configs             │
│     (DeepSeek/GLM/Xiaomi etc.)                    │
│   • Auto-writes ~/.claude/settings.json           │
│   • Balance check, model switching, local proxy   │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│     DeepSeek API (api.deepseek.com/anthropic)     │
│   • Anthropic Messages API compatible endpoint    │
│   • Model: deepseek-v4-pro (1M context)           │
│   • Model: deepseek-v4-flash (fast response)      │
└──────────────────────────────────────────────────┘
```

### Data Flow

1. Enter `/` commands or natural language in the Claude Code plugin dialog within Positron's terminal
2. Claude Code CLI reads environment variables from `~/.claude/settings.json`, sends API requests to `ANTHROPIC_BASE_URL`
3. Requests arrive at DeepSeek's Anthropic-compatible endpoint, processed in Anthropic Messages API format
4. After DeepSeek model inference, a response in Anthropic format is returned
5. Claude Code CLI parses the response and renders the output in the terminal/IDE

---

## 3. Prerequisites

### 3.1 System Requirements

| Item | Requirement |
|------|-------------|
| OS | Windows 10+ / macOS 12+ / Linux |
| Node.js | v18.0.0 or above (LTS recommended) |
| Disk | ~1GB (Node.js + Claude Code + CC Switch) |
| Network | Access to api.deepseek.com (direct from mainland China) |

### 3.2 Register DeepSeek and Get API Key

1. Open your browser and visit [platform.deepseek.com](https://platform.deepseek.com)
2. Register an account and log in
3. Go to the "API Keys" page and click "Create API Key"
4. Copy the generated `sk-` prefixed key (**shown only once — save it immediately**)

{{< callout type="warning" >}}
You must top up your balance before using the API. Start with ¥10–20 for testing. DeepSeek charges per use; API requests return 401 when balance is insufficient.
{{< /callout >}}

---

## 4. Installation

### 4.1 Install Claude Code

Runoob.com has a detailed and clear guide [here](https://www.runoob.com/claude-code/claude-code-install.html), covering both the official script installation (recommended) and npm installation.

Below is the npm installation flow I used previously, for reference.

#### Install Node.js

Node.js is the runtime environment for Claude Code CLI.

#### Windows

1. Visit [nodejs.org](https://nodejs.org) and download the LTS installer (.msi)
2. Run the installer with all default options
3. **Restart your terminal** and verify:

```bash
node -v   # Should show v18.x.x or v20.x.x or v22.x.x
npm -v    # Should show 9.x.x or 10.x.x
```

#### macOS

```bash
# Recommended: use Homebrew
brew install node@22
# Or download .pkg from nodejs.org
```

#### Common Issue: PowerShell Execution Policy

If Windows PowerShell reports: `cannot be loaded because running scripts is disabled on this system`

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

#### Install Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
```

Verify:

```bash
claude -v   # Shows version number
```

After installation, the global config directory is located at:

- **Windows**: `C:\Users\<username>\.claude\`
- **macOS/Linux**: `~/.claude/`

Key config files:
- `settings.json` — Main config (environment variables, permissions, etc.)
- `settings.local.json` — Local overrides (not synced)
- `CLAUDE.md` — Project or global coding guidelines

---

### 4.2 Download and Install CC Switch

#### Download

CC Switch is an open-source desktop app (GitHub: [farion1231/cc-switch](https://github.com/farion1231/cc-switch)) for one-click model provider switching in Claude Code.

- **Releases**: [github.com/farion1231/cc-switch/releases](https://github.com/farion1231/cc-switch/releases)

| Platform | File | Install |
|----------|------|---------|
| Windows | `.msi` installer or `.zip` portable | Double-click .msi to install |
| macOS | `.dmg` | Drag to Applications |
| Linux | `.AppImage` | `chmod +x *.AppImage && ./*.AppImage` |

#### Configure DeepSeek Provider

1. Open CC Switch, click the **"+"** button (top right) to add a provider
2. Select **DeepSeek** from presets, or fill in manually:

| Setting | Value | Notes |
|---------|-------|-------|
| Base URL | `https://api.deepseek.com/anthropic` | Must include /anthropic path |
| Auth Type | ANTHROPIC_AUTH_TOKEN | Token-based auth |
| API Key | `sk-xxxxxxxx` | Your DeepSeek key |
| API Format | Anthropic Messages | Anthropic-compatible format |
| Default Model | `deepseek-v4-pro[1m]` | Primary model, 1M context |
| Haiku Model | `deepseek-v4-flash` | Fast lightweight model |
| Sonnet Model | `deepseek-v4-pro` | Mid-tier tasks |
| Opus Model | `deepseek-v4-pro` | Complex tasks |

3. Check **"Write to common config"**, click **"Add"**
4. Back on the main screen, select the newly added DeepSeek and click **"Enable"**

{{< callout emoji="💡" >}}
**What CC Switch does**: It automatically writes the above configuration into the `env` field of `~/.claude/settings.json`. Claude Code reads these environment variables on startup.
{{< /callout >}}

{{% details title="Manual settings.json (optional alternative)" closed="true" %}}
If you prefer not to use the CC Switch GUI, you can edit the config file directly. Add the following to `~/.claude/settings.json`:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-your-deepseek-key",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_REASONING_MODEL": "deepseek-v4-pro"
  }
}
```

{{% /details %}}

---

### 4.3 Install Positron IDE

#### Installation Steps

1. Visit [positron.posit.co](https://positron.posit.co) to download the installer for your platform
2. Launch Positron after installation
3. In the sidebar extensions page, install the **Claude Code for VS Code** extension — verify the publisher is Anthropic

#### Using Claude Code in Positron

| Mode | Description | Best For |
|------|-------------|----------|
| **A. Terminal** | Run `claude` directly in the terminal | Daily coding assistance, file operations, project search |
| **B. VS Code Extension** | Install Claude Code for VS Code extension, use from sidebar | IDE-integrated workflow, editor panel integration |

#### A. Terminal Mode (Recommended)

```bash
claude
```

Start an interactive session:

```
> Refactor the validateInput function in src/utils.ts for better readability
> /memory    # View and manage memories
> /model     # Check current model
> /help      # Show all commands
```

---

## 5. Verify Configuration

### 5.1 Verify CLI Startup

```bash
claude
```

In the interactive session, ask:

```
> What model are you using?
```

{{< callout emoji="✅" >}}
**Expected response**: Model is `deepseek-v4-pro`, context window **1,048,576 tokens (1M)**, provided by DeepSeek.
{{< /callout >}}

### 5.2 Verify API Connectivity

```
> Write a Python function to compute the Fibonacci sequence and print the first 20 terms
```

If it returns correct code and output, the API connection is working properly.

### 5.3 Model Selection Strategy

| Scenario | Recommended Model | Why |
|----------|-------------------|-----|
| Single-file scripts, log analysis | `deepseek-v4-flash` | Fast response (<800ms), very low cost |
| Multi-file refactoring, architecture | `deepseek-v4-pro[1m]` | 1M context, understands 50+ files |
| Complex algorithms, deep technical analysis | `deepseek-v4-pro[thinking]` | Activates dynamic reasoning chain |
| Long documents + reasoning | `deepseek-v4-pro[1m][thinking]` | Max context + deep reasoning |

In my experience, switching models via `/model` in the sidebar is unreliable. Editing model names or switching providers directly in CC Switch is more effective. After saving changes, wait 1–2 minutes before continuing.

---

## 6. Other Features

### 6.1 Multi-Provider Management

CC Switch supports configuring multiple providers simultaneously:

| Provider | Endpoint | Notes |
|----------|----------|-------|
| DeepSeek | `api.deepseek.com/anthropic` | Best value, V4-Pro 1M context |
| Zhipu GLM | `open.bigmodel.cn/api/anthropic` | GLM-5, strong general ability |
| Xiaomi MiMo | `api.xiaomimimo.com/anthropic` | MiMo-V2.5-Pro, lower price for coding |

After adding multiple providers in CC Switch, you can switch between them at any time.

### 6.2 Skills and Plugins

Claude Code supports installing Skills (skill sets) to extend functionality. I may publish a separate article on using and building Skills in the future.

Many users publish their own Skills, but for security and usability reasons, I strongly recommend reading the documentation and reviewing the structure before installing any Skills.

---

## 7. Troubleshooting

### Problem 1: `claude` command not found

```bash
npm list -g --depth=0
npm bin -g  # Add this path to your PATH
```

### Problem 2: `401 Unauthorized`

Cause: Invalid API Key or insufficient balance. Check at [platform.deepseek.com](https://platform.deepseek.com).

### Problem 3: `Connection refused` or `model not found`

- **Base URL missing `/anthropic` path** — Ensure it is `https://api.deepseek.com/anthropic`
- **Model name typo** — Confirm: `deepseek-v4-pro`, `deepseek-v4-flash`

### Problem 4: PowerShell script execution error

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

---

## 8. Security

{{< callout type="warning" >}}
- API Key is stored in `~/.claude/settings.json` — **never share or upload it to a public repository**
- Consider storing the key in `settings.local.json` instead of `settings.json`
- Rotate your API Key periodically
{{< /callout >}}

---

## Appendix: Core Config Reference

### `~/.claude/settings.json`

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-your-deepseek-api-key",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_REASONING_MODEL": "deepseek-v4-pro"
  }
}
```

---

## Resources

| Resource | Link |
|----------|------|
| Claude Code Docs | [docs.anthropic.com/en/docs/claude-code](https://docs.anthropic.com/en/docs/claude-code) |
| CC Switch GitHub | [github.com/farion1231/cc-switch](https://github.com/farion1231/cc-switch) |
| DeepSeek Platform | [platform.deepseek.com](https://platform.deepseek.com) |
| Positron IDE | [positron.posit.co](https://positron.posit.co) |
| Node.js Download | [nodejs.org](https://nodejs.org) |
