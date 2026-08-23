import { Section } from './Section'
import { ui, type Locale } from '../../lib/i18n'
import { profile } from '../../lib/profile'

export function Experience(props: { locale: Locale }) {
  const t = ui[props.locale]

  return (
    <Section id="experience" title={t.home.experienceTitle}>
      <ol class="space-y-12">
        {profile.jobs.map((job) => (
          <li>
            <h3 class="text-lg font-semibold tracking-tight">{job.company[props.locale]}</h3>
            <p class="mt-1 text-sm text-muted">
              {job.role[props.locale]} · {job.period[props.locale]} · {job.location[props.locale]}
            </p>
            <p class="mt-2 font-mono text-xs leading-relaxed text-muted">{job.stack}</p>
            <ul class="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed marker:text-muted">
              {job.highlights[props.locale].map((bullet) => (
                <li>{bullet}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  )
}
