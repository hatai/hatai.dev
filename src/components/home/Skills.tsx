import { Section } from './Section'
import { ui, type Locale } from '../../lib/i18n'
import { profile } from '../../lib/profile'

export function Skills(props: { locale: Locale }) {
  const t = ui[props.locale]

  return (
    <Section id="skills" title={t.home.skillsTitle}>
      <dl class="space-y-5">
        {profile.skills.map((group) => (
          <div class="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt class="text-sm font-medium">
              {group.category[props.locale]}
              {group.starred ? ' ★' : ''}
            </dt>
            <dd class="text-sm leading-relaxed text-muted">{group.skills.join(' · ')}</dd>
          </div>
        ))}
      </dl>
      <p class="mt-5 text-xs text-muted">{t.home.skillsNote}</p>
    </Section>
  )
}
