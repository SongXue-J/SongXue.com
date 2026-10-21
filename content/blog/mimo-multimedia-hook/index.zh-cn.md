---
title: "Claude Code 接入 MIMO 模型：通过 PreToolUse Hook 解决多媒体识别问题"
date: 2026-06-03
categories: ["ai-agent"]
tags:
- Claude Code
- MIMO
- MCP
- Hook
- 多媒体识别
description: "在原作者 MCP 方案基础上，通过 PreToolUse Hook 解决 Agent 直接读取多媒体文件的问题"
---

{{< callout type="error" emoji="🤖" >}}
**AI 使用声明**：本文的大纲由作者确定，AI 工具（Claude 与 DeepSeek）辅助完成初稿起草与格式整理。作者已审校本文全部内容，并对准确性承担最终责任。
{{< /callout >}}

{{< callout emoji="🙏" >}}
**致谢**：本教程基于 [congxxx](https://github.com/congxxx) 开发的 **mimo-media-recognition-mcp** 项目。[原作者的文章](https://www.cnblogs.com/congxinxue/p/20086413)

原项目地址：[https://github.com/congxxx/mimo-media-recognition-mcp](https://github.com/congxxx/mimo-media-recognition-mcp)

本文在原方案基础上，补充了 **PreToolUse Hook 机制**，解决了 Agent 在长任务推理中直接读取多媒体文件导致报错的问题。
{{< /callout >}}

## 一、 问题背景


### 1. 核心矛盾

书接上文[Claude Code 配置教程]({{< relref "blog/claude-code-deepseek-setup" >}})，在将 DeepSeek 接入 Claude Code 后，出现了一个新的问题：DeepSeek V4pro 并不是多模态模型，这意味着其无法原生支持多媒体内容——比如图片、音频或视频的读取。


### 2. 原作者的解决方案

通过联网搜索，我看到[congxxx](https://github.com/congxxx) 提出了一个优雅的架构：

```
Claude Code (mimo-v2.5-pro)       ← 主对话，推理能力强
    ↓ 发现需要识图/音频/视频
    ↓ 调用 MCP
MIMO Media Recognition MCP        ← 专职多媒体识别
    ↓ 调用 MIMO API (mimo-v2-omni)
    ↓ 返回识别结果（文本）
Claude Code 继续对话               ← 上下文不中断
```

通过 MCP 协议，主模型（原方案中是小米的 mimo-v2.5-pro）保持 pro 版本的推理能力，多媒体识别交给 omni 模型，两者各司其职。
听上去很棒，我因地制宜做了一些改动后，将其部署在本地。

在显式指定调用 MCP 来理解图片时，这套方案的表现很好。比如，我让 Agent 查看 MIMO 官网的这张模型优势概览图：

![MIMO Model Advantages](/blog/mimo-multimedia-hook/ref_image.png)

Agent 调用了 `mcp__mimo-media__understand_image`，返回了详细的文字描述：页面结构（含导航栏和标题）、四张优势卡片的内容（原生全模态感知、1M 上下文、全模态代理能力、性能效率兼具）、以及右侧 8 个性能基准柱状图的具体数值（Image Understanding、Multimodal Agent、Video Understanding 三个维度，MiMo-V2.5 与竞品的对比数据）。

整个过程无需我手动截图说明，Agent 直接基于 MCP 返回的文本完成了后续推理。


### 3. 遗留问题：Agent 的"自作主张"

但在实际的长任务推理中，出现了一个棘手的问题：

{{< callout type="warning" >}}
**Agent 会"自作主张"**

当 Agent 在多步骤任务中遇到图片/音频/视频文件时，它倾向于直接使用 `Read` 工具读取文件内容——而不是调用 MCP 工具。

由于主模型是纯文本模型，`Read` 返回的二进制数据无法被理解，导致：
- 报错：模型无法处理图片输入
- 信息丢失：Agent 跳过多媒体内容继续推理
- 结果不完整：关键的视觉/音频信息被忽略
{{< /callout >}}

问题根源：**Claude Code 的 Agent 默认会尝试用内置的 `Read` 工具处理所有文件**，它并不"知道"当前模型不支持多媒体输入。

---

## 二、 解决思路：双层防御

### 第一层：CLAUDE.md 软指令

在全局指令文件中明确告诉模型：

- 遇到哪些文件类型必须用 MCP
- 禁止用 Read 打开多媒体文件
- 给出正确的调用示例

**局限**：依赖模型"记住"指令，在复杂推理链中可能被忽略。

### 第二层：PreToolUse Hook 硬拦截

在 `settings.json` 中配置 Hook：

- 拦截所有 `Read` 工具调用
- 检查目标文件是否为多媒体格式
- 如果是 → 阻止调用（exit 2）并返回错误信息
- 错误信息中包含正确的 MCP 工具名称

**优势**：系统级拦截，不依赖模型的"自觉性"。

### 工作流程图

```
Agent 遇到图片路径 "screenshot.png"
    │
    ├─ 第一层：CLAUDE.md 指令引导
    │   "应该用 mcp__mimo-media__understand_image"
    │
    ├─ 如果 Agent 仍然尝试 Read("screenshot.png")
    │
    └─ 第二层：PreToolUse Hook 拦截
        │
        ├── 检测到 .png 扩展名
        ├── exit 2（阻止调用）
        └── stderr: "BLOCKED: Use mcp__mimo-media__understand_image"
                │
                └── Agent 看到反馈 → 改用 MCP 工具
                    │
                    └── MCP 返回文本描述 → 继续推理
```

---

## 三、 完整配置步骤

### 1. 前置条件

```bash
# 检查 Claude Code
claude --version

# 检查 Python
python --version

# 检查 Git
git --version
```

### 2. 安装 MCP Server（同原方案）

```bash
# 1. 克隆项目
git clone https://github.com/congxxx/mimo-media-recognition-mcp.git
cd mimo-media-recognition-mcp

# 2. 安装依赖
pip install uv
uv venv .venv
uv pip install -e .
```

### 3. 注册 MCP Server

```bash
claude mcp add mimo-media \
  --scope user \
  --env MIMO_API_KEY="你的API密钥" \
  --env MIMO_API_BASE="https://token-plan-cn.xiaomimimo.com/v1" \
  --env MIMO_MODEL="mimo-v2.5" \
  -- "你的python解释器路径" \
  -m mimo_media_recognition_mcp.server

# 可选：如需对短音频使用专用 ASR 模型（实时转写），添加以下环境变量：
# --env MIMO_ASR_MODEL="mimo-v2.5-asr" \
# --env MIMO_ASR_LANGUAGE="zh"
```

{{< callout emoji="💡" >}}
**模型选择说明**：
- `MIMO_MODEL` 设为 `mimo-v2.5`（通用多模态理解，**默认用于音频转写**）
- `mimo-v2.5` 通过思维链推理产生高质量完整转写，适合长录音、会议记录等场景
- **不建议默认开启 ASR 模式**：`mimo-v2.5-asr` 在长音频（>2 分钟）上容易产生重复循环
- 仅在需要短音频实时转写时，才配置 `MIMO_ASR_MODEL` 和 `MIMO_ASR_LANGUAGE`
{{< /callout >}}

验证安装：

```bash
claude mcp get mimo-media
# 应显示：Status: ✓ Connected
```

### 4. 创建 PreToolUse Hook（本方案新增）

**3.4.1 创建 Hook 脚本**

在 `~/.claude/hooks/` 目录下创建 `block_media_read.py`：

```python
"""
PreToolUse hook: Block Read tool on multimedia files.

When the agent tries to Read an image/audio/video file, this hook
blocks the call (exit 2) and instructs the model to use the
mimo-media MCP tools instead.
"""
import sys, json

MEDIA_MAP = {
    ".png": ("image", "understand_image"),
    ".jpg": ("image", "understand_image"),
    ".jpeg": ("image", "understand_image"),
    ".gif": ("image", "understand_image"),
    ".bmp": ("image", "understand_image"),
    ".webp": ("image", "understand_image"),
    ".svg": ("image", "understand_image"),
    ".mp3": ("audio", "understand_audio"),
    ".wav": ("audio", "understand_audio"),
    ".m4a": ("audio", "understand_audio"),
    ".ogg": ("audio", "understand_audio"),
    ".flac": ("audio", "understand_audio"),
    ".aac": ("audio", "understand_audio"),
    ".mp4": ("video", "understand_video"),
    ".mov": ("video", "understand_video"),
    ".avi": ("video", "understand_video"),
    ".mkv": ("video", "understand_video"),
    ".webm": ("video", "understand_video"),
    ".flv": ("video", "understand_video"),
}

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

tool_input = data.get("tool_input", {})
file_path = tool_input.get("file_path", "") or tool_input.get("path", "")
if not file_path:
    sys.exit(0)

ext = ""
if "." in file_path:
    ext = "." + file_path.rsplit(".", 1)[-1].lower()

if ext in MEDIA_MAP:
    media_type, mcp_tool = MEDIA_MAP[ext]
    print(
        f"BLOCKED: The Read tool cannot process {media_type} files. "
        f"Use the MCP tool `mcp__mimo-media__{mcp_tool}` instead. "
        f"Example: call mcp__mimo-media__{mcp_tool} with "
        f'{{"prompt": "describe this {media_type}", "{media_type}_path": "{file_path}"}}',
        file=sys.stderr
    )
    sys.exit(2)

sys.exit(0)
```

**3.4.2 注册 Hook**

编辑 `~/.claude/settings.json`，添加 `hooks` 字段：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "python ~/.claude/hooks/block_media_read.py",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

{{< callout emoji="💡" >}}
**Hook 工作原理**：

- `matcher: "Read"` — 匹配所有 `Read` 工具的调用
- Hook 脚本通过 stdin 接收工具输入的 JSON
- 检查 `file_path` 的扩展名是否命中多媒体格式
- 命中 → `exit 2`（阻止调用）+ stderr 输出引导信息
- 未命中 → `exit 0`（正常放行）

当 Hook 返回 `exit 2` 时，Agent 会看到：

> BLOCKED: The Read tool cannot process image files. Use the MCP tool `mcp__mimo-media__understand_image` instead.

Agent 收到这个反馈后，会自动改用正确的 MCP 工具。
{{< /callout >}}

### 5. 更新 CLAUDE.md 指令（本方案新增）

在全局 `~/.claude/CLAUDE.md` 末尾添加多媒体处理规则：

````markdown
## 多媒体文件处理（强制）

当前推理模型是纯文本模型，**无法直接理解图片、音频、视频**。

### 铁律：遇到多媒体文件必须调用 MCP

- **图片** (.png, .jpg, .jpeg, .gif, .bmp, .webp, .svg) → 使用 `mcp__mimo-media__understand_image`
- **音频** (.mp3, .wav, .m4a, .ogg, .flac, .aac) → 使用 `mcp__mimo-media__understand_audio`
- **视频** (.mp4, .mov, .avi, .mkv, .webm, .flv) → 使用 `mcp__mimo-media__understand_video`

### 禁止行为

- **禁止**用 `Read` 工具打开上述格式的文件（会被 hook 拦截）
- **禁止**尝试自行"解读"二进制多媒体内容
- **禁止**假设图片/音频/视频的内容

### 正确流程

1. 识别到多媒体文件路径
2. 根据扩展名选择对应的 MCP 工具
3. 调用 MCP 工具获取理解结果
4. 基于 MCP 返回的文本结果继续推理

### 示例

```bash
# 错误 ❌
Read("screenshot.png")

# 正确 ✅
mcp__mimo-media__understand_image(prompt="描述这张图片", image_path="screenshot.png")
```

````

### 6. 验证配置

```bash
# 验证 MCP 连接
claude mcp get mimo-media

# 测试 Hook 脚本
echo '{"tool_name": "Read", "tool_input": {"file_path": "test.png"}}' | \
  python ~/.claude/hooks/block_media_read.py 2>&1
# 预期输出：BLOCKED: The Read tool cannot process image files...
# 预期退出码：2

# 测试普通文件不受影响
echo '{"tool_name": "Read", "tool_input": {"file_path": "readme.md"}}' | \
  python ~/.claude/hooks/block_media_read.py 2>&1
# 预期输出：（空）
# 预期退出码：0
```

---

## 四、 与原方案的对比

| 维度 | 原方案（congxxx） | 本方案（补充 Hook） |
|------|-------------------|---------------------|
| MCP Server | ✅ 已配置 | ✅ 已配置（同原方案） |
| 显式调用 MCP | ✅ 正常工作 | ✅ 正常工作 |
| CLAUDE.md 指令 | — | ✅ 新增，引导 Agent 主动选择 MCP |
| PreToolUse Hook | — | ✅ 新增，系统级拦截错误的 Read 调用 |
| 长任务中的多媒体处理 | ⚠️ Agent 可能绕过 MCP | ✅ 双层防御，确保走 MCP |
| 配置复杂度 | 低 | 中（多一个 Hook 脚本 + CLAUDE.md 配置） |

---

## 五、 踩坑记录

### 1. Hook 脚本中的路径问题

**现象**：Hook 脚本在 Windows 上运行时，路径分隔符不一致

**原因**：Claude Code 在 Windows 上通过 Git Bash 执行 Hook，路径可能是 `/c/Users/...` 格式

**解决**：Hook 脚本中只检查文件扩展名，不依赖路径格式，因此不受影响

### 2. Hook 不生效

**现象**：配置了 Hook 但 Agent 仍然直接 Read 图片

**排查步骤**：

1. 确认 `settings.json` 中 `hooks` 字段格式正确
2. 确认 Hook 脚本路径可被 Python 访问
3. 重启 Claude Code 会话（Hook 配置需要重新加载）

### 3. Audio 转写返回无关内容（2026-07-06 更新）

**现象**：调用 `understand_audio` 转写中文录音，每次都返回无意义的英文回复（如"咖啡店点单对话"、"我无法处理音频"等），与实际录音内容完全无关。

**排查过程**：

1. 确认文件存在且格式正确（2.1MB，MP3，约 9 分钟通话录音）
2. 通过 MCP 配置资源 `mimo://config` 确认 API 连通性正常
3. 直接阅读 MCP Server 源码（`server.py`），发现 **两个关键问题**：

**根因 A：`[:80]` 截断 bug**

```python
# server.py 第 165 行（修复前）
content_blocks.append({
    "type": "text",
    "text": f"[Audio file: {media_url[:80]}...]",  # ← 只取了前 80 字符！
})
```

2.1MB MP3 → base64 编码后约 3MB，但 `[:80]` 只发送了 80 字符的 data URL 前缀：
`data:audio/mpeg;base64,//uQxAAA...` — 模型收到的只有一个文本标记，没有真正的音频数据。

**根因 B：API 格式错误**

查阅 [MIMO 官方文档](https://mimo.mi.com/docs/zh-CN/quick-start/usage-guide/multimodal-understanding/audio-understanding) 后发现，MIMO 的 Anthropic API（`/anthropic/v1/messages`）**只支持 text 和 image 两种 content block**，不直接支持音频输入。

正确做法是使用 OpenAI 兼容端点（`/v1/chat/completions`）的 `input_audio` content block：

```json
// ❌ MCP Server 旧格式（text 包装，走 Anthropic endpoint）
{"type": "text", "text": "[Audio file: data:audio/mpeg;base64,<截断>]"}
// API 返回：模型无法理解音频

// ✅ MIMO 官方格式（input_audio，走 OpenAI endpoint）
{"type": "input_audio", "input_audio": {"data": "data:audio/mpeg;base64,<完整base64>"}}
// API 返回：正确的转写文字
```

**修复**：

对 `server.py` 进行了架构级重写：

| 组件 | 修复前 | 修复后 |
|------|--------|--------|
| 图片 | Anthropic endpoint（正常） | 不变 |
| 音频/视频 | Anthropic endpoint + `type: "text"` + `[:80]` 截断 | **OpenAI endpoint** + `type: "input_audio"/"input_video"` + 完整 base64 |
| ASR 支持 | 无 | 通过 `MIMO_ASR_MODEL` 和 `MIMO_ASR_LANGUAGE` 环境变量控制 |
| 超时 | 120s | 300s（大音频文件需要更长时间） |

#### 附：ASR 模型的适用场景

经过实测对比，`mimo-v2.5-asr` 和 `mimo-v2.5` 在转写任务上的表现差异显著：

| 维度 | `mimo-v2.5-asr` | `mimo-v2.5` |
|------|-----------------|-------------|
| 长音频（>2min） | ❌ 严重重复循环 | ✅ 完整准确 |
| 短音频（<2min） | ✅ 快速实时 | ✅ 效果相当 |
| 转写方式 | 端到端序列解码 | 思维链推理辅助 |
| 输出控制 | 弱（无 prompt 约束） | 强（prompt 可控） |

**建议**：默认关闭 `MIMO_ASR_MODEL`，让 `understand_audio` 使用 `mimo-v2.5` 的思维链转写。仅在对短音频有实时性需求时才开启 ASR 模式。

---

## 六、 配置文件速查

### 文件清单

| 文件 | 作用 |
|------|------|
| `~/.claude/settings.json` | Hook 注册 + 全局设置 |
| `~/.claude/CLAUDE.md` | 全局指令（含多媒体规则） |
| `~/.claude/hooks/block_media_read.py` | Hook 脚本 |
| MCP Server 项目目录 | mimo-media-recognition-mcp |

---

## 七、 总结

{{< callout emoji="🎯" >}}
**核心思路**：将多媒体识别能力从"模型内置"转变为"工具调用"，通过 MCP 协议实现能力解耦。

**关键创新**：在原作者 MCP 方案的基础上，增加 PreToolUse Hook 作为系统级的安全网，确保 Agent 在任何场景下都不会绕过 MCP 直接处理多媒体文件。

**两层防御**：
- **软指令**（CLAUDE.md）— 引导 Agent 主动选择正确工具
- **硬拦截**（PreToolUse Hook）— 兜底，阻止错误的工具调用

这种"软引导 + 硬拦截"的模式，不仅适用于多媒体场景，也可以推广到其他需要强制工具路由的场景。
{{< /callout >}}

---

## 参考链接

- 🔗 **GitHub（原 MCP Server）**：[https://github.com/congxxx/mimo-media-recognition-mcp](https://github.com/congxxx/mimo-media-recognition-mcp)
- 🔗 **GitHub（本方案 Hook）**：[https://github.com/SongXue-J/claude-code-multimedia-hook](https://github.com/SongXue-J/claude-code-multimedia-hook)
- 📝 **原作者博客**：[解决 Claude Code 接入 MIMO 模型后无法识别图片、音频、视频的问题](https://www.cnblogs.com/congxinxue/p/20086413)
- 📖 **MCP 官方文档**：[https://modelcontextprotocol.io](https://modelcontextprotocol.io)
- 📖 **Claude Code Hooks 文档**：[https://docs.anthropic.com/en/docs/claude-code/hooks](https://docs.anthropic.com/en/docs/claude-code/hooks)
