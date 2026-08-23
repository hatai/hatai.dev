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
