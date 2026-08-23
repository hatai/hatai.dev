import { useLocation } from '@tanstack/solid-router'
import { localeFromPath, ui } from '../lib/i18n'
import { profile } from '../lib/profile'

export function Footer() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const locale = () => localeFromPath(pathname())
  const t = () => ui[locale()]

  return (
    <footer class="mx-auto w-full max-w-2xl px-5 pt-10 pb-12">
      <div class="flex flex-col gap-1 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:justify-between">
        <p>© 2026 {profile.name[locale()]}</p>
        <p>{t().footer.builtWith}</p>
      </div>
    </footer>
  )
}
