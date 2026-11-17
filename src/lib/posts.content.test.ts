import { describe, expect, it } from 'vitest'
import { getPost, getPosts, getTranslation, parsePostFile, posts } from './posts'

const SLUGS = [
  'deciding-production-topology-adr-0012',
  'why-i-built-this-site-with-tanstack-solid-start',
] as const

const DATES: Record<(typeof SLUGS)[number], string> = {
  'deciding-production-topology-adr-0012': '2026-11-18',
  'why-i-built-this-site-with-tanstack-solid-start': '2026-08-24',
}

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
  it('exposes the expected slugs per language, newest first', () => {
    for (const lang of ['en', 'ja'] as const) {
      const langPosts = getPosts(lang)
      expect(langPosts).toHaveLength(2)
      expect(langPosts.map((post) => post.slug)).toEqual([...SLUGS])
      for (const post of langPosts) {
        expect(post.lang).toBe(lang)
      }
    }
  })

  it('links each pair as translations in both directions', () => {
    for (const slug of SLUGS) {
      const en = getPost('en', slug)!
      const ja = getPost('ja', slug)!
      expect(getTranslation(en)).toBe(ja)
      expect(getTranslation(ja)).toBe(en)
      expect(en.translationKey).toBe(ja.translationKey)
    }
  })

  it('carries the published dates', () => {
    for (const slug of SLUGS) {
      expect(getPost('en', slug)!.date).toBe(DATES[slug])
      expect(getPost('ja', slug)!.date).toBe(DATES[slug])
    }
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
