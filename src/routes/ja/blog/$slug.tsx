import { createFileRoute } from '@tanstack/solid-router'
import { PostPage } from '../../../components/blog/PostPage'
import { getPost, getTranslation } from '../../../lib/posts'
import { SITE_URL } from '../../../lib/site'
import { profile } from '../../../lib/profile'

export const Route = createFileRoute('/ja/blog/$slug')({
  head: ({ params }) => {
    const post = getPost('ja', params.slug)
    if (!post) return {}
    const translated = getTranslation(post)
    return {
      meta: [
        { title: `${post.title} — ${profile.name.ja}` },
        { name: 'description', content: post.description },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: post.title },
        { property: 'og:description', content: post.description },
        { property: 'og:url', content: `${SITE_URL}/ja/blog/${post.slug}` },
        { property: 'og:locale', content: 'ja_JP' },
        ...(translated
          ? [{ property: 'og:locale:alternate', content: 'en_US' }]
          : []),
        { name: 'article:published_time', content: post.date },
      ],
      links: [
        { rel: 'canonical', href: `${SITE_URL}/ja/blog/${post.slug}` },
        { rel: 'alternate', hreflang: 'ja', href: `${SITE_URL}/ja/blog/${post.slug}` },
        ...(translated
          ? [
              {
                rel: 'alternate',
                hreflang: 'en',
                href: `${SITE_URL}/blog/${translated.slug}`,
              },
            ]
          : []),
        { rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}/blog/${post.slug}` },
      ],
    }
  },
  component: () => <PostPage locale="ja" />,
})
