import { Section } from './Section'
import { ui, type Locale } from '../../lib/i18n'
import { profile } from '../../lib/profile'

export function Contact(props: { locale: Locale }) {
  const t = ui[props.locale]

  return (
    <Section id="contact" title={t.home.contactTitle}>
      <p class="leading-relaxed">{t.home.contactLead}</p>
      <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <a href={`mailto:${profile.email}`} class="text-accent underline underline-offset-4">
          {profile.email}
        </a>
        <a
          href={profile.github}
          target="_blank"
          rel="noopener noreferrer"
          class="text-accent underline underline-offset-4"
        >
          GitHub
        </a>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          class="text-accent underline underline-offset-4"
        >
          LinkedIn
        </a>
      </div>
    </Section>
  )
}
