---
title: "Hextra 主题 Shortcodes 速查：让你的 Hugo 博客更生动"
date: 2026-06-17
categories: ["tools-tips"]
tags: ["Hugo", "Hextra", "Shortcodes", "博客搭建"]
description: "整理 Hextra 主题内置的 Shortcodes，配合写法示例和渲染效果，快速上手博客排版。"
---

{{< callout type="error" emoji="🤖" >}}
**AI 使用声明**：本文的大纲由作者确定，AI 工具（Claude 与 DeepSeek）辅助完成初稿起草与格式整理。作者已审校本文全部内容，并对准确性承担最终责任。
{{< /callout >}}

Hextra 是一个基于 Hugo 的现代化文档/博客主题，除了标准 Markdown 语法外，还提供了丰富的 Shortcodes 来增强内容表现力。本文整理了最常用的 Shortcodes，每个都附带写法和真实渲染效果，方便日常写作时快速查阅。

<!--more-->

---

## 折叠内容 (details)

用于隐藏/展示一段内容，适合 FAQ、补充说明等场景。

### 默认展开

{{% details title="点击折叠" %}}
这是一段默认展开的内容，支持 **Markdown** 格式，包括 `代码`、链接、列表等。
{{% /details %}}

````markdown
{{%/* details title="点击折叠" */%}}
这是一段默认展开的内容，支持 **Markdown** 格式。
{{%/* /details */%}}
````

### 默认折叠

{{% details title="点击展开查看" closed="true" %}}
这是一段默认折叠的内容，需要点击标题才能看到。
{{% /details %}}

````markdown
{{%/* details title="点击展开查看" closed="true" */%}}
这是一段默认折叠的内容。
{{%/* /details */%}}
````

> [!NOTE]
> 必须使用 `{{%/* */%}}` 分隔符（百分号），否则内部 Markdown 不会被渲染。

---

## 提示框 (callout)

用于在正文中插入醒目的提示信息。

### 默认（橙色）

{{< callout >}}
这是一个默认样式的提示框。
{{< /callout >}}

```markdown
{{</* callout */>}}
  这是一个默认样式的提示框。
{{</* /callout */>}}
```

### 信息（蓝色）

{{< callout type="info" >}}
这是一个信息提示框，用于补充说明。
{{< /callout >}}

```markdown
{{</* callout type="info" */>}}
  这是一个信息提示框，用于补充说明。
{{</* /callout */>}}
```

### 警告（黄色）

{{< callout type="warning" >}}
这是一个警告提示框，请注意。
{{< /callout >}}

```markdown
{{</* callout type="warning" */>}}
  这是一个警告提示框，请注意。
{{</* /callout */>}}
```

### 错误（红色）

{{< callout type="error" >}}
这是一个错误提示框，危险操作。
{{< /callout >}}

```markdown
{{</* callout type="error" */>}}
  这是一个错误提示框，危险操作。
{{</* /callout */>}}
```

### 自定义 emoji

{{< callout emoji="👾" >}}
可以用任意 emoji 作为图标。
{{< /callout >}}

```markdown
{{</* callout emoji="👾" */>}}
  可以用任意 emoji 作为图标。
{{</* /callout */>}}
```

---

## GitHub 风格 Alerts

和 callout 类似，但语法更轻量，不需要 shortcode 标签。

> [!NOTE]
> 补充说明信息（蓝色）。

> [!TIP]
> 有用的建议（绿色）。

> [!IMPORTANT]
> 重要信息（紫色）。

> [!WARNING]
> 需要注意（琥珀色）。

> [!CAUTION]
> 危险操作（红色）。

```markdown
> [!NOTE]
> 补充说明信息（蓝色）。

> [!TIP]
> 有用的建议（绿色）。
```

**选择建议：** 需要自定义 emoji → 用 `callout`；简单标注 → 用 Alerts。

---

## 标签页 (tabs)

用于并列展示多组内容，如多语言代码对比、多平台安装步骤。

{{< tabs items="JSON,YAML,TOML" >}}
  {{< tab >}}
  ```json
  { "hello": "world" }
  ```
  {{< /tab >}}
  {{< tab >}}
  ```yaml
  hello: world
  ```
  {{< /tab >}}
  {{< tab >}}
  ```toml
  hello = "world"
  ```
  {{< /tab >}}
{{< /tabs >}}

````markdown
{{</* tabs items="JSON,YAML,TOML" */>}}
  {{</* tab */>}}
  ```json
  { "hello": "world" }
  ```
  {{</* /tab */>}}
  {{</* tab */>}}
  ```yaml
  hello: world
  ```
  {{</* /tab */>}}
  {{</* tab */>}}
  ```toml
  hello = "world"
  ```
  {{</* /tab */>}}
{{</* /tabs */>}}
````

默认选中第一个标签，可通过 `defaultIndex="1"` 改为默认选中第二个。

---

## 卡片网格 (cards + card)

用于展示文章推荐、资源列表等，支持图标、图片和标签。

{{< cards cols="2" >}}
  {{< card link="/blog" title="访问博客" icon="pencil" subtitle="查看所有文章" >}}
  {{< card link="/about" title="关于我" icon="user" subtitle="了解更多" >}}
{{< /cards >}}

```markdown
{{</* cards cols="2" */>}}
  {{</* card link="/blog" title="访问博客" icon="pencil" subtitle="查看所有文章" */>}}
  {{</* card link="/about" title="关于我" icon="user" subtitle="了解更多" */>}}
{{</* /cards */>}}
```

带标签的卡片：

{{< cards >}}
  {{< card link="/blog" title="带标签" tag="新" tagType="info" >}}
  {{< card link="/blog" title="警告标签" tag="注意" tagType="warning" >}}
{{< /cards >}}

```markdown
{{</* card link="/blog" title="带标签" tag="新" tagType="info" */>}}
{{</* card link="/blog" title="警告标签" tag="注意" tagType="warning" */>}}
```

---

## 步骤流程 (steps)

用于展示教程、操作指南等按步骤排列的内容。

{{% steps %}}

### 第一步
安装 Hugo：`brew install hugo`（macOS）或 `choco install hugo`（Windows）。

### 第二步
创建站点：`hugo new site myblog`

### 第三步
选择主题并部署上线。

{{% /steps %}}

````markdown
{{%/* steps */%}}
### 第一步
安装 Hugo：`brew install hugo`（macOS）或 `choco install hugo`（Windows）。

### 第二步
创建站点：`hugo new site myblog`

### 第三步
选择主题并部署上线。
{{%/* /steps */%}}
````

> [!NOTE]
> 每一步必须是 `###`（H3）标题。使用 `{{%/* */%}}` 分隔符。

---

## 代码块增强

在代码块的语言标记后加 `{filename="文件名"}` 可显示文件名标签。

```python {filename="app.py"}
def hello():
    print("Hello, world!")
```

````markdown
```python {filename="app.py"}
def hello():
    print("Hello, world!")
```
````

---

## Mermaid 图表

直接在代码块中写 Mermaid 语法即可渲染为 SVG 图表。

```mermaid
graph LR
    A[开始] --> B[处理]
    B --> C[结束]
```

````markdown
```mermaid
graph LR
    A[开始] --> B[处理]
    B --> C[结束]
```
````

---

## 文件树 (filetree)

用于展示目录结构，文件夹可展开/折叠。

{{< filetree/container >}}
  {{< filetree/folder name="content" state="open" >}}
    {{< filetree/file name="_index.md" >}}
    {{< filetree/folder name="blog" state="open" >}}
      {{< filetree/file name="post1.md" >}}
      {{< filetree/file name="post2.md" >}}
    {{< /filetree/folder >}}
  {{< /filetree/folder >}}
{{< /filetree/container >}}

```markdown
{{</* filetree/container */>}}
  {{</* filetree/folder name="content" state="open" */>}}
    {{</* filetree/file name="_index.md" */>}}
    {{</* filetree/folder name="blog" state="open" */>}}
      {{</* filetree/file name="post1.md" */>}}
    {{</* /filetree/folder */>}}
  {{</* /filetree/folder */>}}
{{</* /filetree/container */>}}
```

`state` 参数：`"open"`（默认展开）或 `"closed"`（默认折叠）。

---

## 行内徽章 (badge)

用于行内小标签，支持 4 种颜色。

默认：{{< badge content="默认" >}}
信息：{{< badge content="信息" type="info" >}}
警告：{{< badge content="警告" type="warning" >}}
错误：{{< badge content="错误" type="error" >}}

```markdown
{{</* badge content="默认" */>}}
{{</* badge content="信息" type="info" */>}}
{{</* badge content="警告" type="warning" */>}}
{{</* badge content="错误" type="error" */>}}
```

带链接和图标：

{{< badge content="GitHub" link="https://github.com" icon="github" >}}

```markdown
{{</* badge content="GitHub" link="https://github.com" icon="github" */>}}
```

---

## 行内图标 (icon)

在文字中插入 Heroicons 图标。

{{< icon "github" >}} GitHub、{{< icon "academic-cap" >}} 学术、{{< icon "pencil" >}} 编辑

```markdown
{{</* icon "github" */>}} GitHub、{{</* icon "academic-cap" */>}} 学术
```

> [!NOTE]
> 需在站点配置中启用 `enableInlineShortcodes: true`。

---

## PDF 嵌入

以 iframe 形式嵌入 PDF 阅读器。

```markdown
{{</* pdf "path/to/file.pdf" */>}}
```

支持远程 URL 和本地文件路径（放在 page bundle 中）。

---

## Jupyter Notebook

直接渲染 `.ipynb` 文件，支持代码单元格（带语法高亮）、Markdown 单元格和图片输出。

```markdown
{{%/* jupyter "notebook.ipynb" */%}}
```

使用 `{{%/* */%}}` 分隔符，支持远程 URL。

---

## 快速对照表

| 需求 | Shortcode | 分隔符 |
|------|-----------|--------|
| 可折叠文本 | `details` | `{{%/* */%}}` |
| 提示框 | `callout` | `{{</* */>}}` |
| 标签页 | `tabs` + `tab` | `{{</* */>}}` |
| 步骤流程 | `steps` | `{{%/* */%}}` |
| 卡片网格 | `cards` + `card` | `{{</* */>}}` |
| 文件目录树 | `filetree/*` | `{{</* */>}}` |
| 嵌入 PDF | `pdf` | `{{</* */>}}` |
| 嵌入 Notebook | `jupyter` | `{{%/* */%}}` |
| 行内图标 | `icon` | `{{</* */>}}` |
| 徽章标签 | `badge` | `{{</* */>}}` |
| 流程图/图表 | Mermaid | ` ```mermaid ` |
| 带文件名代码 | 代码块属性 | ` ```lang {filename="..."} ` |

---

完整参数文档可参考 [Hextra 官方 Shortcodes 文档](https://imfing.github.io/hextra/docs/guide/shortcodes/)。
