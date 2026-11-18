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

- **Add a blog post**: drop `<slug>.<en|ja>.md` into `src/content/blog/` with frontmatter; pair EN/JA via `translationKey` (defaults to slug). Update `posts.content.test.ts` counts/markers and `scripts/verify-build.mjs` needles. Authoring rules (style, disclosure, filters, review) live in 「ブログ記事執筆」 below.
- **Add a route**: create file(s) under `src/routes/` (mirror under `ja/` if localized); never touch `routeTree.gen.ts`.
- **Add UI strings**: add key to `en` in `src/lib/i18n.ts`, mirror in `ja` (shape-parity test enforces it).
- **Edit profile data**: edit `src/content/profile.yaml` — every text field needs both `en` and `ja`; quote bare numbers (YAML parses `2020` as int) or `parseProfile` fails the build with a field-path message.

## ブログ記事執筆

このブログの記事を書くエージェント（執筆・査読）への正本ルール。2026-11-18 の運用（PR #6 / PR #7）で得た判断を集約したもの。

### 前提

- 公開は本人のマージでのみ行う。自動マージ・main への直接 push は禁止。
- 記事は日英ペア（`src/content/blog/<slug>.ja.md` / `.en.md`）。日本語が正本、英語は翻訳で、英語だけに情報を足さない。
- フロントマターは `title` / `description` / `date` のみ（`translationKey` は省略）。

### 作り方（フロー v3）

1. Muse（編集）が日々の活動からテーマを選び、本人にインタビュー質問（3〜5問、短答可）を出す。
2. 本人の回答が素材の核。回答がない週は記事を作らない。
3. 執筆はブリーフ（テーマ、事実、インタビュー素材、アウトライン）に基づいて行う。ブリーフにない事実を推測で作らない。
4. 査読は執筆と別モデルが行い、事実照合・文体・フィルタを見て最大2往復で直す。

### 文体

- 一人称で書く。書き手は本人として書く。
- 短い文で切る。説明を盛らない。接続詞でダラダラつながない。
- AI 定型句を使わない: 「〜が重要です」「大きな一歩です」「まとめると」「革新的な」等。
- インタビュー素材がある記事では、本人の言い回しをできるだけ残す。
- 具体的な数字・固有名詞・日付を入れる（「大幅に改善」ではなく実数で）。ただし裏付けの取れない数字は入れない。数字を使うときは出典（何をどう数えたか）を説明できること。
- 誇張や煽りをしない。失敗や制約、未解決のこともそのまま書く。観測と推測を分ける。
- 締めは短く。連絡先への誘導は入れても1行まで。

### タイトル

- 知らない読者が止まる固有名詞をタイトルの前面に出さない（例: 製品名・プロジェクト名）。固有名詞は本文の最初で紹介する。
- 一般名詞で「何の話か」が分かる形にする。

### リンクと番号

- 自分のリポジトリの PR・Issue・コミットへのリンクや番号（#300、PR #155 等）は本文に入れない。出来事は番号なしで伝わるように書く。
- 読者に意味のある外部の一般公開情報（製品の公式ページ等）へのリンクはよい。
- 外部のツール・製品名は初出で公式サイトへリンクする（例: Muse → https://muse.ai、T3 Code → https://t3.codes）。
- 製品名は正式表記を使う: **T3 ではなく T3 Code**（T3 Chat という別製品があるため）。
- 読者が知らない前提のツール・製品には注釈を付ける。形式は脚注: 初出に脚注参照を付け、説明は1項目1〜2文で記事末尾の脚注に置く。

### 専門用語と図

- 専門用語は初出で短く補足する（例: ラベル名だけで済ませず「着手OKの合図（人間が判断）」と書く）。
- 図は SVG で `public/` 配下の既存の置き方に合わせ、サイトのアクセントカラーに寄せる。
- フロー図は担当ごとのレーンに分け、実際の段取り（判断ゲート、差し戻しループ、例外経路）が追える粒度にする。大雑把な箱と矢印だけにしない。
- 図の直下に用語の短い説明（凡例）を置く。

### 開示

- 冒頭（タイトル直下）に AI 開示を引用ブロックで置く。
  - 基本形: 「この記事は、AI が下書きを作成し、人間（筆者）が内容の確認と修正を行ったものです。」
  - フロー紹介記事では、そのフローで作られた旨の形にしてよい。EN 版も同趣旨を置く。

### 公開フィルタ

- 仕事の固有名詞・顧客情報・社内システムの詳細は書かない。一般化できる学びだけ残す。
- 金融・口座・個人の手続きはネタにしない。秘密情報・認証情報・他者の個人情報は含めない。
- 公開リポジトリのプロジェクト（例: Pelway）の設計判断は書いてよい。

### 技術作法

- ブランチは `blog/<slug>`、PR は main 向け。マージはしない。
- 提出前に `pnpm test` / `pnpm build` / `pnpm verify` を通し、結果を報告に含める。
- 既存記事とリポの README（「Writing a blog post」）の作法を優先する。

### 査読チェックリスト

- [ ] 事実（番号・日付・数字）に出典があり、盛られていないか
- [ ] 本人の声（インタビュー素材）が核になっているか、AI 定型句が残っていないか
- [ ] 自分のリポの番号・リンクが入っていないか
- [ ] 専門用語に補足があり、図のラベルが平易か
- [ ] 開示文が冒頭にあるか
- [ ] 公開フィルタに触れる内容がないか
