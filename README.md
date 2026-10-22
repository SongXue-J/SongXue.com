# SongXue.com

Personal academic blog of Song Xue — pathogen/humoral immunity research, R data visualization, single-cell sequencing, and scientific computing.

Built with [Hugo](https://gohugo.io/) + [Hextra](https://github.com/imfing/hextra) theme.

- Live site: <https://www.songxue-j.com/>
- CV: <https://www.songxue-j.com/cv/>
- Local operations guide: `docs/SITE-GUIDE.md` (gitignored, not on GitHub)

## Local development

```bash
hugo server
# → http://localhost:1313
```

## Build

```bash
hugo --minify
# → public/
```

## Deploy

Push to `main` → auto-deployed by [Netlify](https://www.netlify.com). Configuration in `netlify.toml`.
