import { createMemo } from 'solid-js'
import { Link, useLocation } from '@tanstack/solid-router'
import { getPost, getTranslation } from '../lib/posts'
import { alternateLocalePath, localeFromPath, localePath, ui } from '../lib/i18n'

export function LangSwitcher() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const locale = () => localeFromPath(pathname())
  const other = () => (locale() === 'ja' ? 'en' : 'ja')

  const target = createMemo(() => {
    const current = pathname()
    if (current === '/404') {
      // The 404 page has no per-locale route; switch to the other locale's home.
      return localePath(other(), '/')
    }
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
  })

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
