import { Section } from './Section'
import { ui, type Locale } from '../../lib/i18n'
import { profile } from '../../lib/profile'

export function Highlights(props: { locale: Locale }) {
  const t = ui[props.locale]

  return (
    <Section id="highlights" title={t.home.highlightsTitle}>
      <ul class="space-y-4">
        {profile.highlights[props.locale].map((item) => (
          <li class="border-l-2 border-accent pl-4 leading-relaxed">{item}</li>
        ))}
      </ul>
    </Section>
  )
}
