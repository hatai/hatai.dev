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
