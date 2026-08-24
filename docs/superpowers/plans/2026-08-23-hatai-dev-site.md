# hatai.dev Personal Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A bilingual (EN/JA) static portfolio + blog for Taigen Hamada, prerendered with TanStack Solid Start and deployed to Cloudflare Pages at `hatai.dev`.

**Architecture:** URL-prefix i18n (`/` = English default, `/ja` = Japanese). One shared layout and one set of bilingual section components driven by a typed data module (`profile.ts`) — no duplicated markup per locale. Blog posts are Markdown files with YAML frontmatter, loaded at build time via Vite `import.meta.glob('?raw')`, parsed with js-yaml, rendered with marked. Fully static: `prerender: { enabled: true, crawlLinks: true }` emits plain HTML; no server runtime.

**Tech Stack:** `@tanstack/solid-start` + `@tanstack/solid-router` + Vite + TypeScript (scaffolded by `@tanstack/cli`), Tailwind CSS v4 (`@tailwindcss/vite` + `@tailwindcss/typography`), js-yaml, marked, Vitest.

## Global Constraints

- Design is APPROVED — do not re-propose. Minimal, typography-centered, responsive, light/dark via `prefers-color-scheme` media query only (NO JavaScript theme toggle).
- i18n by URL prefix: `/` = English (default), `/ja` = Japanese. Blog articles are independent per language, cross-linked by frontmatter `translationKey`; one-sided posts are valid.
- Site URL is `https://hatai.dev` (domain not yet acquired — build assumes it anyway). Contact email is `me@hatai.dev` (Cloudflare Email Routing, configured at deploy time).
- Static output only: Cloudflare Pages Git integration, build command `pnpm build`, output directory `dist/client` (recorded in Task 1: vite 8 / @tanstack/solid-start 1.168.46 emit here, NOT `.output/public`).
- Node >= 22, pnpm package manager. All user-facing site copy: EN and JA per locale. Code identifiers/comments: English.
- Identity data (verified from `~/repos/hatai/job/resume-draft.md`): name EN `Taigen Hamada`, JA `濱田 泰源`; GitHub `https://github.com/hatai`; LinkedIn `https://linkedin.com/in/hamadataigen`; availability 20–30 hrs/week contractor, JST, async-first.
- tanstackStart plugin MUST come before the `vite-plugin-solid` plugin in `vite.config.ts` (verified requirement).
- Never render untrusted Markdown — all content under `src/content/` is authored by the site owner.
- One commit per task (conventional commits). No placeholder text anywhere in shipped pages (`TBD`, `lorem`, etc.).
- Personal facts come ONLY from this plan / `resume-draft.md` — never invent metrics, employers, or dates.

---

### Task 1: Scaffold & Toolchain Baseline

**Files:**
- Create: project scaffold via `@tanstack/cli` (blank Solid Start template)
- Modify: `vite.config.ts` (final prerender + Tailwind config)
- Create: `vitest.config.ts`
- Modify: `package.json` (test script)
- Modify: `.gitignore` (ensure build output ignored)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: runnable dev/build; `pnpm test` wired to Vitest; deps `js-yaml`, `marked`, `tailwindcss`, `@tailwindcss/vite`, `@tailwindcss/typography`, `@types/js-yaml`, `vitest` installed; output dir convention recorded for later tasks.

- [ ] **Step 1: Verify toolchain**

Run: `node -v && pnpm -v`
Expected: Node >= 22.x, pnpm >= 9.x.

- [ ] **Step 2: Scaffold the project**

The target dir `~/repos/hatai/hatai.dev` exists and is empty except `docs/`. Run from the PARENT:

```bash
cd ~/repos/hatai
pnpm dlx @tanstack/cli@latest create hatai.dev --framework solid --blank --no-tailwind --no-examples --no-git --package-manager pnpm --yes --force
```

If a flag is rejected, run `pnpm dlx @tanstack/cli@latest create --help` and adapt flags; keep: solid framework, blank/no examples, no tailwind add-on, no git, pnpm.

- [ ] **Step 3: Install dependencies**

```bash
cd ~/repos/hatai/hatai.dev
pnpm add js-yaml marked
pnpm add -D tailwindcss @tailwindcss/vite @tailwindcss/typography vitest
```

- [ ] **Step 4: Write final `vite.config.ts`**

Replace the scaffolded file entirely:

```ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    // tanstackStart must come before the solid plugin
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
    }),
    tailwindcss(),
    solid(),
  ],
})
```

Note: a `pages: [{ path: '/404', ... }]` entry is added in Task 8, when the 404 route exists.

- [ ] **Step 5: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
```

(`vitest.config.ts` replaces `vite.config.ts` for Vitest, so the tanstackStart plugin never loads under test.)

- [ ] **Step 6: Add test script**

In `package.json` `scripts`, add: `"test": "vitest run"`.

- [ ] **Step 7: Ensure `.gitignore` covers build output**

Append any missing of: `.output`, `.nitro`, `.tanstack`, `dist`, `node_modules`.

- [ ] **Step 8: Baseline build proof**

```bash
git init -b main && git add -A && git commit -m "chore: scaffold TanStack Solid Start project"
pnpm build
```

Expected: build succeeds; prerender log shows the root `/` rendered. Locate the emitted HTML (glob for `**/index.html` under `.output` — expected `.output/public/index.html`). RECORD the actual output dir; if not `.output/public`, substitute it everywhere later (verify script default arg, README deploy table).

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "chore: prerender vite config, tailwind v4, vitest baseline"
```

---

### Task 2: i18n Foundation

**Files:**
- Create: `src/lib/i18n.ts`
- Test: `src/lib/i18n.test.ts`

**Interfaces:**
- Produces (used by Tasks 3–8):
  - `type Locale = 'en' | 'ja'`
  - `const ui: Record<Locale, Ui>` — all UI strings; shape below is the contract
  - `localePath(locale: Locale, path: string): string`
  - `alternateLocalePath(locale: Locale, pathname: string): string`
  - `localeFromPath(pathname: string): Locale`

- [ ] **Step 1: Write failing tests** — `src/lib/i18n.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  alternateLocalePath,
  localeFromPath,
  localePath,
  ui,
  type Locale,
} from './i18n'

describe('localePath', () => {
  it('keeps English paths unprefixed', () => {
    expect(localePath('en', '/')).toBe('/')
    expect(localePath('en', '/blog')).toBe('/blog')
  })
  it('prefixes Japanese paths with /ja', () => {
    expect(localePath('ja', '/')).toBe('/ja')
    expect(localePath('ja', '/blog/my-post')).toBe('/ja/blog/my-post')
  })
})

describe('alternateLocalePath', () => {
  it('adds /ja to an English path', () => {
    expect(alternateLocalePath('en', '/')).toBe('/ja')
    expect(alternateLocalePath('en', '/blog/x')).toBe('/ja/blog/x')
  })
  it('strips /ja from a Japanese path', () => {
    expect(alternateLocalePath('ja', '/ja')).toBe('/')
    expect(alternateLocalePath('ja', '/ja/blog/x')).toBe('/blog/x')
  })
  it('does not treat /ja-prefixed other segments as the locale prefix', () => {
    expect(alternateLocalePath('ja', '/jack')).toBe('/jack')
  })
})

describe('localeFromPath', () => {
  it('detects the locale from a pathname', () => {
    expect(localeFromPath('/')).toBe<Locale>('en')
    expect(localeFromPath('/blog/x')).toBe<Locale>('en')
    expect(localeFromPath('/jack')).toBe<Locale>('en')
    expect(localeFromPath('/ja')).toBe<Locale>('ja')
    expect(localeFromPath('/ja/blog/x')).toBe<Locale>('ja')
  })
})

describe('ui dictionary', () => {
  it('has matching key structure in both locales', () => {
    const shape = (value: unknown): string[] => {
      if (Array.isArray(value)) return ['[]']
      if (typeof value === 'object' && value !== null) {
        return Object.entries(value).flatMap(([key, nested]) =>
          shape(nested).map((suffix) => (suffix === '[]' ? `${key}[]` : `${key}.${suffix}`)),
        )
      }
      return ['']
    }
    expect(shape(ui.ja)).toEqual(shape(ui.en))
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — cannot resolve `./i18n`.

- [ ] **Step 3: Implement `src/lib/i18n.ts`**

```ts
export type Locale = 'en' | 'ja'

const en = {
  nav: { home: 'Home', blog: 'Blog' },
  langLabel: '日本語',
  skipToContent: 'Skip to content',
  home: {
    ctaGitHub: 'GitHub',
    ctaLinkedIn: 'LinkedIn',
    ctaEmail: 'Email',
    highlightsTitle: 'AI-Native Development',
    skillsTitle: 'Skills',
    skillsNote: '★ = daily production use',
    experienceTitle: 'Experience',
    contactTitle: 'Contact',
    contactLead: 'Open to contract work, AI evaluation projects, or a quick tech chat:',
    viewBlog: 'Read the blog',
  },
  blog: {
    title: 'Blog',
    description: 'Notes on full-stack development, AI-native workflows, and how this site was built.',
    backToBlog: 'All posts',
    noPosts: 'No posts yet.',
    readOther: '日本語で読む',
  },
  notFound: {
    title: 'Page not found',
    lead: 'The page you are looking for does not exist.',
    backHome: 'Back to home',
  },
  footer: {
    builtWith: 'Built with TanStack Solid Start',
  },
}

const ja: typeof en = {
  nav: { home: 'ホーム', blog: 'ブログ' },
  langLabel: 'English',
  skipToContent: 'コンテンツへスキップ',
  home: {
    ctaGitHub: 'GitHub',
    ctaLinkedIn: 'LinkedIn',
    ctaEmail: 'メール',
    highlightsTitle: 'AIネイティブ開発',
    skillsTitle: 'スキル',
    skillsNote: '★ = 業務で毎日利用',
    experienceTitle: '職歴',
    contactTitle: 'お問い合わせ',
    contactLead: '契約案件・AI評価プロジェクト・技術雑談など、お気軽にどうぞ:',
    viewBlog: 'ブログを読む',
  },
  blog: {
    title: 'ブログ',
    description: 'フルスタック開発、AIネイティブなワークフロー、このサイトの作り方についてのメモ。',
    backToBlog: '記事一覧',
    noPosts: 'まだ記事はありません。',
    readOther: 'Read in English',
  },
  notFound: {
    title: 'ページが見つかりません',
    lead: 'お探しのページは存在しません。',
    backHome: 'ホームに戻る',
  },
  footer: {
    builtWith: 'TanStack Solid Start で構築',
  },
}

export type Ui = typeof en
export const ui: Record<Locale, Ui> = { en, ja }

export function localePath(locale: Locale, path: string): string {
  if (locale === 'en') return path
  return path === '/' ? '/ja' : `/ja${path}`
}

export function alternateLocalePath(locale: Locale, pathname: string): string {
  if (locale === 'ja') return pathname.replace(/^\/ja(?=\/|$)/, '') || '/'
  return pathname === '/' ? '/ja' : `/ja${pathname}`
}

export function localeFromPath(pathname: string): Locale {
  return pathname === '/ja' || pathname.startsWith('/ja/') ? 'ja' : 'en'
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS (all i18n tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n.ts src/lib/i18n.test.ts
git commit -m "feat: i18n foundation with URL-prefix locale helpers"
```

---

### Task 3: Design System & Root Layout

**Files:**
- Create: `src/styles/app.css`
- Create: `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/LangSwitcher.tsx`, `src/components/NotFoundView.tsx`
- Modify: `src/routes/__root.tsx` (replace scaffold content)
- Create: `public/favicon.svg`, `public/robots.txt`
- Delete: scaffold demo styles/links if any reference them

**Interfaces:**
- Consumes: `ui`, `localeFromPath`, `localePath`, `alternateLocalePath`, `Locale` from `src/lib/i18n.ts`
- Produces: shared shell used by every page — `Header`, `Footer`, `NotFoundView`; CSS utilities `bg-bg`, `text-fg`, `text-muted`, `border-line`, `text-accent`, `bg-accent-soft` (auto light/dark, no JS); main content wrapper `max-w-2xl mx-auto px-5`.

- [ ] **Step 1: Write `src/styles/app.css`**

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

:root {
  --bg: #fbfaf8;
  --fg: #1c1b18;
  --muted: #6f6c66;
  --line: #e5e2db;
  --accent: #9a3412;
  --accent-soft: rgba(154, 52, 18, 0.08);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #121211;
    --fg: #e9e7e2;
    --muted: #a09d95;
    --line: #2a2926;
    --accent: #fb923c;
    --accent-soft: rgba(251, 146, 60, 0.1);
  }
}

@theme inline {
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
  --color-line: var(--line);
  --color-accent: var(--accent);
  --color-accent-soft: var(--accent-soft);
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI",
    "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", sans-serif;
  --font-mono: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas,
    monospace;
}

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-bg text-fg font-sans antialiased;
  }
  ::selection {
    background-color: var(--accent-soft);
  }
}

/* Map typography-plugin prose colors onto the site palette (light/dark aware) */
.prose {
  --tw-prose-body: var(--fg);
  --tw-prose-headings: var(--fg);
  --tw-prose-bold: var(--fg);
  --tw-prose-links: var(--accent);
  --tw-prose-code: var(--fg);
  --tw-prose-quotes: var(--muted);
  --tw-prose-quote-borders: var(--accent);
  --tw-prose-hr: var(--line);
  --tw-prose-counters: var(--muted);
  --tw-prose-bullets: var(--line);
  --tw-prose-captions: var(--muted);
  --tw-prose-th-borders: var(--line);
  --tw-prose-td-borders: var(--line);
}
```

- [ ] **Step 2: Write `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#1c1b18"/>
  <text x="32" y="45" font-family="system-ui, sans-serif" text-anchor="middle" font-size="36" font-weight="700" fill="#fbfaf8">H</text>
</svg>
```

- [ ] **Step 3: Write `public/robots.txt`**

```
User-agent: *
Allow: /
```

- [ ] **Step 4: Write `src/components/LangSwitcher.tsx`**

Solid + TanStack Router note: hooks like `useLocation`/`useRouterState` in `@tanstack/solid-router` return Solid accessors (call them: `pathname()`). If TypeScript reports a plain value instead, drop the `()` — match the package's types in `node_modules`.

```tsx
import { Link, useLocation } from '@tanstack/solid-router'
import { getPost, getTranslation } from '../lib/posts'
import { alternateLocalePath, localeFromPath, ui } from '../lib/i18n'

export function LangSwitcher() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const locale = () => localeFromPath(pathname())
  const other = () => (locale() === 'ja' ? 'en' : 'ja')

  const target = () => {
    const current = pathname()
    const match = /^\/(?:ja\/)?blog\/([^/]+)$/.exec(current)
    if (match) {
      // On a post page: link to the translation if it exists, else the other locale's blog index
      const currentPost = getPost(localeFromPath(current), match[1])
      if (currentPost) {
        const translated = getTranslation(currentPost)
        if (translated) return translated.lang === 'ja' ? `/ja/blog/${translated.slug}` : `/blog/${translated.slug}`
      }
      return other() === 'ja' ? '/ja/blog' : '/blog'
    }
    return alternateLocalePath(locale(), current)
  }

  return (
    <Link
      to={target()}
      lang={other()}
      class="rounded-md border border-line px-2.5 py-1 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
    >
      {ui[locale()].langLabel}
    </Link>
  )
}
```

`src/lib/posts.ts` is created in Task 4. To keep this task compiling, create a minimal stub NOW at `src/lib/posts.ts` containing ONLY:

```ts
import type { Locale } from './i18n'

export interface Post {
  slug: string
  lang: Locale
  translationKey: string
  title: string
  description: string
  date: string
  html: string
}

export function getPost(_lang: Locale, _slug: string): Post | undefined {
  return undefined
}

export function getTranslation(_post: Post): Post | undefined {
  return undefined
}
```

Task 4 replaces this file wholesale.

- [ ] **Step 5: Write `src/components/Header.tsx`**

```tsx
import { Link, useLocation } from '@tanstack/solid-router'
import { LangSwitcher } from './LangSwitcher'
import { localeFromPath, localePath, ui } from '../lib/i18n'
import { profile } from '../lib/profile'

export function Header() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const locale = () => localeFromPath(pathname())
  const t = () => ui[locale()]

  const navClass = (target: string) =>
    `text-sm transition-colors hover:text-accent ${
      pathname() === target ? 'text-fg' : 'text-muted'
    }`

  return (
    <header class="mx-auto flex w-full max-w-2xl items-baseline justify-between px-5 pt-10 pb-6">
      <Link to={localePath(locale(), '/')} class="font-semibold tracking-tight">
        {profile.name[locale()]}
      </Link>
      <nav class="flex items-center gap-4" aria-label="site">
        <Link to={localePath(locale(), '/')} class={navClass(localePath(locale(), '/'))}>
          {t().nav.home}
        </Link>
        <Link to={localePath(locale(), '/blog')} class={navClass(localePath(locale(), '/blog'))}>
          {t().nav.blog}
        </Link>
        <LangSwitcher />
      </nav>
    </header>
  )
}
```

(Same accessor note as Step 4. If `Link` rejects `href` in favor of `to`, use `to` — match the package types.)

- [ ] **Step 6: Write `src/components/Footer.tsx`**

```tsx
import { useLocation } from '@tanstack/solid-router'
import { localeFromPath, ui } from '../lib/i18n'
import { profile } from '../lib/profile'

export function Footer() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const locale = () => localeFromPath(pathname())
  const t = () => ui[locale()]

  return (
    <footer class="mx-auto w-full max-w-2xl px-5 pt-10 pb-12">
      <div class="flex flex-col gap-1 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:justify-between">
        <p>© 2026 {profile.name[locale()]}</p>
        <p>{t().footer.builtWith}</p>
      </div>
    </footer>
  )
}
```

`src/lib/profile.ts` is created in Task 5. To keep this task compiling, create a minimal stub NOW at `src/lib/profile.ts` containing ONLY:

```ts
export const profile = {
  name: { en: 'Taigen Hamada', ja: '濱田 泰源' },
}
```

Task 5 replaces this file wholesale.

- [ ] **Step 7: Write `src/components/NotFoundView.tsx`**

```tsx
import { Link, useLocation } from '@tanstack/solid-router'
import { localeFromPath, localePath, ui } from '../lib/i18n'

export function NotFoundView() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const locale = () => localeFromPath(pathname())
  const t = () => ui[locale()]

  return (
    <main class="mx-auto w-full max-w-2xl px-5 py-24">
      <h1 class="text-3xl font-bold tracking-tight">{t().notFound.title}</h1>
      <p class="mt-3 text-muted">{t().notFound.lead}</p>
      <Link
        to={localePath(locale(), '/')}
        class="mt-8 inline-block text-accent underline underline-offset-4"
      >
        {t().notFound.backHome}
      </Link>
    </main>
  )
}
```

- [ ] **Step 8: Replace `src/routes/__root.tsx`**

```tsx
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/solid-router'

import { HydrationScript } from 'solid-js/web'
import { Suspense } from 'solid-js'

import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { NotFoundView } from '../components/NotFoundView'
import appCss from '../styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFoundView,
})

function RootDocument() {
  return (
    <html>
      <head>
        <HydrationScript />
        <HeadContent />
      </head>
      <body>
        <Suspense>
          <RootLayout />
        </Suspense>
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
    <>
      <a
        href="#content"
        class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-bg focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div class="flex min-h-dvh flex-col">
        <Header />
        <div class="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    </>
  )
}
```

(`shellComponent` provides the html/head/body document shell — TanStack Start requires it for a complete prerendered document; `HeadContent` renders route head() output, `Scripts` the hydration payload.)

(The skip link is intentionally English-only: assistive-tech users get a consistent landmark; keep it.)

- [ ] **Step 9: Build proof**

Run: `pnpm build`
Expected: prerender of `/` succeeds using the new shell (header/footer visible in emitted HTML).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: design tokens, root layout, header/footer, language switcher"
```

---

### Task 4: Content Pipeline (Markdown → Posts)

**Files:**
- Create: `src/lib/posts.ts` (replaces Task 3 stub)
- Test: `src/lib/posts.test.ts`

**Interfaces:**
- Consumes: `Locale` from `i18n.ts`; `Post` interface already referenced by `LangSwitcher` (identical shape)
- Produces:
  - `interface Post { slug: string; lang: Locale; translationKey: string; title: string; description: string; date: string; html: string }`
  - `parsePostFile(name: string, source: string): Post` (pure, tested)
  - `posts: Post[]` (all posts, any locale)
  - `getPosts(lang: Locale): Post[]` (date-descending)
  - `getPost(lang: Locale, slug: string): Post | undefined`
  - `getTranslation(post: Post): Post | undefined`
  - Content convention: files at `src/content/blog/<slug>.<en|ja>.md` with frontmatter `title`, `description`, `date` (YYYY-MM-DD), optional `translationKey` (defaults to slug)

- [ ] **Step 1: Write failing tests** — `src/lib/posts.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { parsePostFile } from './posts'

const EN_POST = `---
title: Hello World
description: First post
date: 2026-01-15
---

# Heading

Body text with **bold**.
`

const JA_POST = `---
title: こんにちは
description: 最初の投稿
date: 2026-02-01
translationKey: hello-world
---

本文。
`

describe('parsePostFile', () => {
  it('parses frontmatter, derives slug and lang from the filename', () => {
    const post = parsePostFile('hello-world.en.md', EN_POST)
    expect(post.slug).toBe('hello-world')
    expect(post.lang).toBe('en')
    expect(post.translationKey).toBe('hello-world')
    expect(post.title).toBe('Hello World')
    expect(post.description).toBe('First post')
    expect(post.date).toBe('2026-01-15')
  })

  it('renders markdown body to HTML', () => {
    const post = parsePostFile('hello-world.en.md', EN_POST)
    expect(post.html).toContain('<h1>Heading</h1>')
    expect(post.html).toContain('<strong>bold</strong>')
  })

  it('honors an explicit translationKey', () => {
    const post = parsePostFile('konnichiwa.ja.md', JA_POST)
    expect(post.translationKey).toBe('hello-world')
    expect(post.title).toBe('こんにちは')
  })

  it('rejects malformed filenames', () => {
    expect(() => parsePostFile('no-lang-suffix.md', EN_POST)).toThrow(/filename/)
    expect(() => parsePostFile('bad.xx.md', EN_POST)).toThrow(/filename/)
  })

  it('rejects missing frontmatter or required fields', () => {
    expect(() => parsePostFile('x.en.md', 'no frontmatter here')).toThrow(/frontmatter/)
    expect(() =>
      parsePostFile('x.en.md', '---\ndescription: d\ndate: 2026-01-01\n---\nbody'),
    ).toThrow(/title/)
    expect(() =>
      parsePostFile('x.en.md', '---\ntitle: t\n date: 2026-01-01\n---\nbody'),
    ).toThrow(/date/)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — `parsePostFile` not exported.

- [ ] **Step 3: Implement `src/lib/posts.ts` (full replacement of the stub)**

```ts
import { parse } from 'marked'
import { load as loadYaml } from 'js-yaml'
import type { Locale } from './i18n'

export interface Post {
  slug: string
  lang: Locale
  translationKey: string
  title: string
  description: string
  date: string
  html: string
}

const FILE_NAME_RE = /^(.+)\.(en|ja)\.md$/
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

interface Frontmatter {
  title?: unknown
  description?: unknown
  date?: unknown
  translationKey?: unknown
}

export function parsePostFile(name: string, source: string): Post {
  const fileNameMatch = FILE_NAME_RE.exec(name)
  if (!fileNameMatch) {
    throw new Error(`bad blog filename: ${name} (expected <slug>.<en|ja>.md)`)
  }

  const sourceMatch = FRONTMATTER_RE.exec(source)
  if (!sourceMatch) {
    throw new Error(`missing frontmatter: ${name}`)
  }

  const data = (loadYaml(sourceMatch[1].trim() || '{}') ?? {}) as Frontmatter
  if (typeof data.title !== 'string' || data.title.length === 0) {
    throw new Error(`missing required frontmatter field "title": ${name}`)
  }
  if (typeof data.date !== 'string' || !DATE_RE.test(data.date)) {
    throw new Error(`frontmatter "date" must be YYYY-MM-DD: ${name}`)
  }

  return {
    slug: fileNameMatch[1],
    lang: fileNameMatch[2] as Locale,
    translationKey:
      typeof data.translationKey === 'string' && data.translationKey.length > 0
        ? data.translationKey
        : fileNameMatch[1],
    title: data.title,
    description: typeof data.description === 'string' ? data.description : '',
    date: data.date,
    html: parse(sourceMatch[2]) as string,
  }
}

const rawModules = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const posts: Post[] = Object.entries(rawModules).map(([file, source]) =>
  parsePostFile(file.split('/').pop()!, source),
)

export function getPosts(lang: Locale): Post[] {
  return posts
    .filter((post) => post.lang === lang)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getPost(lang: Locale, slug: string): Post | undefined {
  return posts.find((post) => post.lang === lang && post.slug === slug)
}

export function getTranslation(post: Post): Post | undefined {
  return posts.find(
    (candidate) =>
      candidate !== post &&
      candidate.lang !== post.lang &&
      candidate.translationKey === post.translationKey,
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS (i18n + posts tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/posts.ts src/lib/posts.test.ts
git commit -m "feat: markdown content pipeline with frontmatter and translation links"
```

---

### Task 5: Profile Data Module

**Files:**
- Create: `src/lib/profile.ts` (replaces Task 3 stub)
- Test: `src/lib/profile.test.ts`

**Interfaces:**
- Produces (used by Tasks 6–8 and `Footer`):
  - `type Localized<T> = Record<Locale, T>`
  - `interface Job { company: Localized<string>; role: Localized<string>; period: Localized<string>; location: Localized<string>; stack: string; highlights: Localized<string[]> }`
  - `interface SkillGroup { category: Localized<string>; starred: boolean; skills: string[] }`
  - `const profile` — exact shape below. `jobs[0]` is the current/most recent job (iCARE).

- [ ] **Step 1: Write failing test** — `src/lib/profile.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { profile } from './profile'
import type { Locale } from './i18n'

const locales: Locale[] = ['en', 'ja']

describe('profile', () => {
  it('exposes identity and contact data', () => {
    expect(profile.name.en).toBe('Taigen Hamada')
    expect(profile.name.ja).toBe('濱田 泰源')
    expect(profile.email).toBe('me@hatai.dev')
    expect(profile.github).toBe('https://github.com/hatai')
    expect(profile.linkedin).toBe('https://linkedin.com/in/hamadataigen')
  })

  it('lists exactly the five known jobs, most recent first', () => {
    expect(profile.jobs).toHaveLength(5)
    expect(profile.jobs[0].company.en).toContain('iCARE')
    expect(profile.jobs[4].company.en).toBe('Network21')
  })

  it('has non-empty localized fields for every job in both locales', () => {
    for (const job of profile.jobs) {
      for (const locale of locales) {
        expect(job.company[locale].length).toBeGreaterThan(0)
        expect(job.role[locale].length).toBeGreaterThan(0)
        expect(job.period[locale].length).toBeGreaterThan(0)
        expect(job.highlights[locale].length).toBeGreaterThan(0)
        for (const bullet of job.highlights[locale]) {
          expect(bullet.length).toBeGreaterThan(0)
        }
      }
      expect(job.stack.length).toBeGreaterThan(0)
    }
  })

  it('has matching bullet counts across locales and at least one starred skill group', () => {
    for (const job of profile.jobs) {
      expect(job.highlights.ja).toHaveLength(job.highlights.en.length)
    }
    expect(profile.skills.some((group) => group.starred)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL — `profile` has no `email`/`jobs` (stub).

- [ ] **Step 3: Implement `src/lib/profile.ts` (full replacement of the stub)**

```ts
import type { Locale } from './i18n'

export type Localized<T> = Record<Locale, T>

export interface Job {
  company: Localized<string>
  role: Localized<string>
  period: Localized<string>
  location: Localized<string>
  stack: string
  highlights: Localized<string[]>
}

export interface SkillGroup {
  category: Localized<string>
  starred: boolean
  skills: string[]
}

export const profile = {
  name: { en: 'Taigen Hamada', ja: '濱田 泰源' },
  title: {
    en: 'Full-Stack Software Engineer · AI-Native',
    ja: 'フルスタックエンジニア · AIネイティブ',
  },
  location: { en: 'Remote — Japan (JST)', ja: 'リモート — 日本(JST)' },
  email: 'me@hatai.dev',
  github: 'https://github.com/hatai',
  linkedin: 'https://linkedin.com/in/hamadataigen',
  availability: {
    en: 'Available 20–30 hrs/week as an independent contractor · Remote · Japan (JST)',
    ja: '独立契約(業務委託)で週20〜30時間対応可能 · リモート · 日本(JST)',
  },
  summary: {
    en: 'Full-stack software engineer with 10 years of experience building production web services end-to-end — POS systems, real-time video streaming, reservation platforms, and healthcare SaaS. Tech lead (PL/PM) and hands-on engineer on teams of 3–6.',
    ja: 'POSシステム、リアルタイム動画配信、予約プラットフォーム、ヘルスケアSaaSなど、プロダクションのWebサービスをEnd-to-Endで構築してきたフルスタックエンジニア(経験10年)。3〜6名チームでテックリード(PL/PM)と実装を兼任。',
  },
  highlights: {
    en: [
      'Replaced a legacy OCR pipeline with LLM-based document extraction for health checkup records (PDF/images → structured data) at a healthcare SaaS serving Japanese enterprises — substantially higher accuracy.',
      'Daily production user of Claude Code, Cursor, GitHub Copilot, Codex, and Devin — distilled the know-how into Agent Skills and shared it across the engineering team.',
      'Spec-driven development: write thorough design docs and context so coding agents deliver the intended result on the first pass.',
      'LLM tooling: LangChain / LangGraph experience for LLM application development.',
    ],
    ja: [
      'ヘルスケアSaaSにおいて、健康診断結果(PDF/画像 → 構造化データ)の既存OCRパイプラインをLLMベースの文書抽出に置き換え、精度を大幅に向上。',
      'Claude Code、Cursor、GitHub Copilot、Codex、Devinを業務で毎日使用。ノウハウをAgent Skillsとして整理し、開発チーム全体に展開。',
      'スペック駆動開発: 設計ドキュメントとコンテキストを丁寧に整備し、コーディングエージェントが一発で意図した成果物を出すための実践。',
      'LLMアプリケーション開発における LangChain / LangGraph の利用経験。',
    ],
  },
  skills: [
    {
      category: { en: 'AI Tooling', ja: 'AIツール' },
      starred: true,
      skills: ['Claude Code', 'Cursor', 'GitHub Copilot', 'Codex', 'Devin', 'LangChain', 'LangGraph'],
    },
    {
      category: { en: 'Languages', ja: '言語' },
      starred: false,
      skills: ['TypeScript', 'JavaScript (ES6)', 'Ruby', 'Python', 'PHP', 'Java', '+ Kotlin, C++11, Lua'],
    },
    {
      category: { en: 'Frontend', ja: 'フロントエンド' },
      starred: false,
      skills: ['React', 'Vue.js', 'Next.js', 'Gatsby', 'Astro', 'TanStack Start', 'React Router v7', 'React Admin', 'Storybook', 'Sass'],
    },
    {
      category: { en: 'Backend', ja: 'バックエンド' },
      starred: false,
      skills: ['Ruby on Rails', 'Node.js / Express', 'FastAPI', 'Django', 'Spring Boot', 'CakePHP', 'Ktor'],
    },
    {
      category: { en: 'Databases', ja: 'データベース' },
      starred: false,
      skills: ['PostgreSQL', 'MySQL / MariaDB', 'MongoDB'],
    },
    {
      category: { en: 'Cloud / Infra', ja: 'クラウド / インフラ' },
      starred: false,
      skills: ['AWS', 'Google Cloud (Cloud Run)', 'Docker', 'Terraform', 'GitHub Actions', 'CircleCI', 'Firebase', 'Cloudflare'],
    },
    {
      category: { en: 'Auth / Others', ja: '認証 / その他' },
      starred: false,
      skills: ['Auth0', 'Twilio', 'Vite', 'Webpack', 'Git'],
    },
  ],
  jobs: [
    {
      company: {
        en: 'iCARE, Inc. — Carely (healthcare SaaS)',
        ja: '株式会社iCARE — Carely(健康管理SaaS)',
      },
      role: {
        en: 'Full-Stack Engineer / Tech Lead (PL/PM)',
        ja: 'フルスタックエンジニア / テックリード(PL/PM)',
      },
      period: { en: 'Nov 2022 – Present', ja: '2022年11月 – 現在' },
      location: { en: 'Tokyo, Japan', ja: '東京' },
      stack: 'Vue.js, Ruby on Rails, Python, FastAPI, AWS, PostgreSQL',
      highlights: {
        en: [
          'Built an LLM-based document ingestion feature: users photograph or scan health checkup results and the system structures the data — replacing OCR with LLMs for substantially higher accuracy.',
          'Led a dedicated AI OCR R&D phase (Oct 2024 – Oct 2025): evaluated models and approaches on real-world documents, then designed and shipped the production pipeline.',
          'Designed a configurable rules engine for health-check conditions (e.g., metabolic syndrome criteria); the design was reused by later features, cutting future dev effort.',
          'Led AI-tool adoption across the engineering org: Claude Code workflows and Agent Skills, improving team-wide productivity.',
        ],
        ja: [
          '健康診断結果を撮影・スキャンするとデータを構造化するLLM文書取り込み機能を開発。OCRをLLMに置き換え、精度を大幅に向上。',
          'AI OCRのR&D専任期間(2024年10月〜2025年10月)を主導。実ドキュメントでモデル・方式を評価し、本番パイプラインを設計・実装。',
          '健康診断判定の設定可能なルールエンジン(メタボリックシンドローム基準など)を設計。柔軟な設計が他機能にも再利用され、開発コストを削減。',
          'Claude CodeワークフローとAgent SkillsによるAIツール導入をエンジニア組織全体で推進し、チーム全体の生産性を向上。',
        ],
      },
    },
    {
      company: { en: 'Legalscape (legal-tech SaaS)', ja: 'Legalscape(法律テックSaaS)' },
      role: { en: 'Independent Contractor — 24 hrs/week', ja: '業務委託 — 週24時間' },
      period: { en: 'Jun 2024 – Jun 2026', ja: '2024年6月 – 2026年6月' },
      location: { en: 'Remote, Japan', ja: 'リモート(日本)' },
      stack: 'Vue.js, React, React Admin, React Router v7, Node.js, Express, TypeORM, Python',
      highlights: {
        en: [
          'Delivered new features and a frontend redesign while working 24 hrs/week in parallel with full-time employment — a proven part-time remote contractor track record.',
          'Full-stack ownership on a 3-person team: frontend and server-side development.',
        ],
        ja: [
          '正社員業と並行して週24時間で勤務しながら、新機能の提供とフロントエンドの全面リニューアルを完遂 — 副業リモート契約の実績。',
          '3名チームでフルスタックを担当: フロントエンドおよびサーバーサイド開発。',
        ],
      },
    },
    {
      company: { en: 'FAIR NEXT INNOVATION', ja: 'FAIR NEXT INNOVATION' },
      role: {
        en: 'Full-Stack Engineer / Tech Lead (PL/PM)',
        ja: 'フルスタックエンジニア / テックリード(PL/PM)',
      },
      period: { en: 'May 2019 – Oct 2022', ja: '2019年5月 – 2022年10月' },
      location: { en: 'Tokyo, Japan', ja: '東京' },
      stack: 'Next.js, React, Gatsby, Node.js, Ruby on Rails, Kotlin/Ktor, GCP (Cloud Run), Auth0, Twilio',
      highlights: {
        en: [
          'Led 5 web services from inception through design and launch as PL/PM and hands-on engineer on teams of 3–6.',
          'Public gym web reservation service (Saga Prefecture): Gatsby + Rails + GCP Cloud Run + Auth0 — designed the entire admin UI/UX myself where no designer was assigned.',
          'Real-time video streaming service (Next.js + Kotlin/Ktor); web gacha and web voting services (Next.js + Rails); contact-center internal chat tool (Next.js + Twilio) shipped on a tight schedule with zero critical bugs.',
        ],
        ja: [
          'PL/PM兼実装エンジニアとして、3〜6名のチームで5つのWebサービスを0→1で立ち上げ。',
          '公共体育館Web予約サービス(佐賀県): Gatsby + Rails + GCP Cloud Run + Auth0。デザイナー不在の中、管理画面のUI/UXを自身で設計。',
          'リアルタイム動画配信サービス(Next.js + Kotlin/Ktor)、Webガチャ・Web投票(Next.js + Rails)、コンタクトセンター向けチャットツール(Next.js + Twilio)を短期間でリリースし、重大バグゼロ。',
        ],
      },
    },
    {
      company: { en: 'Silicon Studio', ja: 'シリコンスタジオ' },
      role: { en: 'C++ Engineer', ja: 'C++エンジニア' },
      period: { en: 'May 2018 – Apr 2019', ja: '2018年5月 – 2019年4月' },
      location: { en: 'Tokyo, Japan', ja: '東京' },
      stack: 'C++11, Qt, Visual Studio, in-house rendering engine (Mizuchi)',
      highlights: {
        en: [
          'Built a digital dashboard mock tool (Qt) used to prototype next-generation vehicle instrument clusters for a major automaker.',
          'Improved driving-simulator graphics: reflected vehicle telemetry (speed, steering angle) in real-time scenes rendered by the in-house engine.',
        ],
        ja: [
          '大手自動車メーカーの次世代車載メーターのプロトタイプに使用されるデジタルダッシュボードモックツール(Qt)を構築。',
          'ドライビングシミュレータのグラフィックを改善: 内製レンダリングエンジンのリアルタイムシーンに車両テレメトリ(速度・操舵角)を反映。',
        ],
      },
    },
    {
      company: { en: 'Network21', ja: 'Network21' },
      role: { en: 'Software Engineer', ja: 'ソフトウェアエンジニア' },
      period: { en: 'May 2016 – Apr 2018', ja: '2016年5月 – 2018年4月' },
      location: { en: 'Tokyo, Japan', ja: '東京' },
      stack: 'Java, Spring, Objective-C, Python, Scrapy, Selenium',
      highlights: {
        en: [
          'Developed an iPad/iPhone POS register application: Java/Spring backend + Objective-C iOS app.',
          'As main programmer, built a web scraping tool that detects cross-site-request vulnerabilities — launched as a new business line with significant early revenue.',
        ],
        ja: [
          'iPad/iPhone向けPOSレジアプリケーションを開発: Java/Springサーバーサイド + Objective-C iOSアプリ。',
          'メインプログラマとして、クロスサイトリクエスト脆弱性を検出するWebスクレイピングツールを構築 — 新規事業として立ち上げ、初期の大きな収益を創出。',
        ],
      },
    },
  ],
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS (all suites).

- [ ] **Step 5: Commit**

```bash
git add src/lib/profile.ts src/lib/profile.test.ts
git commit -m "feat: bilingual profile data module"
```

---

### Task 6: English Home Page

REQUIRED SUB-SKILL: Before writing the components, read `skill://frontend-design` and apply it — elevate visual quality (typography, rhythm, spacing, restrained accent usage) while keeping the exact content, structure, and the minimal/typographic design language. No images, no animations beyond subtle hover transitions.

**Files:**
- Create: `src/components/home/HomePage.tsx`, `src/components/home/Hero.tsx`, `src/components/home/Section.tsx`, `src/components/home/Highlights.tsx`, `src/components/home/Skills.tsx`, `src/components/home/Experience.tsx`, `src/components/home/Contact.tsx`
- Create: `src/lib/site.ts`
- Modify: `src/routes/index.tsx` (replace scaffold content)

**Interfaces:**
- Consumes: `profile` (Task 5), `ui`/`Locale` (Task 2), `SITE_URL`
- Produces: `<HomePage locale={...} />` reused verbatim by Task 7; `Section` component: `<Section id title>{children}</Section>`; `SITE_URL = 'https://hatai.dev'`

- [ ] **Step 1: Create `src/lib/site.ts`**

```ts
export const SITE_URL = 'https://hatai.dev'
```

- [ ] **Step 2: Create `src/components/home/Section.tsx`**

```tsx
import type { JSX } from 'solid-js'

export function Section(props: { id: string; title: string; children: JSX.Element }) {
  return (
    <section class="mt-16" aria-labelledby={props.id}>
      <h2 id={props.id} class="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
        {props.title}
      </h2>
      <div class="mt-6">{props.children}</div>
    </section>
  )
}
```

- [ ] **Step 3: Create `src/components/home/Hero.tsx`**

```tsx
import { Link } from '@tanstack/solid-router'
import { localePath, ui, type Locale } from '../../lib/i18n'
import { profile } from '../../lib/profile'

export function Hero(props: { locale: Locale }) {
  const t = ui[props.locale]
  const p = profile

  return (
    <div class="pt-10 pb-4">
      <h1 class="text-4xl font-bold tracking-tight text-balance">{p.name[props.locale]}</h1>
      <p class="mt-3 text-lg text-muted">{p.title[props.locale]}</p>
      <p class="mt-6 max-w-prose leading-relaxed">{p.summary[props.locale]}</p>
      <p class="mt-4 text-sm text-muted">{p.availability[props.locale]}</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a
          href={`mailto:${p.email}`}
          class="rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-85"
        >
          {t.home.ctaEmail}
        </a>
        <a
          href={p.github}
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-md border border-line px-4 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
        >
          {t.home.ctaGitHub}
        </a>
        <a
          href={p.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-md border border-line px-4 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
        >
          {t.home.ctaLinkedIn}
        </a>
      </div>
      <p class="mt-8 text-sm">
        <Link
          to={localePath(props.locale, '/blog')}
          class="text-accent underline underline-offset-4"
        >
          {t.home.viewBlog} →
        </Link>
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/home/Highlights.tsx`**

```tsx
import { Section } from './Section'
import { ui, type Locale } from '../../lib/i18n'
import { profile } from '../../lib/profile'

export function Highlights(props: { locale: Locale }) {
  const t = ui[props.locale]

  return (
    <Section id="highlights" title={t.home.highlightsTitle}>
      <ul class="space-y-4">
        {profile.highlights[props.locale].map((item) => (
          <li class="border-l-2 border-accent pl-4 leading-relaxed">{item}</li>
        ))}
      </ul>
    </Section>
  )
}
```

- [ ] **Step 5: Create `src/components/home/Skills.tsx`**

```tsx
import { Section } from './Section'
import { ui, type Locale } from '../../lib/i18n'
import { profile } from '../../lib/profile'

export function Skills(props: { locale: Locale }) {
  const t = ui[props.locale]

  return (
    <Section id="skills" title={t.home.skillsTitle}>
      <dl class="space-y-5">
        {profile.skills.map((group) => (
          <div class="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt class="text-sm font-medium">
              {group.category[props.locale]}
              {group.starred ? ' ★' : ''}
            </dt>
            <dd class="text-sm leading-relaxed text-muted">{group.skills.join(' · ')}</dd>
          </div>
        ))}
      </dl>
      <p class="mt-5 text-xs text-muted">{t.home.skillsNote}</p>
    </Section>
  )
}
```

- [ ] **Step 6: Create `src/components/home/Experience.tsx`**

```tsx
import { Section } from './Section'
import { ui, type Locale } from '../../lib/i18n'
import { profile } from '../../lib/profile'

export function Experience(props: { locale: Locale }) {
  const t = ui[props.locale]

  return (
    <Section id="experience" title={t.home.experienceTitle}>
      <ol class="space-y-12">
        {profile.jobs.map((job) => (
          <li>
            <h3 class="text-lg font-semibold tracking-tight">{job.company[props.locale]}</h3>
            <p class="mt-1 text-sm text-muted">
              {job.role[props.locale]} · {job.period[props.locale]} · {job.location[props.locale]}
            </p>
            <p class="mt-2 font-mono text-xs leading-relaxed text-muted">{job.stack}</p>
            <ul class="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {job.highlights[props.locale].map((bullet) => (
                <li>{bullet}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  )
}
```

- [ ] **Step 7: Create `src/components/home/Contact.tsx`**

```tsx
import { Section } from './Section'
import { ui, type Locale } from '../../lib/i18n'
import { profile } from '../../lib/profile'

export function Contact(props: { locale: Locale }) {
  const t = ui[props.locale]

  return (
    <Section id="contact" title={t.home.contactTitle}>
      <p class="leading-relaxed">{t.home.contactLead}</p>
      <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <a href={`mailto:${profile.email}`} class="text-accent underline underline-offset-4">
          {profile.email}
        </a>
        <a
          href={profile.github}
          target="_blank"
          rel="noopener noreferrer"
          class="text-accent underline underline-offset-4"
        >
          GitHub
        </a>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          class="text-accent underline underline-offset-4"
        >
          LinkedIn
        </a>
      </div>
    </Section>
  )
}
```

- [ ] **Step 8: Create `src/components/home/HomePage.tsx`**

```tsx
import type { Locale } from '../../lib/i18n'
import { Hero } from './Hero'
import { Highlights } from './Highlights'
import { Skills } from './Skills'
import { Experience } from './Experience'
import { Contact } from './Contact'

export function HomePage(props: { locale: Locale }) {
  return (
    <main id="content" class="mx-auto w-full max-w-2xl px-5 pb-16">
      <Hero locale={props.locale} />
      <Highlights locale={props.locale} />
      <Skills locale={props.locale} />
      <Experience locale={props.locale} />
      <Contact locale={props.locale} />
    </main>
  )
}
```

- [ ] **Step 9: Replace `src/routes/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/solid-router'
import { HomePage } from '../components/home/HomePage'
import { profile } from '../lib/profile'
import { SITE_URL } from '../lib/site'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: `${profile.name.en} — ${profile.title.en}` },
      { name: 'description', content: profile.summary.en },
      { property: 'og:title', content: `${profile.name.en} — ${profile.title.en}` },
      { property: 'og:description', content: profile.summary.en },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:locale:alternate', content: 'ja_JP' },
    ],
    links: [
      { rel: 'canonical', href: SITE_URL },
      { rel: 'alternate', hreflang: 'en', href: SITE_URL },
      { rel: 'alternate', hreflang: 'ja', href: `${SITE_URL}/ja` },
      { rel: 'alternate', hreflang: 'x-default', href: SITE_URL },
    ],
  }),
  component: () => <HomePage locale="en" />,
})
```

- [ ] **Step 10: Verify in browser**

Run: `pnpm dev`, then browser-drive `http://localhost:3000/`:
- Hero, 5 sections, footer all render; mailto/GitHub/LinkedIn links correct.
- Toggle OS/D emulator dark scheme in devtools — palette flips, no JS toggles.
- Header nav shows Home/Blog + 日本語 switch link.

- [ ] **Step 11: Commit**

```bash
git add src
git commit -m "feat: english home page with sections and seo head"
```

---

### Task 7: Japanese Home Page

**Files:**
- Create: `src/routes/ja/index.tsx`

**Interfaces:**
- Consumes: `HomePage` (Task 6) — no component changes expected; if the EN pass revealed locale-specific layout bugs, fix them in the shared components (not by duplicating).

- [ ] **Step 1: Create `src/routes/ja/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/solid-router'
import { HomePage } from '../../components/home/HomePage'
import { profile } from '../../lib/profile'
import { SITE_URL } from '../../lib/site'

export const Route = createFileRoute('/ja/')({
  head: () => ({
    meta: [
      { title: `${profile.name.ja} — ${profile.title.ja}` },
      { name: 'description', content: profile.summary.ja },
      { property: 'og:title', content: `${profile.name.ja} — ${profile.title.ja}` },
      { property: 'og:description', content: profile.summary.ja },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/ja` },
      { property: 'og:locale', content: 'ja_JP' },
      { property: 'og:locale:alternate', content: 'en_US' },
    ],
    links: [
      { rel: 'canonical', href: `${SITE_URL}/ja` },
      { rel: 'alternate', hreflang: 'ja', href: `${SITE_URL}/ja` },
      { rel: 'alternate', hreflang: 'en', href: SITE_URL },
      { rel: 'alternate', hreflang: 'x-default', href: SITE_URL },
    ],
  }),
  component: () => <HomePage locale="ja" />,
})
```

- [ ] **Step 2: Verify in browser**

`pnpm dev` → `http://localhost:3000/ja`:
- All copy is Japanese; header/footer switch; lang switcher shows `English` and links to `/`.
- `http://localhost:3000/` switcher still shows `日本語` → `/ja`.
- Check Japanese typography: no awkward latin-only font gaps in headings.

- [ ] **Step 3: Build proof**

Run: `pnpm build`
Expected: prerender emits both `/index.html` and `/ja/index.html`.

- [ ] **Step 4: Commit**

```bash
git add src/routes/ja/index.tsx
git commit -m "feat: japanese home page"
```

---

### Task 8: Blog (Content + Routes) & 404

**Files:**
- Create: `src/content/blog/why-i-built-this-site-with-tanstack-solid-start.en.md`
- Create: `src/content/blog/why-i-built-this-site-with-tanstack-solid-start.ja.md`
- Create: `src/components/blog/BlogIndex.tsx`, `src/components/blog/PostPage.tsx`
- Create: `src/routes/blog/index.tsx`, `src/routes/blog/$slug.tsx`
- Create: `src/routes/ja/blog/index.tsx`, `src/routes/ja/blog/$slug.tsx`
- Create: `src/routes/404.tsx`
- Modify: `vite.config.ts` (add the `pages` entry)

**Interfaces:**
- Consumes: `posts` API (Task 4), `ui` (Task 2), `SITE_URL` (Task 6), `NotFoundView` (Task 3)
- Produces: `/blog`, `/ja/blog`, `/blog/$slug`, `/ja/blog/$slug`, `/404` routes; the Markdown content convention documented in Task 4

- [ ] **Step 1: Write the English post** — `src/content/blog/why-i-built-this-site-with-tanstack-solid-start.en.md`:

```markdown
---
title: Why I Built This Site with TanStack Solid Start
description: The stack, design, and deployment choices behind hatai.dev — a static, bilingual portfolio built with TanStack Solid Start.
date: 2026-08-24
---

I am a full-stack engineer with ten years of experience, currently looking for remote contract work with overseas teams. This site is my portfolio and my blog — the place where I control the content, the design, and the stack. Here is why it is built the way it is.

## Why a personal site at all

Job platforms optimize for their matching pipeline, not for showing what you actually built. A personal site is the one URL I can put in a resume that is entirely mine: my work history in my words, in both English and Japanese, with no character limits.

## Why TanStack Solid Start

I spend most of my days in React and Vue, so I deliberately picked a stack I do not use at work. Two reasons:

1. **Dogfooding a newer stack keeps my evaluation skills sharp.** A large part of my recent work is judging where AI-assisted development shines and where it fails. Building with an unfamiliar framework is exactly the kind of exercise that keeps that honest — and it gives me something real to write about.
2. **It fits the actual requirement: a static site.** TanStack Start prerenders every route to plain HTML:

```ts
// vite.config.ts
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'

export default {
  plugins: [
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true },
    }),
  ],
}
```

With `crawlLinks`, the crawler starts at `/`, follows every internal link, and emits a file per page. What ships to Cloudflare Pages is HTML and CSS with a small hydration payload — no server runtime, no database, nothing to babysit.

TanStack Router's type-safe file routing is also genuinely pleasant: routes are files, params are typed, and the link component validates `to` targets at compile time.

## Bilingual by URL prefix

The site is English at `/` and Japanese at `/ja`. Blog articles are independent per language — I write each one natively rather than machine-translating — and a `translationKey` in the frontmatter links a pair together. An article can exist in one language only; the language switcher falls back to the other locale's blog index.

## Minimal by design

Typography does the work: one accent color, a single content column at a comfortable measure, and light/dark handled entirely by `prefers-color-scheme` — no theme toggle JavaScript. Posts are Markdown files parsed at build time, rendered with `marked`, styled with Tailwind's typography plugin.

## What comes next

More posts on AI-native development workflows: how I use Claude Code and Codex with spec-driven context, and what actually works in production. If that is the kind of experience you are hiring for, [get in touch](mailto:me@hatai.dev).
```

- [ ] **Step 2: Write the Japanese post** — `src/content/blog/why-i-built-this-site-with-tanstack-solid-start.ja.md`:

```markdown
---
title: このサイトを TanStack Solid Start で作った理由
description: hatai.dev の技術選定・デザイン・デプロイ — TanStack Solid Start で構築する静的バイリンガルサイトの話。
date: 2026-08-24
---

私は10年経験のフルスタックエンジニアで、現在は海外チームとのリモート契約案件を探しています。このサイトは私のポートフォリオでありブログでもあります。コンテンツもデザインもスタックも、全部自分でコントロールできる場所。なぜこの構成にしたのかを書きます。

## なぜ個人サイトなのか

求人プラットフォームはマッチング側の都合で最適化されていて、あなたが実際に何を作ったかを示すには向きません。個人サイトはレジュメに載せられる、完全に自分のもののURLです。文字数制限もなく、英語と日本語の両方で自分の言葉で職歴を語れます。

## なぜ TanStack Solid Start なのか

私は日頃 React と Vue を使っているので、あえて仕事で使っていないスタックを選びました。理由は2つ:

1. **新しいスタックを使ってみることが評価力を保つ。** 私の最近の仕事の一部は、AI支援開発がどこで機能し、どこで失敗するかを見極めることです。慣れないフレームワークで作るのはまさにその筋のトレーニングで、書くべきネタにもなります。
2. **実際の要件は静的サイトに合う。** TanStack Start はすべてのルートをプレーンなHTMLに事前レンダリングします:

```ts
// vite.config.ts
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'

export default {
  plugins: [
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true },
    }),
  ],
}
```

`crawlLinks` を有効にすると、クローラーが `/` から内部リンクを辿ってページごとにファイルを書き出します。Cloudflare Pages にデプロイされるのはHTMLとCSS、小さなハイドレーション用ペイロードだけ。サーバーランタイムもデータベースもありません。

TanStack Router の型安全なファイルベースルーティングも本当に快適です。ルートはファイル、パラメータは型付き、Link コンポーネントは `to` の宛先をコンパイル時に検証してくれます。

## URLプレフィックスによるバイリンガル

サイトは `/` が英語、`/ja` が日本語です。ブログ記事は言語ごとに独立していて、機械翻訳ではなく各言語で自然に書きます。フロントマターの `translationKey` でペアをリンクし、片方の言語だけの記事も成立します。その場合、言語スイッチャーはもう一方の言語のブログ一覧にフォールバックします。

## ミニマルなのは意図

タイポグラフィが仕事をします。アクセントカラーは1色、本文は読みやすい行長の1カラム、ライト/ダークは `prefers-color-scheme` だけで処理 — 切り替え用のJavaScriptはありません。記事はビルド時にパースされるMarkdownファイルで、`marked` でレンダリングし、Tailwind の typography プラグインでスタイリングしています。

## 今後の予定

AIネイティブな開発ワークフローについての記事を増やしていく予定です。Claude Code や Codex をスペック駆動のコンテキストとどう使うか、実際に本番で機能したこと。[このような経験をお探しの方は、お気軽にどうぞ](mailto:me@hatai.dev)。
```

- [ ] **Step 3: Create `src/components/blog/BlogIndex.tsx`**

```tsx
import { Link } from '@tanstack/solid-router'
import { getPosts } from '../../lib/posts'
import { localePath, ui, type Locale } from '../../lib/i18n'

export function BlogIndex(props: { locale: Locale }) {
  const t = ui[props.locale]
  const posts = getPosts(props.locale)

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(props.locale === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(`${date}T00:00:00Z`))

  return (
    <main id="content" class="mx-auto w-full max-w-2xl px-5 pb-16 pt-10">
      <h1 class="text-3xl font-bold tracking-tight">{t.blog.title}</h1>
      <p class="mt-3 text-muted">{t.blog.description}</p>
      {posts.length === 0 ? (
        <p class="mt-10 text-muted">{t.blog.noPosts}</p>
      ) : (
        <ul class="mt-10 space-y-8">
          {posts.map((post) => (
            <li>
              <Link
                to={localePath(props.locale, `/blog/${post.slug}`)}
                class="text-lg font-semibold tracking-tight text-fg transition-colors hover:text-accent"
              >
                {post.title}
              </Link>
              <p class="mt-1 text-sm text-muted">
                <time datetime={post.date}>{formatDate(post.date)}</time>
              </p>
              {post.description && (
                <p class="mt-2 text-sm leading-relaxed text-muted">{post.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
```

- [ ] **Step 4: Create `src/components/blog/PostPage.tsx`**

```tsx
import { Link, useParams } from '@tanstack/solid-router'
import { getPost, getTranslation } from '../../lib/posts'
import { localePath, ui, type Locale } from '../../lib/i18n'

export function PostPage(props: { locale: Locale }) {
  const t = ui[props.locale]
  const params = useParams()
  const post = () => getPost(props.locale, params().slug)
  const translated = () => {
    const current = post()
    return current ? getTranslation(current) : undefined
  }
  const translatedHref = () => {
    const tr = translated()
    if (!tr) return undefined
    return tr.lang === 'ja' ? `/ja/blog/${tr.slug}` : `/blog/${tr.slug}`
  }

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(props.locale === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(`${date}T00:00:00Z`))

  const current = post()
  if (!current) {
    return (
      <main id="content" class="mx-auto w-full max-w-2xl px-5 pt-16">
        <h1 class="text-2xl font-bold tracking-tight">{t.notFound.title}</h1>
        <Link
          to={localePath(props.locale, '/blog')}
          class="mt-6 inline-block text-accent underline underline-offset-4"
        >
          {t.blog.backToBlog}
        </Link>
      </main>
    )
  }

  return (
    <main id="content" class="mx-auto w-full max-w-2xl px-5 pb-16 pt-10">
      <article>
        <header>
          <h1 class="text-3xl font-bold tracking-tight text-balance">{current.title}</h1>
          <p class="mt-3 text-sm text-muted">
            <time datetime={current.date}>{formatDate(current.date)}</time>
          </p>
          {translatedHref() && (
            <p class="mt-2 text-sm">
              <Link
                to={translatedHref()!}
                class="text-accent underline underline-offset-4"
              >
                {t.blog.readOther}
              </Link>
            </p>
          )}
        </header>
        <div class="prose mt-8 max-w-none" innerHTML={current.html} />
      </article>
      <p class="mt-12 border-t border-line pt-6 text-sm">
        <Link
          to={localePath(props.locale, '/blog')}
          class="text-accent underline underline-offset-4"
        >
          ← {t.blog.backToBlog}
        </Link>
      </p>
    </main>
  )
}
```

- [ ] **Step 5: Create the four blog routes**

`src/routes/blog/index.tsx`:

```tsx
import { createFileRoute } from '@tanstack/solid-router'
import { BlogIndex } from '../../components/blog/BlogIndex'
import { ui } from '../../lib/i18n'
import { SITE_URL } from '../../lib/site'
import { profile } from '../../lib/profile'

export const Route = createFileRoute('/blog/')({
  head: () => ({
    meta: [
      { title: `${ui.en.blog.title} — ${profile.name.en}` },
      { name: 'description', content: ui.en.blog.description },
      { property: 'og:title', content: ui.en.blog.title },
      { property: 'og:description', content: ui.en.blog.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/blog` },
      { property: 'og:locale', content: 'en_US' },
    ],
    links: [
      { rel: 'canonical', href: `${SITE_URL}/blog` },
      { rel: 'alternate', hreflang: 'en', href: `${SITE_URL}/blog` },
      { rel: 'alternate', hreflang: 'ja', href: `${SITE_URL}/ja/blog` },
      { rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}/blog` },
    ],
  }),
  component: () => <BlogIndex locale="en" />,
})
```

`src/routes/ja/blog/index.tsx`:

```tsx
import { createFileRoute } from '@tanstack/solid-router'
import { BlogIndex } from '../../components/blog/BlogIndex'
import { ui } from '../../lib/i18n'
import { SITE_URL } from '../../lib/site'
import { profile } from '../../lib/profile'

export const Route = createFileRoute('/ja/blog/')({
  head: () => ({
    meta: [
      { title: `${ui.ja.blog.title} — ${profile.name.ja}` },
      { name: 'description', content: ui.ja.blog.description },
      { property: 'og:title', content: ui.ja.blog.title },
      { property: 'og:description', content: ui.ja.blog.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/ja/blog` },
      { property: 'og:locale', content: 'ja_JP' },
    ],
    links: [
      { rel: 'canonical', href: `${SITE_URL}/ja/blog` },
      { rel: 'alternate', hreflang: 'ja', href: `${SITE_URL}/ja/blog` },
      { rel: 'alternate', hreflang: 'en', href: `${SITE_URL}/blog` },
      { rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}/blog` },
    ],
  }),
  component: () => <BlogIndex locale="ja" />,
})
```

`src/routes/blog/$slug.tsx`:

```tsx
import { createFileRoute } from '@tanstack/solid-router'
import { PostPage } from '../../components/blog/PostPage'
import { getPost, getTranslation } from '../../lib/posts'
import { SITE_URL } from '../../lib/site'
import { profile } from '../../lib/profile'

export const Route = createFileRoute('/blog/$slug')({
  head: ({ params }) => {
    const post = getPost('en', params.slug)
    if (!post) return {}
    const translated = getTranslation(post)
    return {
      meta: [
        { title: `${post.title} — ${profile.name.en}` },
        { name: 'description', content: post.description },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: post.title },
        { property: 'og:description', content: post.description },
        { property: 'og:url', content: `${SITE_URL}/blog/${post.slug}` },
        { property: 'og:locale', content: 'en_US' },
        ...(translated
          ? [{ property: 'og:locale:alternate', content: 'ja_JP' }]
          : []),
        { name: 'article:published_time', content: post.date },
      ],
      links: [
        { rel: 'canonical', href: `${SITE_URL}/blog/${post.slug}` },
        { rel: 'alternate', hreflang: 'en', href: `${SITE_URL}/blog/${post.slug}` },
        ...(translated
          ? [
              {
                rel: 'alternate',
                hreflang: 'ja',
                href: `${SITE_URL}/ja/blog/${translated.slug}`,
              },
            ]
          : []),
        { rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}/blog/${post.slug}` },
      ],
    }
  },
  component: () => <PostPage locale="en" />,
})
```

`src/routes/ja/blog/$slug.tsx`:

```tsx
import { createFileRoute } from '@tanstack/solid-router'
import { PostPage } from '../../components/blog/PostPage'
import { getPost, getTranslation } from '../../lib/posts'
import { SITE_URL } from '../../lib/site'
import { profile } from '../../lib/profile'

export const Route = createFileRoute('/ja/blog/$slug')({
  head: ({ params }) => {
    const post = getPost('ja', params.slug)
    if (!post) return {}
    const translated = getTranslation(post)
    return {
      meta: [
        { title: `${post.title} — ${profile.name.ja}` },
        { name: 'description', content: post.description },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: post.title },
        { property: 'og:description', content: post.description },
        { property: 'og:url', content: `${SITE_URL}/ja/blog/${post.slug}` },
        { property: 'og:locale', content: 'ja_JP' },
        ...(translated
          ? [{ property: 'og:locale:alternate', content: 'en_US' }]
          : []),
        { name: 'article:published_time', content: post.date },
      ],
      links: [
        { rel: 'canonical', href: `${SITE_URL}/ja/blog/${post.slug}` },
        { rel: 'alternate', hreflang: 'ja', href: `${SITE_URL}/ja/blog/${post.slug}` },
        ...(translated
          ? [
              {
                rel: 'alternate',
                hreflang: 'en',
                href: `${SITE_URL}/blog/${translated.slug}`,
              },
            ]
          : []),
        { rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}/blog/${post.slug}` },
      ],
    }
  },
  component: () => <PostPage locale="ja" />,
})
```

If `head` receives no `params` in the Solid adapter (check the types), fall back to omitting per-post head data and keep only `{}` — per-post titles then come from the post `h1`; note the deviation in the commit message.

- [ ] **Step 6: Create `src/routes/404.tsx`**

```tsx
import { createFileRoute } from '@tanstack/solid-router'
import { NotFoundView } from '../components/NotFoundView'

export const Route = createFileRoute('/404')({
  component: NotFoundView,
})
```

- [ ] **Step 7: Add the 404 output entry to `vite.config.ts`**

Inside `tanstackStart({ ... })`, after the `prerender` block, add:

```ts
      pages: [{ path: '/404', prerender: { outputPath: '/404.html' } }],
```

- [ ] **Step 8: Verify in browser**

`pnpm dev`:
- `/blog` and `/ja/blog` list the post with formatted dates.
- Post pages render prose (headings, code block, link) with correct prose colors in both schemes.
- Each post page shows the `readOther` link to its translation; both directions work.
- Lang switcher on a post goes to the translated post; on the blog index goes to the other locale's index.

- [ ] **Step 9: Build proof**

Run: `pnpm build`
Expected: prerender log includes `/blog`, `/ja/blog`, both post pages (discovered via `crawlLinks`), and `/404` written to `404.html`. If the `/404` page config errors, remove the `pages` entry + route file and record that Cloudflare Pages will serve its default 404 (acceptable fallback) — do not leave a broken build.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: bilingual blog with markdown content pipeline and 404"
```

---

### Task 9: Final Verification, README & Deploy Docs

**Files:**
- Create: `scripts/verify-build.mjs`, `scripts/set-html-lang.mjs`
- Create: `README.md`
- Modify: `package.json` (verify script, build script, deps, start script)
- Modify: `vite.config.ts` (remove interim `failOnError: false`)
- Modify: `src/components/LangSwitcher.tsx` (404 special-case)
- Modify: `src/components/blog/BlogIndex.tsx`, `src/components/blog/PostPage.tsx` (timeZone: 'UTC')
- Modify: `src/styles/app.css` (prose pre token mapping)

**Interfaces:**
- Consumes: everything built in Tasks 1–8; the output dir recorded in Task 1 (`dist/client`).
- Produces: `pnpm verify` gate used before every deploy; README with deploy steps; deterministic build output.

- [ ] **Step 0: Cross-task fixes (accumulated review queue)**

1. `src/components/LangSwitcher.tsx`: special-case `pathname() === '/404'` → target is `localePath(other(), '/')` (a 404 has no per-locale route; without this the crawler hits `/ja/404` and fails once `failOnError` is restored).
2. `src/components/blog/BlogIndex.tsx` + `src/components/blog/PostPage.tsx`: add `timeZone: 'UTC'` to both `Intl.DateTimeFormat` constructors (build-machine-independent dates).
3. `src/styles/app.css`: in the `.prose` block add `--tw-prose-pre-bg: var(--color-line);` and `--tw-prose-pre-code: var(--fg);` (code blocks follow the token system in both schemes).
4. `vite.config.ts`: remove the interim `prerender.failOnError: false` (added in Task 3).
5. `scripts/set-html-lang.mjs` (new): recursively rewrite `<html` tags in `dist/client/**/*.html` — `lang="ja"` for paths under `ja/`, `lang="en"` otherwise (router head API cannot set html attributes; static output makes a post-build rewrite correct). Wire it into `package.json` as `"build": "vite build && node scripts/set-html-lang.mjs"` (match the actual scaffold build command if it differs — keep the prerender step intact).
6. `package.json`: fix the dead `start` script (points at nonexistent `.output/server/index.mjs`) — replace with `node dist/server/server.js` or remove it; pin `@tanstack/solid-start` / `@tanstack/solid-router` from `latest` to caret ranges of the locked versions (1.168.46 / 1.170.29); remove the `@types/js-yaml` devDep (js-yaml v5 ships its own types). Run `pnpm install` to update the lockfile after edits.

Verification for Step 0: `pnpm test` (22/22), `pnpm build` (must succeed with failOnError at its default — this proves no crawl target 404s), emitted `<html lang="ja">` present in `dist/client/ja/index.html`.

- [ ] **Step 1: Write `scripts/verify-build.mjs`**

```js
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.argv[2] ?? 'dist/client')
let failed = 0

const pages = [
  ['index.html', 'Taigen Hamada'],
  ['index.html', 'hreflang="ja"'],
  ['ja/index.html', '濱田 泰源'],
  ['blog/index.html', 'Why I Built This Site with TanStack Solid Start'],
  ['ja/blog/index.html', 'このサイトを TanStack Solid Start で作った理由'],
  [
    'blog/why-i-built-this-site-with-tanstack-solid-start/index.html',
    'Why I Built This Site with TanStack Solid Start',
  ],
  [
    'ja/blog/why-i-built-this-site-with-tanstack-solid-start/index.html',
    'このサイトを TanStack Solid Start で作った理由',
  ],
]

for (const [file, needle] of pages) {
  const path = resolve(root, file)
  if (!existsSync(path)) {
    console.error(`MISSING ${path}`)
    failed += 1
    continue
  }
  const html = readFileSync(path, 'utf8')
  if (!html.includes(needle)) {
    console.error(`CONTENT MISS ${path}: expected "${needle}"`)
    failed += 1
  } else {
    console.log(`OK ${path}`)
  }
}

if (existsSync(resolve(root, '404.html'))) {
  console.log(`OK ${resolve(root, '404.html')}`)
} else {
  console.warn('WARN 404.html not present (acceptable fallback)')
}

process.exit(failed ? 1 : 0)
```

- [ ] **Step 2: Add the script**

In `package.json` `scripts`: `"verify": "node scripts/verify-build.mjs dist/client"` (recorded in Task 1: the actual build output directory is `dist/client`, not `.output/public`). Also in Task 9: remove the interim `failOnError: false` from vite.config.ts `prerender` (added in Task 3 because `/blog` and `/ja` routes did not exist yet); fix the scaffold's dead `start` script (points at nonexistent `.output/server/index.mjs`) — replace with `node dist/server/server.js` or remove; pin `@tanstack/solid-start` / `@tanstack/solid-router` from `latest` to caret ranges of the locked versions (1.168.46 / 1.170.29); and remove the now-unneeded `@types/js-yaml` devDep (js-yaml v5 ships its own types). The verify script default root: replace `'.output/public'` with `'dist/client'`.

- [ ] **Step 3: Run the full gate**

```bash
pnpm test && pnpm build && pnpm verify
```

Expected: all tests pass; build prerenders every page WITH `failOnError` back at its default (build fails loudly on prerender errors); verify prints OK for all entries and exits 0.

- [ ] **Step 4: Write `README.md`**

````markdown
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
````

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: build verification script and README with deploy docs"
```

- [ ] **Step 6: Push to GitHub (requires user repo)**

If the `gh` CLI is authenticated: `gh repo create hatai/hatai.dev --public --source=. --push`.
Otherwise print for the user: create `hatai/hatai.dev` on GitHub, then
`git remote add origin git@github.com:hatai/hatai.dev.git && git push -u origin main`.
Cloudflare Pages connection is a dashboard action — follow README "Deploy".

---

## Self-Review (completed)

- **Spec coverage:** portfolio+blog ✓ (Tasks 6–8), i18n URL prefix + switcher ✓ (2,3,7,8), SSG prerender + Cloudflare Pages ✓ (1,9), minimal/typographic + auto light-dark ✓ (3,6), initial content from resume ✓ (5,8), first blog post EN+JA ✓ (8), email `me@hatai.dev` ✓ (5,9), domain/email routing docs ✓ (9). GitHub push ✓ (Task 9 Step 6).
- **Placeholders:** none in shipped pages; Task 3/4 stubs are explicitly temporary and fully replaced by their owning tasks; every fallback path (404 pages config, head params) has a defined resolution.
- **Type consistency:** `Locale`, `Post`, `profile` field names cross-checked across Tasks 2–8; `HomePage(locale)` consumed unchanged by Task 7; `posts` API identical between stub (Task 3) and implementation (Task 4).
