# Repository Guidelines

## Project Overview

Personal portfolio + blog for HAMADA Taigen, bilingual EN (`/`) / JA (`/ja`). Static site: TanStack Solid Start prerendered to plain HTML, deployed on Cloudflare Pages (`dist/client`, `NODE_VERSION=22`, branch `main`). No analytics, comments, theme toggle, or server runtime — by design (see README "Not included").

## Architecture & Data Flow

```
src/content/blog/*.md ──import.meta.glob(?raw, eager)──▶ src/lib/posts.ts (parsePostFile)
   filename <slug>.<en|ja>.md → slug+lang; js-yaml frontmatter; marked → html
   module-level posts[] + pure helpers: getPosts(lang) · getPost(lang, slug) · getTranslation(post)
        │
        ▼
src/routes/* (head() + component) ──props {locale}──▶ src/components/*
        │
        ▼
vite build (tanstackStart prerender, crawlLinks) → dist/client HTML
   → scripts/set-html-lang.mjs rewrites <html lang> (ja/** → ja, else en; head API can't set html attrs)
   → scripts/verify-build.mjs substring-checks the emitted HTML
```

- **Zero runtime data fetching**: no loaders, no `createResource`/`createAsync`, no server functions, no fetch. Everything is bundled at build time; content helpers are called synchronously in `head()` and components.
- **Profile data lives in YAML**: `src/content/profile.yaml` (en/ja duplicated inline) → `src/lib/profile.ts` `parseProfile()` (js-yaml + fail-fast validation: missing locale, en/ja bullet parity, starred group). Same build-time `?raw` import pattern as posts — no runtime parsing.
- **i18n by URL, not state**: locale derives from pathname every render (`localeFromPath` in `src/lib/i18n.ts`). No locale signal/context/store. Two data sources: `ui` (chrome strings, `ja: typeof en` structural typing) and `profile` (`Localized<T> = Record<Locale, T>` in `src/content/profile.yaml`, loaded by `src/lib/profile.ts`).
- **Duplicated locale routes**: EN and JA pages are separate route files (`routes/index.tsx` vs `routes/ja/index.tsx`, etc.) — no dynamic locale segment. When changing one, mirror the other.
- **Router**: `createRouter` in `src/router.tsx` (`scrollRestoration`, `defaultPreload: 'intent'`). `__root.tsx` splits `shellComponent` (full HTML document) from `component` (in-page layout) and registers `notFoundComponent`.

## Key Directories

| Path | Purpose |
| --- | --- |
| `src/routes/` | File-based routes, flat (`__root.tsx`, `index.tsx`, `ja/**`, `blog/**`, `404.tsx`) |
| `src/lib/` | Pure logic: `i18n.ts`, `posts.ts` (content pipeline), `profile.ts` (profile loader/validation), `site.ts` — plus colocated `*.test.ts` |
| `src/components/` | Shared chrome (`Header`, `Footer`, `LangSwitcher`, `NotFoundView`); `home/`, `blog/` page sections |
| `src/content/` | `blog/*.md` posts (`<slug>.<en\|ja>.md`, YAML frontmatter: `title`, `description`, `date: YYYY-MM-DD`, optional `translationKey`) + `profile.yaml` (site profile data, en/ja inline) |
| `src/styles/` | `app.css` — entire Tailwind v4 config, CSS-first |
| `scripts/` | `set-html-lang.mjs` (post-build), `verify-build.mjs` (build smoke gate) |
| `docs/superpowers/plans/` | Original implementation plan with rationale/invariants |

## Development Commands

```bash
pnpm dev               # dev server at http://localhost:3000
pnpm test              # vitest run (lib unit + content invariants)
pnpm build             # vite build (prerender) + set-html-lang.mjs
pnpm verify            # assert dist/client pages exist + contain expected strings
pnpm start             # node dist/server/server.js (rarely needed; site is static)
pnpm generate-routes   # tsr generate — regenerates src/routeTree.gen.ts
```

Verification after changes: `pnpm test` for `src/lib/**`; `pnpm build && pnpm verify` for anything affecting rendered output (routes, components, content, styles). No lint or typecheck script exists.

## Code Conventions & Common Patterns

- **Solid reactivity**: never destructure props — access `props.locale` inside JSX/getters. Derived state as getter functions (`const t = () => ui[props.locale]`), `useLocation({ select: (l) => l.pathname })` for reactive pathname, `useParams({ strict: false })` for optional params, `createMemo` only when computing across data (see `LangSwitcher`).
- **Components**: named function exports (no defaults), PascalCase files, locale passed explicitly as `props: { locale: Locale }`.
- **Routes**: `export const Route = createFileRoute('<path>')({ head, component })`; SEO head lives in `head()` (OG, canonical, hreflang + `x-default` → EN URL). Unknown slug in `head()` → return `{}`; component renders localized not-found block.
- **Error handling**: fail-fast at build time — `parsePostFile` throws descriptive errors (unit-tested). No try/catch or errorComponent in components.
- **Styling**: Tailwind v4 CSS-first in `src/styles/app.css` — `@import "tailwindcss"`, `@plugin "@tailwindcss/typography"`, design tokens as `:root` CSS vars with `prefers-color-scheme: dark` override, exposed via `@theme inline` (`bg-bg`, `text-fg`, `text-muted`, `border-line`, `text-accent`, `font-sans/mono`). Dark mode is automatic — no JS toggle. Trusted markdown rendered via `innerHTML={post.html}` + `.prose`.
- **TypeScript**: strict, `verbatimModuleSyntax`, `moduleResolution: bundler`, no path aliases (relative imports), `noEmit` (Vite transpiles). No `tailwind.config.*`.

## Important Files

- `src/routeTree.gen.ts` — **GENERATED, never hand-edit** (header forbids it). Regenerated by the vite plugin or `pnpm generate-routes` when route files change. Committed but readonly-flagged in `.vscode/settings.json`.
- `src/lib/posts.ts` — content pipeline; changing the frontmatter schema or filename convention ripples into tests and `verify-build` needles.
- `src/lib/profile.ts` — loads + validates `src/content/profile.yaml` (js-yaml, fail-fast); `profile.test.ts` asserts exact data values and `parseProfile` error paths.
- `vite.config.ts` — plugin order matters: `tanstackStart` before `solid`. Prerender config (`enabled`, `crawlLinks`) and the `/404` → `404.html` outputPath live here.
- `scripts/verify-build.mjs` — hardcoded `[file, needle]` checks; new pages/posts must be added here.
- `tsr.config.json` — just `{ "target": "solid" }`.

## Runtime/Tooling Preferences

- **Node** (not Bun): scripts invoke `node` directly; Cloudflare build uses `NODE_VERSION=22`. ESM (`"type": "module"`, scripts are `.mjs`).
- **pnpm** only (lockfile + `.cta.json` record it; no `engines`/`packageManager` field). `pnpm-workspace.yaml` exists solely for `allowBuilds` (esbuild, lightningcss) — not a monorepo.
- Generated/do-not-touch: `src/routeTree.gen.ts`, `pnpm-lock.yaml`, `dist/`, `.tanstack/`, `.cta.json` (stale scaffold snapshot — says `tailwind: false`, wrong), `.superpowers/` (agent scratch, gitignored).

## Testing & QA

- **Vitest 4** (`vitest.config.ts`: `src/**/*.test.ts`, node environment, no coverage tooling, no CI). Tests colocated in `src/lib/`.
  - `i18n.test.ts` — locale path helpers + EN/JA ui dictionary key-structure parity.
  - `posts.test.ts` — `parsePostFile` units (frontmatter, slug/lang, errors).
  - `posts.content.test.ts` — **shipped-content invariants: hardcodes post count (2, one per language) and exact content markers. Adding/removing a post requires updating this file.**
  - `profile.test.ts` — profile data completeness (exact identity/contact values, job ordering, cross-locale bullet parity).
- **Build gate**: `pnpm verify` substring-checks prerendered HTML (names, `lang=` attributes, hreflang, post titles, 404 text) and exits 1 on any miss. Its ` lang="en">` needle depends on `set-html-lang.mjs` appending `lang` as the final `<html>` attribute — keep the two scripts coupled.
- No component/DOM tests; visual changes verified via `pnpm build && pnpm verify` (and `pnpm dev`).

### Common tasks

- **Add a blog post**: drop `<slug>.<en|ja>.md` into `src/content/blog/` with frontmatter; pair EN/JA via `translationKey` (defaults to slug). Update `posts.content.test.ts` counts/markers and `scripts/verify-build.mjs` needles.
- **Add a route**: create file(s) under `src/routes/` (mirror under `ja/` if localized); never touch `routeTree.gen.ts`.
- **Add UI strings**: add key to `en` in `src/lib/i18n.ts`, mirror in `ja` (shape-parity test enforces it).
- **Edit profile data**: edit `src/content/profile.yaml` — every text field needs both `en` and `ja`; quote bare numbers (YAML parses `2020` as int) or `parseProfile` fails the build with a field-path message.
