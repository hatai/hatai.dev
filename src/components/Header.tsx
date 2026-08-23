import { Link, useLocation } from '@tanstack/solid-router'
import { LangSwitcher } from './LangSwitcher'
import { localeFromPath, localePath, ui } from '../lib/i18n'

export function Header() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const locale = () => localeFromPath(pathname())
  const t = () => ui[locale()]

  const navClass = (target: string) =>
    `text-sm transition-colors hover:text-accent ${
      pathname() === target ? 'text-fg' : 'text-muted'
    }`

  return (
    <header class="mx-auto flex w-full max-w-2xl items-baseline justify-between px-5 pt-10 pb-6">
      <Link to={localePath(locale(), '/')} class="font-semibold tracking-tight">
        {t().siteName}
      </Link>
      <nav class="flex items-center gap-4" aria-label="site">
        <Link to={localePath(locale(), '/')} class={navClass(localePath(locale(), '/'))}>
          {t().nav.home}
        </Link>
        <Link to={localePath(locale(), '/blog')} class={navClass(localePath(locale(), '/blog'))}>
          {t().nav.blog}
        </Link>
        <LangSwitcher />
      </nav>
    </header>
  )
}
