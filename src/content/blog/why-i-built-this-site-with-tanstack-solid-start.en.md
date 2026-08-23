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
