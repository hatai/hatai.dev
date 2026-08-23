import { describe, expect, it } from 'vitest'
import { getPost, getPosts, getTranslation, parsePostFile, posts } from './posts'

const SLUG = 'why-i-built-this-site-with-tanstack-solid-start'

describe('blog content', () => {
  it('names the file when YAML frontmatter fails to parse', () => {
    expect(() =>
      parsePostFile(
        'bad.en.md',
        '---\ntitle: [unclosed\ndate: 2026-08-24\n---\nbody',
      ),
    ).toThrow(/invalid YAML frontmatter in bad\.en\.md/)
  })

  it('parses both shipped posts without errors', () => {
    expect(posts).toHaveLength(2)
  })
  it('exposes exactly one post per language with the expected slug', () => {
    const en = getPosts('en')
    const ja = getPosts('ja')
    expect(en).toHaveLength(1)
    expect(ja).toHaveLength(1)
    expect(en[0].slug).toBe(SLUG)
    expect(ja[0].slug).toBe(SLUG)
    expect(en[0].lang).toBe('en')
    expect(ja[0].lang).toBe('ja')
  })

  it('links the pair as translations in both directions', () => {
    const en = getPost('en', SLUG)!
    const ja = getPost('ja', SLUG)!
    expect(getTranslation(en)).toBe(ja)
    expect(getTranslation(ja)).toBe(en)
    expect(en.translationKey).toBe(ja.translationKey)
  })

  it('carries the published date', () => {
    expect(getPost('en', SLUG)!.date).toBe('2026-08-24')
    expect(getPost('ja', SLUG)!.date).toBe('2026-08-24')
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
