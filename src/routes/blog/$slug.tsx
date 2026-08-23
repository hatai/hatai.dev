import { createFileRoute } from '@tanstack/solid-router'
import { PostPage } from '../../components/blog/PostPage'
import { getPost, getTranslation } from '../../lib/posts'
import { SITE_URL } from '../../lib/site'
import { profile } from '../../lib/profile'

export const Route = createFileRoute('/blog/$slug')({
  head: ({ params }) => {
    const post = getPost('en', params.slug)
    if (!post) return {}
    const translated = getTranslation(post)
    return {
      meta: [
        { title: `${post.title} — ${profile.name.en}` },
        { name: 'description', content: post.description },
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: post.title },
        { property: 'og:description', content: post.description },
        { property: 'og:url', content: `${SITE_URL}/blog/${post.slug}` },
        { property: 'og:locale', content: 'en_US' },
        ...(translated
          ? [{ property: 'og:locale:alternate', content: 'ja_JP' }]
          : []),
        { name: 'article:published_time', content: post.date },
      ],
      links: [
        { rel: 'canonical', href: `${SITE_URL}/blog/${post.slug}` },
        { rel: 'alternate', hreflang: 'en', href: `${SITE_URL}/blog/${post.slug}` },
        ...(translated
          ? [
              {
                rel: 'alternate',
                hreflang: 'ja',
                href: `${SITE_URL}/ja/blog/${translated.slug}`,
              },
            ]
          : []),
        { rel: 'alternate', hreflang: 'x-default', href: `${SITE_URL}/blog/${post.slug}` },
      ],
    }
  },
  component: () => <PostPage locale="en" />,
})
