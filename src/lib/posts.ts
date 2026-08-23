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

  let data: Frontmatter
  try {
    data = (loadYaml(sourceMatch[1].trim() || '{}') ?? {}) as Frontmatter
  } catch (err) {
    throw new Error(
      `invalid YAML frontmatter in ${name}: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
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
