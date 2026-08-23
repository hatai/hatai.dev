import { createFileRoute } from '@tanstack/solid-router'
import { HomePage } from '../../components/home/HomePage'
import { profile } from '../../lib/profile'
import { SITE_URL } from '../../lib/site'

export const Route = createFileRoute('/ja/')({
  head: () => ({
    meta: [
      { title: `${profile.name.ja} — ${profile.title.ja}` },
      { name: 'description', content: profile.summary.ja },
      { property: 'og:title', content: `${profile.name.ja} — ${profile.title.ja}` },
      { property: 'og:description', content: profile.summary.ja },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/ja` },
      { property: 'og:locale', content: 'ja_JP' },
      { property: 'og:locale:alternate', content: 'en_US' },
    ],
    links: [
      { rel: 'canonical', href: `${SITE_URL}/ja` },
      { rel: 'alternate', hreflang: 'ja', href: `${SITE_URL}/ja` },
      { rel: 'alternate', hreflang: 'en', href: SITE_URL },
      { rel: 'alternate', hreflang: 'x-default', href: SITE_URL },
    ],
  }),
  component: () => <HomePage locale="ja" />,
})
