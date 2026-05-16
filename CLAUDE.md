# SongXue.com — Personal Academic Blog

Hugo static site with Hextra theme, bilingual (EN / 简体中文), optional R blogdown integration.

## Architecture

```
Blog/
├── hugo.yaml              # Site config (languages, menus, params)
├── hugo.work              # Hugo workspace: use ../
├── netlify.toml           # Netlify fallback deploy
├── content/               # Markdown content (bilingual)
│   ├── _index.md          # Homepage EN
│   ├── _index.zh-cn.md    # Homepage ZH
│   ├── about/             # Persona introduction
│   ├── cv/                # Academic CV
│   └── blog/              # Blog posts (subdir per post)
├── assets/                # CSS, JS, images (processed by Hugo)
├── static/                # Static files (copied as-is to public/)
├── layouts/               # Custom templates overriding Hextra
├── i18n/                  # en.yaml, zh-cn.yaml translations
├── data/                  # icons.yaml
├── themes/hextra/         # Theme (git submodule via Hugo module)
├── _reference/            # Archived template examples (excluded from build)
└── .github/workflows/     # GitHub Actions deploy
```

## Bilingual content convention

- `_index.md` = English version
- `_index.zh-cn.md` = Chinese version
- Both must have matching frontmatter structure
- Language switcher rendered automatically by Hextra

## Content workflow

- **Data analysis posts** (R visualization, single-cell pipelines): `.Rmd` → blogdown → `.md` output
- **Other posts** (software tips, AI workflows): plain `.md`
- Blog posts live in `content/blog/<slug>/index.md` + `index.zh-cn.md`
- Frontmatter: `title`, `date`, `categories`, `tags`, `toc`

## Commands

```bash
hugo server                    # Dev server at http://localhost:1313
hugo --minify                  # Production build → public/
hugo new blog/my-post/index.md # New post scaffold (if archetypes exist)
```

## Deployment

- Push to `main` → GitHub Actions builds + deploys to GitHub Pages
- Repository: `github.com/SongXue-J/SongXue.com`
- Custom domain: SongXue.com (pending purchase)
- Netlify configured as fallback

## Subagent architecture

When tasks span multiple domains, spawn agents with clear isolation:

| Agent | Use for | Example |
|-------|---------|---------|
| **content** | Writing/editing posts, translating, managing frontmatter | "Write a post about FlowJo gating strategy" |
| **design** | CSS changes, layout templates, UI polish | "Redesign the homepage hero section" |
| **deploy** | Build, push, verify Actions, domain config | "Deploy and verify the site is live" |
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

- **`blog-post`**: Scaffold bilingual post from outline → creates `content/blog/<slug>/index.md` + `index.zh-cn.md` with proper frontmatter
- **`blog-deploy`**: Build → check → commit → push → verify Actions

## Hugo module note

Hextra is imported as a Hugo module (not git submodule). `hugo.work` sets `use ../` for local theme. On first build, Hugo downloads the module to the cache.
