import { Link, useLocation } from '@tanstack/solid-router'
import { localeFromPath, localePath, ui } from '../lib/i18n'

export function NotFoundView() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const locale = () => localeFromPath(pathname())
  const t = () => ui[locale()]

  return (
    <main id="content" class="mx-auto w-full max-w-2xl px-5 py-24">
      <h1 class="text-3xl font-bold tracking-tight">{t().notFound.title}</h1>
      <p class="mt-3 text-muted">{t().notFound.lead}</p>
      <Link
        to={localePath(locale(), '/')}
        class="mt-8 inline-block text-accent underline underline-offset-4"
      >
        {t().notFound.backHome}
      </Link>
    </main>
  )
}
