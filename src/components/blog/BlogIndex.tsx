import { Link } from '@tanstack/solid-router'
import { getPosts } from '../../lib/posts'
import { localePath, ui, type Locale } from '../../lib/i18n'

export function BlogIndex(props: { locale: Locale }) {
  const t = ui[props.locale]
  const posts = getPosts(props.locale)

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(props.locale === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${date}T00:00:00Z`))

  return (
    <main id="content" class="mx-auto w-full max-w-2xl px-5 pb-16 pt-10">
      <h1 class="text-3xl font-bold tracking-tight">{t.blog.title}</h1>
      <p class="mt-3 text-muted">{t.blog.description}</p>
      {posts.length === 0 ? (
        <p class="mt-10 text-muted">{t.blog.noPosts}</p>
      ) : (
        <ul class="mt-10 space-y-8">
          {posts.map((post) => (
            <li>
              <Link
                to={localePath(props.locale, `/blog/${post.slug}`)}
                class="text-lg font-semibold tracking-tight text-fg transition-colors hover:text-accent"
              >
                {post.title}
              </Link>
              <p class="mt-1 text-sm text-muted">
                <time datetime={post.date}>{formatDate(post.date)}</time>
              </p>
              {post.description && (
                <p class="mt-2 text-sm leading-relaxed text-muted">{post.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
