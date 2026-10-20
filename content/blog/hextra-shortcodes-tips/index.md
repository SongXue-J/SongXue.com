---
title: "Hextra Shortcodes Cheat Sheet: Make Your Hugo Blog More Expressive"
date: 2026-06-17
categories: ["tools-tips"]
tags: ["Hugo", "Hextra", "Shortcodes", "Blog"]
description: "A quick reference for Hextra theme shortcodes with live rendered examples for better blog formatting."
---

Hextra is a modern Hugo theme for documentation and blogs. Beyond standard Markdown, it ships with a rich set of shortcodes to enhance your content. This post covers the most useful ones with syntax and live rendered examples.

<!--more-->

---

## Collapsible Content (details)

Use to hide/show a block of content. Great for FAQ, supplementary notes, and long code snippets.

### Expanded by Default

{{% details title="Click to collapse" %}}
This is expanded by default. It supports **Markdown**, including `code`, links, and lists.
{{% /details %}}

````markdown
{{%/* details title="Click to collapse" */%}}
This is expanded by default. It supports **Markdown**.
{{%/* /details */%}}
````

### Collapsed by Default

{{% details title="Click to expand" closed="true" %}}
This is hidden by default. Click the title to reveal.
{{% /details %}}

````markdown
{{%/* details title="Click to expand" closed="true" */%}}
This is hidden by default.
{{%/* /details */%}}
````

> [!NOTE]
> Use `{{%/* */%}}` delimiters (percent sign), otherwise Markdown inside won't render.

---

## Callouts

Use to display eye-catching notices within your content.

### Default (Orange)

{{< callout >}}
This is a default callout.
{{< /callout >}}

```markdown
{{</* callout */>}}
  This is a default callout.
{{</* /callout */>}}
```

### Info (Blue)

{{< callout type="info" >}}
This is an info callout, for supplementary information.
{{< /callout >}}

```markdown
{{</* callout type="info" */>}}
  This is an info callout, for supplementary information.
{{</* /callout */>}}
```

### Warning (Yellow)

{{< callout type="warning" >}}
This is a warning callout. Pay attention.
{{< /callout >}}

```markdown
{{</* callout type="warning" */>}}
  This is a warning callout. Pay attention.
{{</* /callout */>}}
```

### Error (Red)

{{< callout type="error" >}}
This is an error callout. Dangerous operation.
{{< /callout >}}

```markdown
{{</* callout type="error" */>}}
  This is an error callout. Dangerous operation.
{{</* /callout */>}}
```

### Custom Emoji

{{< callout emoji="👾" >}}
Use any emoji as the icon.
{{< /callout >}}

```markdown
{{</* callout emoji="👾" */>}}
  Use any emoji as the icon.
{{</* /callout */>}}
```

---

## GitHub-Style Alerts

Similar to callouts, but with lighter Markdown-only syntax.

> [!NOTE]
> Supplementary info (blue).

> [!TIP]
> Helpful suggestion (green).

> [!IMPORTANT]
> Key information (purple).

> [!WARNING]
> Caution needed (amber).

> [!CAUTION]
> Dangerous operation (red).

```markdown
> [!NOTE]
> Supplementary info (blue).

> [!TIP]
> Helpful suggestion (green).
```

**When to use:** Custom emoji → `callout`; simple labels → Alerts.

---

## Tabs

Use to display parallel content, such as multi-language code or platform-specific steps.

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

Default selects the first tab. Use `defaultIndex="1"` to select the second.

---

## Card Grid (cards + card)

Use for post recommendations, resource lists, and feature showcases. Supports icons, images, and tags.

{{< cards cols="2" >}}
  {{< card link="/blog" title="Visit Blog" icon="pencil" subtitle="See all posts" >}}
  {{< card link="/about" title="About Me" icon="user" subtitle="Learn more" >}}
{{< /cards >}}

```markdown
{{</* cards cols="2" */>}}
  {{</* card link="/blog" title="Visit Blog" icon="pencil" subtitle="See all posts" */>}}
  {{</* card link="/about" title="About Me" icon="user" subtitle="Learn more" */>}}
{{</* /cards */>}}
```

With tags:

{{< cards >}}
  {{< card link="/blog" title="With Tag" tag="New" tagType="info" >}}
  {{< card link="/blog" title="Warning" tag="Alert" tagType="warning" >}}
{{< /cards >}}

```markdown
{{</* card link="/blog" title="With Tag" tag="New" tagType="info" */>}}
{{</* card link="/blog" title="Warning" tag="Alert" tagType="warning" */>}}
```

---

## Steps

Use for tutorials, installation guides, and step-by-step instructions.

{{% steps %}}

### Step 1
Install Hugo: `brew install hugo` (macOS) or `choco install hugo` (Windows).

### Step 2
Create a site: `hugo new site myblog`

### Step 3
Choose a theme and deploy.

{{% /steps %}}

````markdown
{{%/* steps */%}}
### Step 1
Install Hugo: `brew install hugo` (macOS) or `choco install hugo` (Windows).

### Step 2
Create a site: `hugo new site myblog`

### Step 3
Choose a theme and deploy.
{{%/* /steps */%}}
````

> [!NOTE]
> Each step must be an H3 (`###`) header. Use `{{%/* */%}}` delimiters.

---

## Enhanced Code Blocks

Add `{filename="filename"}` after the language tag to display a filename label.

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

## Mermaid Diagrams

Write Mermaid syntax in a code block to render SVG diagrams.

```mermaid
graph LR
    A[Start] --> B[Process]
    B --> C[End]
```

````markdown
```mermaid
graph LR
    A[Start] --> B[Process]
    B --> C[End]
```
````

---

## File Tree (filetree)

Use to display directory structures. Folders can be expanded/collapsed.

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

`state`: `"open"` (default) or `"closed"`.

---

## Inline Badges

Small inline labels with 4 color variants.

Default: {{< badge content="Default" >}}
Info: {{< badge content="Info" type="info" >}}
Warning: {{< badge content="Warning" type="warning" >}}
Error: {{< badge content="Error" type="error" >}}

```markdown
{{</* badge content="Default" */>}}
{{</* badge content="Info" type="info" */>}}
{{</* badge content="Warning" type="warning" */>}}
{{</* badge content="Error" type="error" */>}}
```

With link and icon:

{{< badge content="GitHub" link="https://github.com" icon="github" >}}

```markdown
{{</* badge content="GitHub" link="https://github.com" icon="github" */>}}
```

---

## Inline Icons

Insert Heroicons inline with text.

{{< icon "github" >}} GitHub, {{< icon "academic-cap" >}} Academic, {{< icon "pencil" >}} Edit

```markdown
{{</* icon "github" */>}} GitHub
```

> [!NOTE]
> Requires `enableInlineShortcodes: true` in site config.

---

## PDF Embed

Embeds a PDF viewer in an iframe.

```markdown
{{</* pdf "path/to/file.pdf" */>}}
```

Supports remote URLs and local file paths (in page bundles).

---

## Jupyter Notebook

Renders `.ipynb` files inline with syntax-highlighted code cells, Markdown cells, and image output.

```markdown
{{%/* jupyter "notebook.ipynb" */%}}
```

Uses `{{%/* */%}}` delimiters. Supports remote URLs.

---

## Quick Reference

| Need | Shortcode | Delimiter |
|------|-----------|-----------|
| Collapsible text | `details` | `{{%/* */%}}` |
| Callout | `callout` | `{{</* */>}}` |
| Tabs | `tabs` + `tab` | `{{</* */>}}` |
| Steps | `steps` | `{{%/* */%}}` |
| Card grid | `cards` + `card` | `{{</* */>}}` |
| File tree | `filetree/*` | `{{</* */>}}` |
| Embed PDF | `pdf` | `{{</* */>}}` |
| Embed Notebook | `jupyter` | `{{%/* */%}}` |
| Inline icon | `icon` | `{{</* */>}}` |
| Badge | `badge` | `{{</* */>}}` |
| Diagrams | Mermaid | ` ```mermaid ` |
| Code with filename | Code block attr | ` ```lang {filename="..."} ` |

---

For full parameter reference, see the [Hextra Shortcodes Documentation](https://imfing.github.io/hextra/docs/guide/shortcodes/).

{{< callout type="info" emoji="🤖" >}}
**AI disclosure**: This article was written by the author with assistance from Claude (Anthropic) for drafting, bilingual translation, and formatting. The author has reviewed all content and takes full responsibility for its accuracy.
{{< /callout >}}
