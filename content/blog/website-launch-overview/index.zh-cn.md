---
title: "网站是怎么上线的？写给非开发者的总纲"
date: 2026-10-20
categories: ["tools-tips"]
tags: ["网站部署", "DNS", "Hugo", "Netlify", "Cloudflare", "科普"]
description: "用最少的术语讲清网页从 Markdown 到浏览器的完整旅程，解释构建、托管、DNS、HTTPS、搜索引擎收录分别是什么，以及 GitHub、Netlify、Cloudflare 为什么各司其职。"
---

{{< callout type="error" emoji="🤖" >}}
**AI 使用声明**：本文的大纲由作者确定，AI 工具（Claude 与 DeepSeek）辅助完成初稿起草与格式整理。作者已审校本文全部内容，并对准确性承担最终责任。
{{< /callout >}}

如果你每天打开网页，却从没想过“它为什么能打开”，这篇就是写给你的。

第一次看到 DNS、CNAME、CDN、TLS 这些词，大多数人的反应都是：这跟我有什么关系？教程里每个字都认识，连起来却不知道在干什么。

所以我把这件事拆成两部分：**这篇总纲是“基础篇”**，只讲清楚网页从哪里来、域名怎么找到它、为什么需要好几个服务配合；**[技术手册]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}})是“进阶篇”**，负责具体命令和参数。你可以先读完基础篇再动手，也可以直接跳到进阶篇，卡住了再回来查。

不需要先学编程，也不需要记住任何命令。读完这篇，你至少能判断——网站打不开时，到底是域名、托管还是内容出了问题。

<!--more-->

## 一、一张图看懂全流程

先把全局放在一张图里：

```text
你写的 Markdown
      │
      ▼
Hugo 把文字和模板“印刷”成网页文件
      │
      ▼
GitHub 保存源码和每一次修改
      │
      ▼
Netlify 托管网页，并把它们分发到各地
      │
      ▼
Cloudflare 把域名指向 Netlify
      │
      ▼
访客在浏览器里打开你的网站
```

这不是五个软件，而是五个**角色**。每个角色只做一件事，合起来才是一次完整的“上线”。

{{< callout type="info" >}}
**如果只记住一件事**：网站不是“买”来的，而是由内容、代码、托管和域名四层拼起来的。后面所有概念，都可以放回这张图里。
{{< /callout >}}

## 二、这份总纲写给谁、读完后你能做到什么

这篇写给三类人：

- 想给自己做一个博客，但被“服务器、DNS、CDN、部署”这些词劝退的人。
- 已经在用某个建站工具，但不知道背后发生了什么的人。
- 需要和技术同事沟通，想知道对方说的“解析没生效”“证书没签发”是什么意思的人。

预计 20–30 分钟读完。读完后，你应该能够：

1. 用自己的话解释域名、DNS、托管、构建、HTTPS 分别是什么。
2. 看懂“网站打不开”大概坏在哪一层。
3. 不带恐惧地打开技术手册，按步骤动手。

如果你时间有限，至少读完第五、六、七节——它们分别回答“网页怎么被打开”“内容怎么上线”“出问题该找谁”。这三节是整篇文章的骨架。

{{< callout type="info" >}}
**读前须知**：把这篇当成“基础篇”，把[技术手册]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}})当成“进阶篇”。基础篇负责理解，进阶篇负责动手；本总纲刻意不出现命令和配置，需要动手时会明确告诉你去看技术手册的哪一节。
{{< /callout >}}

<a id="analogy"></a>

## 三、一个比喻：写书、印刷、仓库、门牌

把建网站想成出一本书，会容易很多。

| 现实中的事 | 网站里的对应物 | 一句话解释 |
|---|---|---|
| 写原稿 | 写 Markdown | 你只写内容，不直接画网页 |
| 排版印刷 | Hugo 构建 | 把原稿和版式做成一本本成书 |
| 仓库、书店 | Netlify 托管 | 把书放到各地，读者随时能拿 |
| 门牌地址 | 域名 | 别人找到你的“名字” |
| 电话簿 | DNS | 把名字翻译成具体地址 |
| 防伪身份证 | TLS 证书 | 证明“你访问的确实是这家” |

这个比喻最重要的作用是帮你分开两件事：

- **域名不是网站。** 域名只是名字，像书店的门牌号；书店里有没有书，取决于托管。
- **DNS 不是服务器。** DNS 只是电话簿，它告诉你“去哪里找”，不负责把书递给你。

所以“买了域名却打不开网站”非常正常——你只是有了门牌号，还没有书店。

<a id="static-site"></a>

## 四、你写的不是网页，而是“生成网页的原料”

你在编辑器里写的 Markdown，是一种“带少量标记的纯文本”。比如：

```text
## 这是一级小标题

这是一段普通文字，**加粗**只需要两边各加两个星号。
```

它看起来不像网页，但 Hugo 能读懂它。**Hugo 是一个静态站点生成器**——你可以把它理解成“提前把 Markdown 做成网页的工具”。它把：

- 你写的 Markdown 内容，
- 主题提供的模板和样式，

一起“印刷”成浏览器能直接打开的 HTML、CSS 和 JavaScript 文件。

{{< callout type="info" >}}
**静态网站是什么？** 网页在访问之前就已经做好、原样保存。像超市货架上的现成蛋糕，拿走就行；动态网站则像餐厅现点现做，每次都要查数据库、拼页面。
{{< /callout >}}

静态网站的好处是：快、便宜、安全、容易备份，而且所有内容都能用 Git 管理。代价是：评论、搜索这类“需要现场计算”的功能，通常要借助外部服务，不能只靠静态文件。

想动手建站时，看技术手册的[本地搭建 Hugo + Hextra]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-setup)和[双语内容模型]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-content)。

<a id="visit-flow"></a>

## 五、一次访问发生了什么

当访客在浏览器里输入你的域名，背后大致发生五件事：

```text
你输入 www.example.com
        │
        ▼
浏览器问 DNS：这个域名对应哪个 IP？
        │
        ▼
DNS 返回托管商的 IP（像查电话簿）
        │
        ▼
浏览器和服务器建立 HTTPS 连接（验证证书）
        │
        ▼
托管商从就近的 CDN 节点返回网页文件
        │
        ▼
浏览器把 HTML/CSS 渲染成你看到的页面
```

### 1. DNS 到底在做什么

DNS 是互联网的**电话簿**。人记得住 `www.example.com`，机器只认 IP 地址；DNS 负责把前者翻译成后者。

这个电话簿不是一本，而是分层的：根域名服务器 → 顶级域（`.com`）服务器 → 权威域名服务器。过程很像快递分拣：先看省份，再看城市，再看街道，最后找到门牌号。

如果 DNS 查不到，浏览器会显示“找不到服务器”或 `NXDOMAIN`。这时网页本身可能完全正常，只是“电话簿里没有这条记录”。

### 2. HTTPS 和证书在做什么

HTTPS 是 HTTP 的加密版本。**TLS 证书**像网站的防伪身份证：它由受信任的机构签发，证明“你连接的确实是这个域名对应的服务器”，同时把传输内容加密。

证书通常由 Let's Encrypt 这类机构免费签发，托管商可以在域名解析正确后自动完成。证书过期或域名不匹配时，浏览器会弹出“不安全”警告。

### 3. CDN 在做什么

**CDN** 是“内容分发网络”。你可以把它想成各地的前置仓库：网站文件提前复制到离访客更近的节点，访客不用每次都跑到总部去取。

{{< callout type="info" >}}
**如果只记住一件事**：DNS 只负责“指路”，网页内容来自托管商。域名打不开，先查 DNS；DNS 正常但页面 404，去查托管和部署。
{{< /callout >}}

DNS 和证书的具体配置，见技术手册的[Cloudflare 域名连接]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-domain)。

<a id="publish-flow"></a>

## 六、一次发布发生了什么

写一篇新文章，到访客看到它，中间也有一条流水线：

```text
你写 Markdown
      │
      ▼
本地用 Hugo 生成网页文件
      │
      ▼
把源码同步到 GitHub
      │
      ▼
GitHub 通知 Netlify：“有新版本了”
      │
      ▼
Netlify 拉取源码，重新生成网页
      │
      ▼
新文件被分发到各地 CDN
      │
      ▼
访客看到新内容
```

这里有三组容易混淆的词：

| 词 | 在做什么 | 比喻 |
|---|---|---|
| 构建（build） | 把 Markdown + 模板变成网页文件 | 把原稿排版印刷成书 |
| 提交 / 推送（commit / push） | 把修改记录到 Git，并同步到 GitHub | 给原稿存档，寄给出版社 |
| 部署（deploy） | 把新生成的网页放到线上 | 把新版书铺到全国书店 |

{{< callout type="info" >}}
**如果只记住一件事**：你改的是“原料”，线上看到的是“成品”。每次发布，都是重新印刷、重新铺货的过程。
{{< /callout >}}

具体命令和自动部署配置，见技术手册的[构建与 Git]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-git)和[Netlify 托管]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-netlify)。

<a id="roles"></a>

## 七、四个角色，各管什么

| 角色 | 负责 | 不负责 | 出问题时的典型表现 |
|---|---|---|---|
| GitHub | 保存源码、记录版本、触发部署 | 不托管网页 | push 失败、Netlify 没收到新版本 |
| Netlify | 构建、托管、CDN、TLS 证书 | 不注册域名 | 站点 404、证书错误、构建失败 |
| Cloudflare | 注册域名、管理 DNS | 不保存网页内容 | 域名打不开、`NXDOMAIN`、解析没生效 |
| Google | 搜索收录、展示搜索结果 | 不参与网站托管 | 网站能打开，但搜不到 |

遇到问题时，先做三个判断：

1. **域名能解析出 IP 吗？** 不能 → 先看 Cloudflare/DNS。
2. **`*.netlify.app` 能打开吗？** 不能 → 先看 Netlify 的构建和部署。
3. **`*.netlify.app` 能打开，但正式域名不行？** → 大概率是 DNS 记录或证书。

{{< callout type="info" >}}
**如果只记住一件事**：不要一上来就改配置，先判断坏在哪一层。四层里只有一层出了问题，其他三层通常是无辜的。
{{< /callout >}}

各角色的具体操作，见技术手册的[Netlify 托管]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-netlify)、[Cloudflare 域名连接]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-domain)和[SEO]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-seo)。

<a id="glossary"></a>

## 八、名词小词典

下面这些词，后面看技术手册时会反复出现。每个词只给一句话解释和一个比喻，不追求严谨定义。

### 1. 内容与构建

| 名词 | 一句话解释 | 比喻 |
|---|---|---|
| 静态网站 | 访问前就生成好的网页文件 | 超市现货 |
| Markdown | 用简单标记写排版的纯文本 | 带批注的原稿 |
| 主题（theme） | 决定网站外观的模板集合 | 书的版式和封面 |
| 构建（build） | 把 Markdown 和主题变成网页 | 排版印刷 |
| 静态站点生成器 | 做“构建”这件事的工具，如 Hugo | 印刷机 |

### 2. 版本管理

| 名词 | 一句话解释 | 比喻 |
|---|---|---|
| 仓库（repository） | 存放项目所有文件和历史的目录 | 带档案柜的工作室 |
| commit | 一次带说明的存档 | 游戏存档 |
| branch | 一条独立的修改线 | 平行草稿 |
| push | 把本地提交同步到远程仓库 | 把稿子寄给出版社 |
| deploy | 把新版本放到线上 | 新书铺货 |

### 3. 托管与网络

| 名词 | 一句话解释 | 比喻 |
|---|---|---|
| 托管（hosting） | 存放并对外提供网页文件的服务 | 书店和仓库 |
| CDN | 把文件复制到各地节点的网络 | 就近仓库 |
| 域名 | 网站的人类可读名字 | 门牌号 |
| 注册商（registrar） | 出售并管理域名的机构 | 门牌发放处 |
| DNS | 把域名翻译成 IP 地址的系统 | 电话簿 |
| NS（nameserver） | 负责回答某个域名解析的服务器 | 电话簿的负责部门 |
| A 记录 | 域名 → IPv4 地址的记录 | “这个名字对应这个门牌” |
| CNAME | 域名 → 另一个域名的别名记录 | “这个别名去查那个名字” |
| 根域名（apex） | 不带 `www` 的主域名 | 大楼正门 |
| TTL | DNS 记录的缓存时间 | 电话簿多久更新一次 |
| HTTPS / TLS | 加密并验证身份的网页传输 | 防伪密封信封 |
| 证书 | 证明网站身份的电子文件 | 防伪身份证 |
| Let's Encrypt | 免费签发证书的机构 | 免费办证处 |

### 4. SEO 与收录

| 名词 | 一句话解释 | 比喻 |
|---|---|---|
| 收录 / 索引 | 搜索引擎把网页存进自己的数据库 | 图书馆编目 |
| SEO | 让网页更容易被搜到的做法 | 让书更容易被找到 |
| sitemap | 告诉搜索引擎“我有哪些页面”的清单 | 书店目录 |
| robots.txt | 告诉爬虫“哪些能爬、哪些不能”的文件 | 仓库门上的告示 |
| canonical | 告诉搜索引擎“哪个 URL 是正版” | 书的正式版次 |
| GSC | Google Search Console，查看收录和搜索表现的工具 | 书店的销售报表 |

想快速核对参数，见技术手册的[参数速查表]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-params)；想看每个词对应的操作，见技术手册的[SEO 章节]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-seo)。

<a id="cost"></a>

## 九、这套方案要花多少钱、多久

**钱**：GitHub、Netlify、Cloudflare DNS 都有免费额度，个人博客通常够用。唯一必须的支出是域名年费，常见 `.com` 域名大约每年几十到一百多元人民币，具体取决于注册商和促销。

**时间**：熟悉流程后，从零到上线大约 1–2 小时；第一次做，建议预留半天，因为 DNS 生效和证书签发都需要等待，遇到问题还要排查。

**隐性成本**：你需要花一点时间理解 Markdown、Git 和 DNS 的基本概念。好消息是，这些概念一旦理解，换主题、换托管商都不需要重学。

{{< callout type="info" >}}
**如果只记住一件事**：这套方案的钱主要花在域名上，时间主要花在第一次理解和排错上。之后每写一篇文章，发布只需要几分钟。
{{< /callout >}}

<a id="why-stack"></a>

## 十、为什么这套组合这样分工

你可能会问：为什么不能用一个服务全包了？

可以，但分工有分工的好处：

- **Hugo**：生成速度快，不需要数据库，内容就是普通文件，容易备份和迁移。
- **GitHub**：每次修改都有历史，改坏了可以回滚，也方便以后多人协作。
- **Netlify**：和 GitHub 打通后，推送代码就自动构建、自动上线，还负责 CDN 和 HTTPS 证书。
- **Cloudflare**：负责域名注册和 DNS。它不托管网页，但它是访客找到你的第一站。

代价是：服务多了，排查问题时需要判断“坏在哪一层”。但只要记住四层架构，这件事并不难。

{{< callout type="info" >}}
**如果只记住一件事**：每一层都可以替换。把 Netlify 换成别的托管商，或者把 Hugo 换成别的生成器，其他层的思路不变。
{{< /callout >}}

技术手册开头的[四层架构速查]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-architecture)可以作为随时回来的地图。

<a id="misconceptions"></a>

## 十一、常见误解

| 误解 | 实际情况 |
|---|---|
| “GitHub 仓库就是 GitHub Pages” | 仓库只是存代码；GitHub Pages 是另一项托管服务。本文用的是 Netlify。 |
| “Cloudflare 帮我托管网站” | Cloudflare 主要管域名和 DNS；网页内容在 Netlify。 |
| “买了域名，网站就能打开了” | 还需要托管、部署和正确的 DNS 记录。 |
| “HTTPS 是网站自己生成的” | 证书由受信任的机构签发，托管商通常自动完成。 |
| “提交 sitemap 就会立刻被收录” | 收录需要搜索引擎抓取和处理，通常几天到几周。 |
| “网站上线了就等于能被搜到” | 上线只代表能访问；被收录是另一件事。 |
| “静态网站不能有评论和搜索” | 可以借助外部服务实现，只是不靠服务器现场计算。 |

<a id="reading-path"></a>

## 十二、接下来怎么读

建议按这个顺序：

1. **先读完这篇总纲**，确保能用一句话解释每一层。
2. **打开[技术手册]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}})），按章节顺序操作**：准备 → 建站 → 内容 → Git → Netlify → Cloudflare → 验收 → SEO。
3. **每完成一步就验证**，不要一口气做完再排查。
4. **卡住时先看排错表**，再回头确认自己坏在哪一层。

| 你想做什么 | 看技术手册哪一节 |
|---|---|
| 本地把网站建起来 | [本地搭建 Hugo + Hextra]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-setup) |
| 写中英双语文章 | [双语内容模型]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-content) |
| 把代码推到 GitHub | [构建与 Git]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-git) |
| 部署到 Netlify | [Netlify 托管]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-netlify) |
| 绑定 Cloudflare 域名 | [Cloudflare 域名连接]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-domain) |
| 检查是否真的上线 | [上线验收清单]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-verify) |
| 让搜索引擎收录 | [SEO 章节]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-seo) |
| 网站打不开、证书报错 | [常见问题排查]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-troubleshooting) |
| 快速查参数 | [参数速查表]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}}#tech-params) |

{{< callout type="info" >}}
**如果只记住一件事**：总纲用来建立地图，技术手册用来走路。迷路时回到地图，不要在地图里找步骤，也不要在手册里背原理。
{{< /callout >}}

## 十三、三句话总结

看到这里，你已经比大多数“只会点下一步”的人更清楚网站是怎么运转的了。接下来，去[技术手册]({{< relref "blog/hugo-hextra-netlify-cloudflare" >}})动手吧。

1. **Hugo 生成，GitHub 版本，Netlify 托管，Cloudflare 指路。**
2. **域名不是网站，DNS 只是电话簿。**
3. **上线不等于被收录。**
