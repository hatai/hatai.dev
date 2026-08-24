---
title: Why I Built This Site with TanStack Solid Start
description: The stack, design, and deployment choices behind hatai.dev — a static, bilingual portfolio built with TanStack Solid Start.
date: 2026-08-24
---

I am a full-stack engineer with 10 years of experience, currently looking for remote contract projects with overseas teams. This site serves as both my portfolio and my blog. In this post, I am writing about why I chose Solid.js and TanStack Start for this site's architecture.

## Why a Personal Website?

Job platforms are optimized for matching algorithms and do not feel suitable for expressing in detail what I have built and done so far.
In contrast, a personal website can be included in a resume, is completely under your own control, and provides a place to express yourself. There are no character limits, and you can talk about your work history in your own words in both English and Japanese.

## Why TanStack Solid Start?

Since I use React and Vue on a daily basis, I intentionally chose a stack that I do not use for work.

There are two reasons:

1. **Using a new stack maintains my evaluation skills.** One of my recent tasks involves determining where AI-assisted development works and where it fails. Building something with a framework I have never used before serves as great training for this and makes for good content.
2. **TanStack Start is well-suited for static sites.** TanStack Start pre-renders all routes into plain HTML:

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

By enabling `crawlLinks`, the crawler follows internal links from `/` and writes out a file for each page. What gets deployed to Cloudflare Pages is just HTML, CSS, and a small payload for hydration. There is no server runtime and no database.

TanStack Router's type-safe file-based routing is also genuinely comfortable. Routes are files, parameters are typed, and the Link component validates the `to` destination at compile time.

## Bilingual Support via URL Prefixes

The site uses `/` for English and `/ja` for Japanese. Blog posts are independent for each language. Since my native language is Japanese, I utilize [Nani!? Translation](https://nani.now/) to translate from Japanese to English. Pairs are linked using the `translationKey` in the front matter, and articles written in only one language are also supported. In such cases, the language switcher falls back to the blog list of the other language.
Nani!? is an exceptional AI-powered translation tool that I love using. I am also a fan of its creator, [catnose](https://x.com/catnose99).

## Minimalist Design

There is only one accent color, a single-column layout with a line length that is easy to read, and light/dark modes are handled solely via `prefers-color-scheme` with no JavaScript for toggling. Articles are Markdown files parsed at build time, rendered with `marked`, and styled using Tailwind's typography plugin.

## What's Next

I plan to write more articles about AI-native development workflows. How to use Claude Code and Codex with spec-driven context, and what actually worked in production. [If you are looking for someone with this kind of experience, please feel free to reach out](mailto:me@hatai.dev).
