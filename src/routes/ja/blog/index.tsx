import { createFileRoute } from '@tanstack/solid-router'
import { BlogIndex } from '../../../components/blog/BlogIndex'
import { ui } from '../../../lib/i18n'
import { SITE_URL } from '../../../lib/site'
import { profile } from '../../../lib/profile'

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
