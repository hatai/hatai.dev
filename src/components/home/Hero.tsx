import { Link } from '@tanstack/solid-router'
import { localePath, ui, type Locale } from '../../lib/i18n'
import { profile } from '../../lib/profile'

export function Hero(props: { locale: Locale }) {
  const t = ui[props.locale]
  const p = profile

  return (
    <div class="pt-8 pb-4">
      <h1 class="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
        {p.name[props.locale]}
      </h1>
      <p class="mt-3 text-lg text-muted">{p.title[props.locale]}</p>
      <p class="mt-6 max-w-prose text-lg leading-relaxed">{p.summary[props.locale]}</p>
      <p class="mt-5 flex items-center gap-2.5 text-sm text-muted">
        <span class="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
        <span>{p.availability[props.locale]}</span>
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a
          href={`mailto:${p.email}`}
          class="rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-85"
        >
          {t.home.ctaEmail}
        </a>
        <a
          href={p.github}
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-md border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
        >
          {t.home.ctaGitHub}
        </a>
        <a
          href={p.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-md border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
        >
          {t.home.ctaLinkedIn}
        </a>
      </div>
      <p class="mt-8 text-sm">
        <Link
          to={localePath(props.locale, '/blog')}
          class="text-accent underline underline-offset-4 transition-opacity hover:opacity-80"
        >
          {t.home.viewBlog} →
        </Link>
      </p>
    </div>
  )
}
