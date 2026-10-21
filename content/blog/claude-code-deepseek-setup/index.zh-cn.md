---
title: "Claude Code + CC Switch + DeepSeek AI Agent 全流程配置教程"
date: 2026-05-26
categories: ["ai-agent"]
tags:
- Claude Code
- DeepSeek
- CC Switch
- AI 编程
- 配置教程
description: "通过 CC Switch 将 DeepSeek/ Xiaomi MiMo 等模型接入 Claude Code"
---

{{< callout type="error" emoji="🤖" >}}
**AI 使用声明**：本文的大纲由作者确定，AI 工具（Claude 与 DeepSeek）辅助完成初稿起草与格式整理。作者已审校本文全部内容，并对准确性承担最终责任。
{{< /callout >}}

## 一、 概述：为什么需要这套方案？

首先是因为 Anthropic 对中国大陆账号愈发严格的禁用管控，其次是因为高昂的订阅费用（尽管由于繁琐的订阅流程，我并没有实际订阅过）。

在这份教程中，通过 CC Switch + DeepSeek 的组合，可以得到便宜、稳定且功能相近的 AI Agent，我认为这对于刚刚接触这部分工作流的新手（包括曾经的我）来说，这会是有帮助的。

{{< callout emoji="💡" >}}
**核心架构**：Positron IDE → Claude Code CLI → CC Switch 代理 → DeepSeek API（Anthropic 兼容端点）
{{< /callout >}}

| 组件 | 角色 | 费用 |
|------|------|------|
| Positron IDE | IDE 前端，运行 Claude Code 终端 & VS Code 扩展 | 免费开源 |
| Claude Code CLI | Anthropic 官方 AI 编程助手 | 免费（API 按量计费） |
| CC Switch | 供应商切换 GUI 工具，将 API 调用路由到第三方模型 | 免费开源 |
| DeepSeek API | 第三方大模型 API，提供 Anthropic 兼容端点 | ~¥2/百万 token（缓存命中） |


{{% details title="**为什么选择 Positron**" closed="true" %}}
我此前接触的主要是基于 R Studio 的 R 语言工作环境，但其对 AI Agent 的插件支持并不成熟。尽管有类似 [aisdk](https://yulab-smu.top/aisdk/) 等支持在 R Studio 中调用大模型的 R 包，其社区生态与 Claude Code 相比还并不完善。

这时，Positron 带着原生对 R/Python 的支持和 Claude Code 插件来到了我的面前。尽管其 GUI 和部分快捷键操作与我习惯的 R Studio 并不相同，但考虑到能够在工作流中丝滑接入 Claude，这种代价是完全可以接受的。

{{% /details %}}

---

## 二、 架构总览

```
┌──────────────────────────────────────────────────┐
│              Positron IDE (VS Code Fork)          │
│  ┌─────────────┐  ┌──────────────────────────┐   │
│  │ VS Code 扩展 │  │  内置终端 (claude 命令)  │   │
│  └──────┬──────┘  └───────────┬──────────────┘   │
└─────────┼─────────────────────┼──────────────────┘
          │                     │
          ▼                     ▼
┌──────────────────────────────────────────────────┐
│        Claude Code CLI (@anthropic-ai/claude-code)│
│        读取 ~/.claude/settings.json 中的 env 配置  │
│        ANTHROPIC_BASE_URL → 路由到 DeepSeek       │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│            CC Switch Desktop App (v3.14+)         │
│   • 管理多个供应商配置（DeepSeek/GLM/小米等）      │
│   • 自动写入 ~/.claude/settings.json              │
│   • 余额查询、模型切换、本地路由代理                │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│     DeepSeek API (api.deepseek.com/anthropic)     │
│   • Anthropic Messages API 兼容端点               │
│   • 模型：deepseek-v4-pro (1M上下文)              │
│   • 模型：deepseek-v4-flash (快速响应)             │
└──────────────────────────────────────────────────┘
```

### 数据流说明

1. 在 Positron 终端的 Claude Code 插件对话界面中输入 `/` 命令或自然语言指令
2. Claude Code CLI 读取 `~/.claude/settings.json` 中的环境变量，将 API 请求发往 `ANTHROPIC_BASE_URL`
3. 请求到达 DeepSeek 的 Anthropic 兼容端点，按 Anthropic Messages API 格式处理
4. DeepSeek 模型推理后，返回符合 Anthropic 格式的响应
5. Claude Code CLI 解析响应，在终端/IDE 中渲染输出

---

## 三、 准备工作

### 1. 系统要求

| 项目 | 要求 |
|------|------|
| 操作系统 | Windows 10+ / macOS 12+ / Linux |
| Node.js | v18.0.0 及以上（推荐 LTS 版本） |
| 磁盘空间 | 约 1GB（Node.js + Claude Code + CC Switch） |
| 网络 | 可访问 api.deepseek.com（国内网络直接连接） |

### 2. 注册 DeepSeek 并获取 API Key

1. 打开浏览器访问 [platform.deepseek.com](https://platform.deepseek.com)
2. 注册账号并登录
3. 进入「API Keys」页面，点击「创建 API Key」
4. 复制生成的 `sk-` 开头的密钥（**仅显示一次，务必保存**）

{{< callout type="warning" >}}
需要先充值才能使用 API。建议首次充值 ¥10-20 测试。DeepSeek 按量计费，余额不足时 API 请求会返回 401 错误。
{{< /callout >}}

---

## 四、 正式安装

### 1. 安装 Claude Code

菜鸟教程有一份很详细清晰的文档[在这里](https://www.runoob.com/claude-code/claude-code-install.html)，分别对官方脚本安装（推荐）和 npm 安装两种途径进行的描述。

以下内容记录了我此前用 npm 安装的流程，可以参考。

#### 1.1 安装 Node.js

Node.js 是 Claude Code CLI 的运行环境。

#### Windows

1. 访问 [nodejs.org](https://nodejs.org)，下载 LTS 版本安装包（.msi）
2. 运行安装程序，全部默认选项即可
3. 安装完成后**重启终端**验证：

```bash
node -v   # 应显示 v18.x.x 或 v20.x.x 或 v22.x.x
npm -v    # 应显示 9.x.x 或 10.x.x
```

#### macOS

```bash
# 推荐使用 Homebrew
brew install node@22
# 或从 nodejs.org 下载 .pkg 安装包
```

#### 常见问题：PowerShell 执行策略

如果 Windows PowerShell 运行脚本报错：`无法加载文件，因为在此系统上禁止运行脚本`

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

#### 1.2 安装 Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
```

验证：

```bash
claude -v   # 显示版本号
```

安装后，Claude Code 的全局配置目录位于：

- **Windows**: `C:\Users\<用户名>\.claude\`
- **macOS/Linux**: `~/.claude/`

关键配置文件：
- `settings.json` — 主配置文件（环境变量、权限等）
- `settings.local.json` — 本地覆盖（不会被同步）
- `CLAUDE.md` — 项目或全局编码准则

---

### 2. 下载安装 CC Switch

#### 2.1 下载

CC Switch 是开源桌面应用（GitHub: [farion1231/cc-switch](https://github.com/farion1231/cc-switch)），用于给 Claude Code 一键切换模型供应商。

- **发布页面**：[github.com/farion1231/cc-switch/releases](https://github.com/farion1231/cc-switch/releases)

| 平台 | 下载文件 | 安装方式 |
|------|---------|---------|
| Windows | `.msi` 安装版 或 `.zip` 便携版 | 双击 .msi 安装 |
| macOS | `.dmg` | 拖入 Applications |
| Linux | `.AppImage` | `chmod +x *.AppImage && ./*.AppImage` |

#### 2.2 配置 DeepSeek 供应商

1. 打开 CC Switch，点击右上角 **「+」** 按钮添加供应商
2. 在预设列表中选择 **DeepSeek**，或手动填写以下参数：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| Base URL | `https://api.deepseek.com/anthropic` | 必须包含 /anthropic 路径 |
| 认证类型 | ANTHROPIC_AUTH_TOKEN | 使用 token 认证 |
| API Key | `sk-xxxxxxxx` | 你的 DeepSeek 密钥 |
| API 格式 | Anthropic Messages | Anthropic 兼容格式 |
| 默认模型 | `deepseek-v4-pro[1m]` | 主力模型，支持 1M 上下文 |
| Haiku 模型 | `deepseek-v4-flash` | 快速轻量模型 |
| Sonnet 模型 | `deepseek-v4-pro` | 中等任务 |
| Opus 模型 | `deepseek-v4-pro` | 复杂任务 |

3. 勾选 **「写入通用配置」**，点击 **「添加」**
4. 回到主界面，选择刚添加的 DeepSeek，点击 **「启用 (Enable)」**

{{< callout emoji="💡" >}}
**CC Switch 做了什么**：它将上述配置自动写入 `~/.claude/settings.json` 的 `env` 字段，Claude Code 启动时会读取这些环境变量。
{{< /callout >}}


---

{{% details title="手动配置 settings.json（可选替代方案）" closed="true" %}}
如果你不想用 CC Switch GUI，也可以直接手动编辑配置文件。在 `~/.claude/settings.json` 中添加：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-你的DeepSeek密钥",
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

### 3. 安装 Positron IDE

#### 3.1 安装步骤

1. 访问 [positron.posit.co](https://positron.posit.co) 下载对应系统的安装包
2. 安装后启动 Positron
3. 在侧边栏的插件页面选择 **Claude Code for VS Code** 插件进行安装，注意核对开发者为 Anthropic。

#### 3.2 在 Positron 中使用 Claude Code

| 方式 | 说明 | 适用场景 |
|------|------|---------|
| **A. 终端模式** | 在终端中直接输入 `claude` 启动交互会话 | 日常编码辅助、文件操作、项目搜索 |
| **B. VS Code 扩展模式** | 安装 Claude Code for VS Code 扩展，侧边栏使用 | 嵌入 IDE 工作流、与编辑器面板联动 |

#### A. 终端模式（推荐）

```bash
claude
```

启动后即可进行交互式对话：

```
> 帮我重构 src/utils.ts 中的 validateInput 函数，提高可读性
> /memory    # 查看和管理记忆
> /model     # 查看当前使用的模型
> /help      # 查看所有命令
```

---

## 五、 验证配置

### 1. 验证 CLI 启动

```bash
claude
```

进入交互会话后，询问：

```
> 你当前使用的是什么模型？
```

{{< callout emoji="✅" >}}
**预期响应**：模型为 `deepseek-v4-pro`，上下文窗口 **1,048,576 tokens (1M)**，由 DeepSeek 提供。
{{< /callout >}}

### 2. 验证 API 连通性

```
> 用 Python 写一个计算斐波那契数列的函数，并打印前 20 项
```

如果返回正确的代码和结果，说明 API 连接正常。

### 3. 模型选择策略

| 场景 | 推荐模型 | 原因 |
|------|---------|------|
| 单文件脚本修复、日志分析 | `deepseek-v4-flash` | 响应快 (<800ms)，成本极低 |
| 多文件重构、架构设计 | `deepseek-v4-pro[1m]` | 1M 上下文，可理解 50+ 文件 |
| 复杂算法、深度技术分析 | `deepseek-v4-pro[thinking]` | 激活动态推理链 |
| 超长文档精读 + 推理 | `deepseek-v4-pro[1m][thinking]` | 最大上下文 + 深度推理 |

我在使用时发现，在侧边栏界面中用 /model 切换模型并不靠谱，在 CC Switch 中编辑模型名称/更改供应商是更有效的选择。一般在调整设置并保存后等 1-2 分钟后即可继续使用。

---

## 六、其他功能

### 1. 多供应商管理

CC Switch 支持同时配置多个供应商：

| 供应商 | 端点 | 特点 |
|--------|------|------|
| DeepSeek | `api.deepseek.com/anthropic` | 性价比最高，V4-Pro 1M 上下文 |
| 智谱 GLM | `open.bigmodel.cn/api/anthropic` | 国产模型，GLM-5 综合能力强 |
| 小米 MiMo | `api.xiaomimimo.com/anthropic` | MiMo-V2.5-Pro，编码版本价格更低 |

在 CC Switch 中添加多个供应商后，可以随时一键切换。

### 2. Skills 和插件

Claude Code 支持安装 Skills（技能集）来扩展功能。关于 Skills 的使用和构建，我后续或许也会发布一篇单独的文章。

有许多使用者会发布自己编写的 Skills，但出于安全性和使用便利性的考虑，我强烈建议在下载安装 Skills 前仔细阅读其文档和大致结构。

---

## 七、 常见问题排查

### 问题 1：`claude` 命令找不到

```bash
npm list -g --depth=0
npm bin -g  # 将此路径加入 PATH
```

### 问题 2：`401 Unauthorized`

原因：API Key 无效或余额不足。登录 [platform.deepseek.com](https://platform.deepseek.com) 检查。

### 问题 3：`Connection refused` 或 `model not found`

- **Base URL 缺少 `/anthropic` 路径** — 确保是 `https://api.deepseek.com/anthropic`
- **模型名称拼写错误** — 确认是 `deepseek-v4-pro`、`deepseek-v4-flash`

### 问题 4：PowerShell 运行脚本报错

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

---

## 八、 安全建议

{{< callout type="warning" >}}
- API Key 存储在 `~/.claude/settings.json` 中，**切勿分享或上传到公开仓库**
- 建议将密钥配置在 `settings.local.json` 而非 `settings.json`
- 定期轮换 API Key
{{< /callout >}}

---

## 附录：核心配置文件参考

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

## 资源链接

| 资源 | 链接 |
|------|------|
| Claude Code 官方文档 | [docs.anthropic.com/en/docs/claude-code](https://docs.anthropic.com/en/docs/claude-code) |
| CC Switch GitHub | [github.com/farion1231/cc-switch](https://github.com/farion1231/cc-switch) |
| DeepSeek 平台 | [platform.deepseek.com](https://platform.deepseek.com) |
| Positron IDE | [positron.posit.co](https://positron.posit.co) |
| Node.js 下载 | [nodejs.org](https://nodejs.org) |
