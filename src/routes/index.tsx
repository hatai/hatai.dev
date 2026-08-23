import { createFileRoute } from '@tanstack/solid-router'
import { HomePage } from '../components/home/HomePage'
import { profile } from '../lib/profile'
import { SITE_URL } from '../lib/site'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: `${profile.name.en} — ${profile.title.en}` },
      { name: 'description', content: profile.summary.en },
      { property: 'og:title', content: `${profile.name.en} — ${profile.title.en}` },
      { property: 'og:description', content: profile.summary.en },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:locale:alternate', content: 'ja_JP' },
    ],
    links: [
      { rel: 'canonical', href: SITE_URL },
      { rel: 'alternate', hreflang: 'en', href: SITE_URL },
      { rel: 'alternate', hreflang: 'ja', href: `${SITE_URL}/ja` },
      { rel: 'alternate', hreflang: 'x-default', href: SITE_URL },
    ],
  }),
  component: () => <HomePage locale="en" />,
})
