---
title: "Hugo + Hextra + Netlify + Cloudflare：技术细节与参数手册"
date: 2026-10-19
categories: ["tools-tips"]
tags: ["Hugo", "Hextra", "Netlify", "Cloudflare", "网站部署", "SEO"]
description: "面向动手操作的配置手册：Hugo + Hextra 建站、Git 推送、Netlify 构建、Cloudflare DNS、TLS、SEO 验收与排错，附参数速查表和总纲链接。"
---

{{< callout type="error" emoji="🤖" >}}
**AI 使用声明**：本文的大纲由作者确定，AI 工具（Claude 与 DeepSeek）辅助完成初稿起草与格式整理。作者已审校本文全部内容，并对准确性承担最终责任。
{{< /callout >}}

这是一份面向动手操作的技术手册：从本地建站、Git 推送，到 Netlify 构建、Cloudflare 域名解析、TLS 与 SEO 验收，按顺序给出命令、配置和参数。本文假设你已经理解“为什么需要这些服务”；如果你对 DNS、托管、构建等概念还不熟，建议先读总纲。

{{< callout type="info" >}}
**先读总纲**：如果你对“网站为什么需要域名、托管和 DNS”还没有整体概念，先看 [《网站是怎么上线的？写给非开发者的总纲》]({{< relref "blog/website-launch-overview" >}})，再回来按本文操作。
{{< /callout >}}

<!--more-->

{{< callout type="info" >}}
**怎么用这份手册**：每一步都先看“本步目标”，做完后确认“你应该看到”，再进入下一步。不要一口气做完再排查——建站的问题通常越早发现越好定位。卡住了直接跳到[常见问题排查]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-troubleshooting)。
{{< /callout >}}

<a id="tech-architecture"></a>

## 一、四层架构速查

本文的所有操作可以归到四层：

| 层 | 使用的服务 | 负责什么 |
|---|---|---|
| 内容与构建 | Hugo + Hextra | 把 Markdown 编译成静态 HTML |
| 代码与版本 | GitHub | 保存源码，触发自动部署 |
| 托管与 CDN | Netlify | 执行构建、分发页面、签发 TLS 证书 |
| 域名与解析 | Cloudflare | 注册域名、回答“这个域名指向哪台服务器” |

一句话：**Hugo 生成，GitHub 版本，Netlify 托管，Cloudflare 指路。**

每一层为什么这样分工，见总纲的[四个角色]({{< relref "blog/website-launch-overview" >}}#roles)和[为什么这样分工]({{< relref "blog/website-launch-overview" >}}#why-stack)。下面直接进入操作。

## 二、准备工作

### 1. 本地环境

| 工具 | 用途 | 本文实测版本 |
|---|---|---|
| Hugo extended | 生成静态站点 | 0.139.0 |
| Git | 版本管理 | 任意较新版本 |
| Go | Hugo Modules 拉取主题 | 1.20+ |
| 编辑器 | 写 Markdown / YAML | 任意 |

先确认 Hugo 是 **extended** 版本：

```bash
hugo version
# 输出中应包含 extended，例如：
# hugo v0.139.0+extended ...
```

{{< callout type="warning" >}}
Hextra 的部分资源处理依赖 Hugo extended。普通版 Hugo 可能在构建 SCSS 或主题资源时报错，建议一开始就安装 extended 版。
{{< /callout >}}

### 2. 账号

- GitHub：存放源码
- Netlify：托管站点
- Cloudflare：注册域名、管理 DNS
- Google Search Console：后续提交 sitemap、观察收录

这些服务都不需要付费订阅即可完成本文流程；域名注册本身需要单独付费。

<a id="tech-params"></a>

### 3. 参数速查表

后文会逐项展开。如果你只想快速核对，可以先看这张表：

| 参数 | 本站值 / 示例 | 设置位置 |
|---|---|---|
| Hugo 版本 | 0.139.0（本站；新版 Hextra 需 0.146+） | `netlify.toml` / 本地 |
| 构建命令 | `hugo`（可选 `--gc --minify`） | `netlify.toml` |
| 发布目录 | `public` | `netlify.toml` |
| `baseURL` | `https://www.songxue-j.com/` | `hugo.yaml` |
| 主域名 | `www.songxue-j.com` | Netlify Domain management |
| 根域名记录 | `CNAME @ → apex-loadbalancer.netlify.com` | Cloudflare DNS |
| www 记录 | `CNAME www → songxue.netlify.app` | Cloudflare DNS |
| 代理状态 | DNS only | Cloudflare DNS |
| 证书 | Let's Encrypt 自动签发 | Netlify |
| robots / sitemap | `/robots.txt`、`/sitemap.xml` | Hugo 自动生成 |
| IndexNow key | `/<key>.txt` | `static/` |

{{< callout type="warning" >}}
`HUGO_VERSION` 应与你所用 Hextra 版本的要求一致。新版 Hextra（v0.10+）要求 Hugo 0.146+；不要机械照抄本站的 0.139.0。
{{< /callout >}}

<a id="tech-setup"></a>

## 三、本地搭建 Hugo + Hextra

{{< callout type="info" >}}
**概念补充**：如果你不确定“构建”到底在做什么，先看总纲的[你写的不是网页，而是原料]({{< relref "blog/website-launch-overview" >}}#static-site)。
{{< /callout >}}

**本步目标**：在浏览器打开 `http://localhost:1313/`，看到你的站点首页。

### 1. 创建 Hugo 站点

```bash
hugo new site my-blog --format=yaml
cd my-blog
git init
```

`--format=yaml` 会生成 `hugo.yaml`，比 TOML 更贴近 Hextra 官方示例。

### 2. 用 Hugo Modules 安装 Hextra

Hextra 官方推荐 Hugo Modules，主题会自动下载并由 Hugo 管理：

```bash
hugo mod init github.com/<你的用户名>/<仓库名>
hugo mod get github.com/imfing/hextra
```

然后在 `hugo.yaml` 中加入：

```yaml
module:
  imports:
    - path: github.com/imfing/hextra
```

如果你更习惯把主题固定在本仓库里，也可以用 Git submodule：

```bash
git submodule add https://github.com/imfing/hextra.git themes/hextra
```

此时改为在配置里写 `theme: "hextra"`。两种方式选一种即可，不要同时依赖两套来源，否则以后升级时容易出现"到底加载了哪个版本"的问题。

### 3. 最小可用配置

一个双语站点的最小 `hugo.yaml` 大致如下：

```yaml
baseURL: "https://www.your-domain.com/"
title: "My Blog"

defaultContentLanguage: en
languages:
  en:
    languageName: English
    weight: 1
  zh-cn:
    languageName: 简体中文
    languageCode: zh-CN
    weight: 2

enableRobotsTXT: true

module:
  imports:
    - path: github.com/imfing/hextra
```

几个容易忽略的点：

- `baseURL` 必须是**最终对外访问的绝对地址**，并且末尾带 `/`。它决定了 sitemap、canonical、RSS 里的链接是否完整。
- `defaultContentLanguage: en` 且不设置 `defaultContentLanguageInSubdir` 时，英文在 `/`，中文在 `/zh-cn/`。
- `enableRobotsTXT: true` 会让 Hugo 生成 `robots.txt`，但默认内容只有 `User-agent: *`，后面我们会覆盖它。

### 4. 本地预览

```bash
hugo server --buildDrafts --disableFastRender
```

打开 `http://localhost:1313/` 检查首页、导航、语言切换和一篇示例文章。

### 5. 目录结构

一个适合博客的目录大致长这样：

{{< filetree/container >}}
  {{< filetree/folder name="my-blog" state="open" >}}
    {{< filetree/folder name="content" state="open" >}}
      {{< filetree/file name="_index.md" >}}
      {{< filetree/file name="_index.zh-cn.md" >}}
      {{< filetree/folder name="blog" state="open" >}}
        {{< filetree/folder name="my-first-post" state="open" >}}
          {{< filetree/file name="index.md" >}}
          {{< filetree/file name="index.zh-cn.md" >}}
        {{< /filetree/folder >}}
      {{< /filetree/folder >}}
    {{< /filetree/folder >}}
    {{< filetree/folder name="layouts" state="open" >}}
      {{< filetree/file name="robots.txt" >}}
    {{< /filetree/folder >}}
    {{< filetree/file name="hugo.yaml" >}}
    {{< filetree/file name="netlify.toml" >}}
  {{< /filetree/folder >}}
{{< /filetree/container >}}

<a id="tech-content"></a>

## 四、双语内容模型

{{< callout type="info" >}}
本站是中英双语，所以有这一节；如果你的站点只做中文，可以跳过。
{{< /callout >}}

### 1. 一篇文章一个目录

中英文放在同一个目录下，文件名固定：

```text
content/blog/my-first-post/
├── index.md          # 英文
└── index.zh-cn.md    # 中文
```

Hugo 会把它们识别为同一篇文章的两种语言，语言切换器会自动配对。

{{< callout type="warning" >}}
后缀必须是 `.zh-cn.md`，不是 `.zh.md`。另外，中英文文件名必须相同（这里是 `index.md` / `index.zh-cn.md`）。如果英文叫 `my-post.md`、中文叫 `我的文章.zh-cn.md`，Hugo 不会认为它们是翻译关系，语言切换会失效。
{{< /callout >}}

### 2. Front matter

现代 Hextra 博客常用的字段就这几个：

```yaml
---
title: "文章标题"
date: 2026-10-20
categories: ["tools-tips"]
tags: ["Hugo", "Netlify"]
description: "一句话摘要，会用于列表页和搜索结果。"
---
```

| 字段 | 是否必需 | 作用 |
|---|---|---|
| `title` | 是 | 页面标题 |
| `date` | 是 | 排序、RSS、sitemap lastmod |
| `description` | 强烈建议 | 列表摘要、meta description |
| `categories` | 建议 | 对应 `data/categories.yaml` 的键 |
| `tags` | 可选 | 自由标签 |
| `draft` | 可选 | `true` 时默认不发布 |

如果确实需要使用不同的文件名，可以用 `translationKey` 显式配对；本博客没有使用这个字段。

### 3. 分类与标签

分类通常集中定义在 `data/categories.yaml`：

```yaml
tools-tips:
  en: "Tools & Tips"
  zh-cn: "工具与技巧"
```

文章里写 `categories: ["tools-tips"]`，列表页和分类页会自动显示对应语言的名称。标签则是自由字符串，不需要提前注册。

<a id="tech-git"></a>

## 五、构建与 Git

{{< callout type="info" >}}
**概念补充**：如果你不清楚“为什么 push 一下网站就更新了”，先看总纲的[一次发布发生了什么]({{< relref "blog/website-launch-overview" >}}#publish-flow)。
{{< /callout >}}

### 1. 本地构建

```bash
hugo --gc --minify
```

产物在 `public/`。建议在推送前先本地构建一次，确认没有模板错误、没有缺图、没有坏链接。

### 2. `.gitignore`

`public/` 是构建产物，不应该提交：

```gitignore
/public/
/resources/
/.hugo_build.lock
/hugo_stats.json
```

Netlify 会在云端重新执行构建，提交产物只会让仓库变大、历史变乱。

### 3. 初始化仓库并推送

```bash
git add -A
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<用户名>/<仓库名>.git
git push -u origin main
```

Netlify 默认从 `main` 分支部署。如果你的本地分支叫 `master`，先改成 `main`：

```bash
git branch -m master main
git push -u origin main
```

### 4. 远端已有占位历史怎么办

如果你先在 GitHub 上创建了仓库（带一个 README 占位提交），本地又有一套独立历史，直接 `git push` 会提示历史不相关。确认远端没有需要保留的内容后，可以覆盖：

```bash
git fetch origin
git push -u origin main --force-with-lease
```

{{< callout type="warning" >}}
优先使用 `--force-with-lease` 而不是 `--force`。它会在远端分支被别人更新过时拒绝覆盖，给自己留一道保险。lease 比较的是远端跟踪分支，所以先执行 `git fetch origin`；没有跟踪引用时会报 `stale info`。执行前务必确认远端确实只有占位文件。
{{< /callout >}}

<a id="tech-netlify"></a>

## 六、Netlify 托管

{{< callout type="info" >}}
**概念补充**：Netlify 在整条链路里负责“托管 + 构建 + 证书”，见总纲的[四个角色]({{< relref "blog/website-launch-overview" >}}#roles)。
{{< /callout >}}

**本步目标**：打开 `https://<站点名>.netlify.app/`，看到和本地一样的页面。

### 1. 导入仓库

Netlify 控制台 → **Add new site → Import an existing project → GitHub** → 选择仓库。

### 2. 构建设置

| 项目 | 值 |
|---|---|
| Production branch | `main` |
| Build command | `hugo`（可选 `hugo --gc --minify`） |
| Publish directory | `public` |
| Hugo version | 与你本地一致的版本 |

这些设置也可以直接写进 `netlify.toml`，让配置跟着仓库走：

```toml
[build]
  command = "hugo"
  publish = "public"

[build.environment]
  HUGO_VERSION = "0.139.0"

[context.production.environment]
  HUGO_ENV = "production"

[context.deploy-preview]
  command = "hugo -F -b $DEPLOY_PRIME_URL"

[context.branch-deploy]
  command = "hugo -F -b $DEPLOY_PRIME_URL"
```

逐项解释：

- **`hugo` 与 `hugo --gc --minify`**：本站实际使用 `hugo`；`--gc --minify` 是 Hextra 文档中的可选产物优化，两者都能正常部署。
- **固定 `HUGO_VERSION`**：避免 Netlify 某天默认升级 Hugo 后构建行为变化。版本应与你本地测试通过的版本一致；如果你用的是较新的 Hextra，请按主题要求提高版本。
- **`-F`（build future）**：预览环境允许渲染未来日期的文章，方便校对定时发布的内容；生产环境不加，避免提前泄露。
- **`-b $DEPLOY_PRIME_URL`**：让预览站点的 canonical、`og:url`、RSS 指向预览域名，而不是正式域名。这一点对检查分享卡片和 SEO 很有用。
- **生产环境不要再用 `-b` 覆盖**：正式地址应只在 `hugo.yaml` 的 `baseURL` 里维护一份，避免两处配置冲突。

### 3. 先验证 Netlify 子域名

部署完成后先访问：

```text
https://<你的站点名>.netlify.app/
```

确认首页、文章页、中文页、图片、站内搜索都正常。**在绑定自定义域名之前，先把站点本身验证好**，这样出问题时可以明确判断是"构建问题"还是"域名问题"。

如果这里就是 404，通常意味着：

- Publish directory 写错（不是 `public`）
- 构建失败但你没有看日志
- 仓库里只有占位文件，没有 Hugo 站点

<a id="tech-domain"></a>

## 七、Cloudflare 域名连接

{{< callout type="info" >}}
**概念补充**：如果你还不清楚 DNS 是什么，先看总纲的[一次访问发生了什么]({{< relref "blog/website-launch-overview" >}}#visit-flow)和[名词小词典]({{< relref "blog/website-launch-overview" >}}#glossary)。
{{< /callout >}}

**本步目标**：`https://www.your-domain.com/` 能打开，浏览器地址栏出现锁标志。

这是整条链路里最容易卡住的一步。先理解一个前提：**DNS 由谁托管，决定了你能用哪种接入方式。**

### 1. 先查 NS

```bash
nslookup -type=NS your-domain.com 8.8.8.8
```

如果域名在 Cloudflare Registrar 注册，NS 会是 `xxx.ns.cloudflare.com`。这时要注意一个硬限制：

{{< callout type="warning" >}}
**Cloudflare Registrar 注册的域名不能把 NS 改到其他 DNS 服务商。** 因此 Netlify 文档里的"使用 Netlify DNS（`dns1.p04.nsone.net` 等）"这条路走不通。正确做法是保留 Cloudflare DNS，手动添加记录，让 Netlify 走"外部 DNS"。
{{< /callout >}}

### 2. 在 Netlify 添加域名

Netlify 项目 → **Domain management → Add a domain**，输入：

```text
your-domain.com
```

Netlify 会自动把 `www.your-domain.com` 也加上。此时页面可能显示 **"Netlify DNS propagating..."**，因为 Netlify 以为你要用它的 DNS。先不用管这个徽标，下一步在 Cloudflare 里加记录即可。

### 3. 在 Cloudflare 添加两条记录

Cloudflare → 你的域名 → **DNS → Records → Add record**：

| Type | Name | Content | Proxy status | TTL |
|---|---|---|---|---|
| CNAME | `@` | `apex-loadbalancer.netlify.com` | DNS only | Auto |
| CNAME | `www` | `<你的站点名>.netlify.app` | DNS only | Auto |

为什么这样配：

- **根域名（apex）**：DNS 协议不允许根域名直接使用普通 CNAME，但 Cloudflare 支持 **CNAME flattening**，所以 `@` 可以写 CNAME。Netlify 官方推荐指向 `apex-loadbalancer.netlify.com`。如果你的 DNS 服务商不支持扁平化，则退化为 A 记录 `75.2.60.5`。
- **www**：标准 CNAME，指向 Netlify 给你的站点子域名。
- **DNS only（灰云）**：保持代理关闭。Netlify 需要通过 HTTP-01 验证签发并续期 Let's Encrypt 证书；开启橙云后，域名会解析到 Cloudflare 的 IP 而不是 Netlify，Netlify 的域名验证和自动续期可能失败（例如报 "domain doesn't appear to be served by Netlify"），90 天证书可能过期。两条记录都保持 DNS only。如果确实需要 Cloudflare 的代理，请密切监控证书到期时间，并考虑使用 Cloudflare Origin Certificate 配合 **Full (strict)**。

{{< callout type="error" >}}
不要在根域名添加 **NS** 或 **HTTPS/SVCB** 记录来"指向 Netlify DNS"。一条形如 `HTTPS 1 dns1.p04.nsone.net.` 的记录会让支持 HTTPS RR 的浏览器把连接目标解析到错误主机，表现为：`http://` 能打开，但直接访问 `https://` 报 `ERR_CONNECTION_ABORTED`。遇到这种"只有 HTTPS 挂"的现象，先检查有没有多余的 HTTPS 记录。
{{< /callout >}}

### 4. 验证 DNS 是否生效

```bash
# 根域名
nslookup -type=A your-domain.com 8.8.8.8

# www
nslookup -type=A www.your-domain.com 8.8.8.8
```

根域名应该返回 Netlify 的负载均衡 IP（例如 `75.2.60.5`、`99.83.231.61` 等），`www` 应该显示为 `<站点名>.netlify.app` 的别名。

### 5. 在 Netlify 完成验证并等待证书

回到 Netlify 的 Domain management，点击 **Verify DNS configuration**。成功时会看到：

```text
DNS verification was successful
```

然后 Netlify 会自动申请 Let's Encrypt 证书。通常几分钟内完成，可以用下面的命令确认证书主题：

```bash
openssl s_client -connect www.your-domain.com:443 \
  -servername www.your-domain.com 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

期望看到 `CN=your-domain.com`（或 SAN 同时包含根域名和 www），签发者是 Let's Encrypt。

### 6. 设置主域名与 301

在 Domain management 里二选一：

- **以 www 为主域名**：`www.your-domain.com` 设为 Primary，Netlify 会自动把根域名 301 到 www。
- **以根域名为主域名**：`your-domain.com` 设为 Primary，www 301 到根域名。

无论选哪个，`hugo.yaml` 的 `baseURL` 必须与主域名完全一致。例如主域名是 www：

```yaml
baseURL: "https://www.your-domain.com/"
```

{{< callout type="info" >}}
如果在证书还在签发时修改主域名，Netlify 可能返回 `422: We're provisioning a certificate...`。等证书签发完成后再改即可，不需要反复重试。
{{< /callout >}}

### 7. 关于 "Netlify DNS propagating..." 徽标

这个徽标有时会在外部 DNS 已经生效后仍然显示。判断标准不是徽标，而是下面三件事：

1. `Verify DNS configuration` 返回成功
2. `https://www.your-domain.com/` 返回 200
3. 证书主题包含你的域名

三者都满足，就说明链路已经通了。如果验证失败，再检查记录是否写错、是否被代理、是否有多余的 HTTPS/NS 记录。

<a id="tech-verify"></a>

## 八、上线验收清单

域名通了不等于上线完成。建议逐项检查：

| 检查项 | 期望结果 | 命令 / 方法 |
|---|---|---|
| 主域名首页 | 200 | `curl -I https://www.your-domain.com/` |
| 根域名跳转 | 301 到主域名 | `curl -I https://your-domain.com/` |
| 中文首页 | 200 | `curl -I https://www.your-domain.com/zh-cn/` |
| 证书 | 主题匹配、未过期 | `openssl s_client ...` |
| robots.txt | 200 且含 Sitemap | `curl https://www.your-domain.com/robots.txt` |
| sitemap.xml | 200 且 `<loc>` 是绝对 URL | `curl https://www.your-domain.com/sitemap.xml` |
| canonical | 绝对地址 | 查看网页源码 |
| 404 页面 | 返回 404 | `curl -I https://www.your-domain.com/not-exist/` |
| RSS | 200 | `curl -I https://www.your-domain.com/blog/index.xml` |

{{< callout type="info" >}}
上表假设主域名是 `www`。如果你选择根域名作为主域名，请把预期对调：根域名 200，www 301。Netlify 在外部 DNS 模式下建议优先使用 `www` 这类子域名作为主域名。
{{< /callout >}}

批量检查 sitemap 里的所有页面是否都能打开：

```bash
curl -fsS https://www.your-domain.com/en/sitemap.xml -o en.xml
curl -fsS https://www.your-domain.com/zh-cn/sitemap.xml -o zh.xml

grep -h -o '<loc>[^<]*</loc>' en.xml zh.xml \
  | sed -e 's#<loc>##' -e 's#</loc>##' > urls.txt

[ -s urls.txt ] || { echo "No URLs extracted"; exit 1; }

while read -r u; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$u")
  [ "$code" = "200" ] || echo "$code $u"
done < urls.txt
```

如果没有任何输出，说明提取到的所有 URL 都返回 200。这里用 `grep -o` 而不是贪婪 `sed`，是因为 `--minify` 会把 sitemap XML 压成一行，贪婪匹配只会提取到最后一个 URL。`curl -fsS` 则在 sitemap 本身返回错误时直接失败，避免把错误页当成 sitemap 去解析。

<a id="tech-seo"></a>

## 九、SEO：让搜索引擎找到你

{{< callout type="info" >}}
**概念补充**：sitemap、canonical、收录/索引这些词的解释，见总纲的[名词小词典]({{< relref "blog/website-launch-overview" >}}#glossary)。
{{< /callout >}}

### 1. `baseURL` 是最重要的一项

这里有两种不同的错误方式：

- `baseURL: "/"` 会生成**相对路径**，例如 `<loc>/en/sitemap.xml</loc>`，canonical 也会变成相对地址。
- `baseURL: "http://localhost:1313/"` 会生成**绝对但错误**的地址，例如 `<loc>http://localhost:1313/en/sitemap.xml</loc>`。

sitemap 协议要求 `<loc>` 是完整的公网绝对 URL，所以两者都不适合生产环境。请使用最终的正式公网地址。

正确配置：

```yaml
baseURL: "https://www.your-domain.com/"
```

### 2. 给 robots.txt 加上 Sitemap

Hugo 默认生成的 `robots.txt` 只有一行 `User-agent: *`，不会自动带上 sitemap。新建 `layouts/robots.txt`：

```text
User-agent: *
Allow: /

Sitemap: {{ "sitemap.xml" | absURL }}
```

构建后应看到：

```text
Sitemap: https://www.your-domain.com/sitemap.xml
```

### 3. 检查 sitemap 结构

多语言站点的 `sitemap.xml` 通常是一个索引文件，里面再指向各语言的子 sitemap：

```xml
<sitemapindex>
  <sitemap>
    <loc>https://www.your-domain.com/en/sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://www.your-domain.com/zh-cn/sitemap.xml</loc>
  </sitemap>
</sitemapindex>
```

每个子 sitemap 里的 `<loc>` 都应该是绝对地址。Hugo 还会在子 sitemap 中输出 `xhtml:link` 形式的语言替代链接。

### 4. Google Search Console

1. 打开 [Google Search Console](https://search.google.com/search-console)，添加 **Domain** 属性：`your-domain.com`。
2. 选择 DNS 验证，Google 会给一条 TXT 记录。到 Cloudflare DNS 添加：

   | Type | Name | Content |
   |---|---|---|
   | TXT | `@` | `google-site-verification=...` |

3. 回到 GSC 点击验证。成功后 Settings → Ownership verification 会显示 "You are a verified owner"。
4. 在 **Indexing → Sitemaps** 提交：

   ```text
   https://www.your-domain.com/sitemap.xml
   ```

5. 新属性通常需要 1–2 天才出现 Performance / Indexing 数据。"Processing data, please check again in a day or so" 是正常状态，不是失败。

{{< callout type="info" >}}
如果 GSC 的 Settings 页面显示 "No robots.txt file"，先在浏览器直接打开 `https://www.your-domain.com/robots.txt`。文件能正常返回 200 的话，通常只是 GSC 尚未抓取，过一两天再看即可。
{{< /callout >}}

### 5. IndexNow

IndexNow 是 Bing、Yandex 等搜索引擎支持的主动提交协议，不需要登录：

1. 生成一个 key（32 位十六进制即可）。
2. 在站点根目录放置 `<key>.txt`，内容就是 key 本身。Hugo 项目放在 `static/<key>.txt`。
3. 部署后确认 `https://www.your-domain.com/<key>.txt` 可访问。
4. 向 `https://api.indexnow.org/indexnow` 提交：

```json
{
  "host": "www.your-domain.com",
  "key": "<key>",
  "keyLocation": "https://www.your-domain.com/<key>.txt",
  "urlList": [
    "https://www.your-domain.com/",
    "https://www.your-domain.com/zh-cn/"
  ]
}
```

返回 `202 Accepted` 表示请求已接收。注意：**Google 不参与 IndexNow**，Google 仍以 GSC 提交 sitemap 为主。

### 6. 收录时间预期

新域名从提交到出现在搜索结果里，通常需要几天到几周。技术上的"可抓取"（robots 允许、sitemap 有效、页面 200）和"已收录"是两件事，不要因为第二天搜不到就反复改配置。

<a id="tech-troubleshooting"></a>

## 十、常见问题排查

| 现象 | 常见原因 | 处理 |
|---|---|---|
| `NXDOMAIN` / 域名打不开 | DNS 没有记录，或记录名写错 | 检查 Cloudflare 的 CNAME 是否存在 |
| Netlify 子域名 404 | Publish directory 错、构建失败、仓库为空 | 看 Deploy log 和 deploy file browser |
| 自定义域名 404，但子域名正常 | 域名未在 Netlify 添加或未验证 | Domain management 重新添加并验证 |
| `ERR_TOO_MANY_REDIRECTS` | Cloudflare 代理 + SSL 模式冲突 | 先改 DNS only；或代理时用 Full (strict) |
| `ERR_CERT_COMMON_NAME_INVALID` | 证书未签发或未传播 | 等几分钟；确认 DNS 已指向 Netlify |
| 只有 HTTPS 打不开，HTTP 正常 | 多余的 HTTPS/SVCB 记录 | 删除根域名的 HTTPS 记录 |
| GSC 显示 "No robots.txt file" | 尚未抓取 | 浏览器直接访问确认 200，隔天再看 |
| GSC 提交 sitemap 失败 | URL 不是绝对地址或返回非 200 | 先在浏览器打开 sitemap 确认 |
| 预览站点 canonical 指向正式域名 | 预览上下文没有 `-b $DEPLOY_PRIME_URL` | 检查 `netlify.toml` 的 context 配置 |
| 原始 `.Rmd` / 数据文件被发布 | `ignoreFiles` 放错层级 | 放在配置根级，不要放在 `params:` 下 |

最后一条值得单独说明。Hugo 的 `ignoreFiles` 是**根级配置**：

```yaml
ignoreFiles:
  - \.Rmd$
  - \.Rmarkdown$
  - _cache$
  - \.knit\.md$
```

如果误写到 `params.ignoreFiles`，Hugo 不会把它当作忽略规则，源文件和缓存可能被原样复制进 `public/`，既影响构建体积，也可能把不该公开的原始数据暴露出去。

## 十一、总结：一条可复用的上线顺序

把整个流程压缩成 10 步：

1. 本地用 Hugo + Hextra 建站，`hugo server` 预览通过。
2. 配置双语、`baseURL`、`enableRobotsTXT`。
3. `hugo --gc --minify` 本地构建通过。
4. 推送 GitHub `main`。
5. Netlify 导入仓库，配置构建命令与 publish 目录。
6. 先验证 `*.netlify.app`。
7. Netlify 添加自定义域名。
8. Cloudflare 添加两条 CNAME（根域名 + www，DNS only）。
9. Netlify 验证 DNS，等待 Let's Encrypt，设置主域名。
10. 检查 robots、sitemap、canonical、所有页面 200，再提交 GSC / IndexNow。

如果只能记住一句话：**Hugo 负责生成，GitHub 负责版本，Netlify 负责托管，Cloudflare 负责指路。** 四层各司其职，出问题时先判断坏在哪一层，比盲目改配置有效得多。
