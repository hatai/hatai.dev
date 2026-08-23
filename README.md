# hatai.dev

Personal portfolio and blog for Taigen Hamada (EN `/` · JA `/ja`).
Static site: TanStack Solid Start, prerendered to plain HTML, deployed on Cloudflare Pages.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server at http://localhost:3000 |
| `pnpm test` | Unit tests (i18n, content pipeline, profile data) |
| `pnpm build` | Prerender the whole site |
| `pnpm verify` | Assert the build emitted all expected pages |

## Writing a blog post

Add `src/content/blog/<slug>.<en|ja>.md` with frontmatter:

```markdown
---
title: Post title
description: One-line description for lists and meta tags
date: YYYY-MM-DD
translationKey: shared-key   # omit to use the slug; pair EN/JA posts with the same key
---
```

Posts can exist in one language only. The language switcher falls back to the
other locale's blog index when no translation exists.

## Deploy (Cloudflare Pages, Git integration)

1. Push this repo to `github.com/hatai/hatai.dev` (public).
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git →
   select the repo.
3. Build settings: framework preset **none**, build command `pnpm build`,
   output directory `dist/client`, node version env `NODE_VERSION=22`.
4. Production branch `main`; every push deploys automatically.

## Domain & email (one-time, manual)

- Register `hatai.dev` at a registrar (Cloudflare Registrar cannot register new
  domains — transfer only). `.dev` is HSTS-preloaded: HTTPS only; Pages issues
  certificates automatically.
- Add the domain to Cloudflare, point its nameservers at Cloudflare, then attach
  it in the Pages project → Custom domains.
- Cloudflare Email Routing: enable for the zone, create
  `me@hatai.dev` → (forward to personal address) so the address published on
  this site receives mail.

## Not included (deliberate)

- No analytics, no comments, no client-side theme toggle (auto light/dark via
  `prefers-color-scheme`), no og:image generation, no sitemap.xml (site is small
  and fully crawlable from `/`).
