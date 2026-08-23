import { createFileRoute } from '@tanstack/solid-router'
import { BlogIndex } from '../../components/blog/BlogIndex'
import { ui } from '../../lib/i18n'
import { SITE_URL } from '../../lib/site'
import { profile } from '../../lib/profile'

export const Route = createFileRoute('/blog/')({
  head: () => ({
    meta: [
      { title: `${ui.en.blog.title} — ${profile.name.en}` },
      { name: 'description', content: ui.en.blog.description },
      { property: 'og:title', content: ui.en.blog.title },
      { property: 'og:description', content: ui.en.blog.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/blog` },
      { property: 'og:locale', content: 'en_US' },
    ],
    links: [
      { rel: 'canonical', href: `${SITE_URL}/blog` },
      { rel: 'alternate', hreflang: 'en', href: `${SITE_URL}/blog` },
      { rel: 'alternate', hreflang: 'ja', href: `${SITE_URL}/ja/blog` },
      { rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}/blog` },
    ],
  }),
  component: () => <BlogIndex locale="en" />,
})
