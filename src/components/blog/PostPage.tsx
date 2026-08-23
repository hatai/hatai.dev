import { Link, useParams } from '@tanstack/solid-router'
import { getPost, getTranslation } from '../../lib/posts'
import { localePath, ui, type Locale } from '../../lib/i18n'

export function PostPage(props: { locale: Locale }) {
  const params = useParams({ strict: false })
  const t = ui[props.locale]
  const post = () => getPost(props.locale, params().slug)
  const translated = () => {
    const current = post()
    return current ? getTranslation(current) : undefined
  }
  const translatedHref = () => {
    const tr = translated()
    if (!tr) return undefined
    return tr.lang === 'ja' ? `/ja/blog/${tr.slug}` : `/blog/${tr.slug}`
  }

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(props.locale === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${date}T00:00:00Z`))

  const current = post()
  if (!current) {
    return (
      <main id="content" class="mx-auto w-full max-w-2xl px-5 pt-16">
        <h1 class="text-2xl font-bold tracking-tight">{t.notFound.title}</h1>
        <Link
          to={localePath(props.locale, '/blog')}
          activeOptions={{ exact: true }}
          class="mt-6 inline-block text-accent underline underline-offset-4"
        >
          {t.blog.backToBlog}
        </Link>
      </main>
    )
  }

  return (
    <main id="content" class="mx-auto w-full max-w-2xl px-5 pb-16 pt-10">
      <article>
        <header>
          <h1 class="text-3xl font-bold tracking-tight text-balance">{current.title}</h1>
          <p class="mt-3 text-sm text-muted">
            <time datetime={current.date}>{formatDate(current.date)}</time>
          </p>
          {translatedHref() && (
            <p class="mt-2 text-sm">
              <Link
                to={translatedHref()!}
                lang={translated()!.lang}
                class="text-accent underline underline-offset-4"
              >
                {t.blog.readOther}
              </Link>
            </p>
          )}
        </header>
        <div class="prose mt-8 max-w-none" innerHTML={current.html} />
      </article>
      <p class="mt-12 border-t border-line pt-6 text-sm">
        <Link
          to={localePath(props.locale, '/blog')}
          activeOptions={{ exact: true }}
          class="text-accent underline underline-offset-4"
        >
          ← {t.blog.backToBlog}
        </Link>
      </p>
    </main>
  )
}
