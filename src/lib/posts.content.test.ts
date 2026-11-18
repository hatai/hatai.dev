import { describe, expect, it } from 'vitest'
import { getPost, getPosts, getTranslation, parsePostFile, posts } from './posts'

const FIRST_SLUG = 'why-i-built-this-site-with-tanstack-solid-start'
const SECOND_SLUG = 'dev-environment-muse-t3-mcp'

describe('blog content', () => {
  it('names the file when YAML frontmatter fails to parse', () => {
    expect(() =>
      parsePostFile(
        'bad.en.md',
        '---\ntitle: [unclosed\ndate: 2026-08-24\n---\nbody',
      ),
    ).toThrow(/invalid YAML frontmatter in bad\.en\.md/)
  })

  it('parses all shipped posts without errors', () => {
    expect(posts).toHaveLength(4)
  })
  it('exposes both posts per language, newest first', () => {
    const en = getPosts('en')
    const ja = getPosts('ja')
    expect(en).toHaveLength(2)
    expect(ja).toHaveLength(2)
    expect(en.map((p) => p.slug)).toEqual([SECOND_SLUG, FIRST_SLUG])
    expect(ja.map((p) => p.slug)).toEqual([SECOND_SLUG, FIRST_SLUG])
    for (const post of en) expect(post.lang).toBe('en')
    for (const post of ja) expect(post.lang).toBe('ja')
  })

  it('links each pair as translations in both directions', () => {
    for (const slug of [FIRST_SLUG, SECOND_SLUG]) {
      const en = getPost('en', slug)!
      const ja = getPost('ja', slug)!
      expect(getTranslation(en)).toBe(ja)
      expect(getTranslation(ja)).toBe(en)
      expect(en.translationKey).toBe(ja.translationKey)
    }
  })

  it('carries the published dates', () => {
    expect(getPost('en', FIRST_SLUG)!.date).toBe('2026-08-24')
    expect(getPost('ja', FIRST_SLUG)!.date).toBe('2026-08-24')
    expect(getPost('en', SECOND_SLUG)!.date).toBe('2026-11-18')
    expect(getPost('ja', SECOND_SLUG)!.date).toBe('2026-11-18')
  })

  it('renders markdown with headings and code blocks', () => {
    for (const post of posts) {
      expect(post.html).toContain('<h2')
      expect(post.html).toContain('<code')
      expect(post.html).toContain('<pre>')
      expect(post.html).toContain('<a href="mailto:me@hatai.dev">')
    }
  })
})
