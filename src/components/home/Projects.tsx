import { Section } from './Section'
import { ui, type Locale } from '../../lib/i18n'
import { profile } from '../../lib/profile'

export function Projects(props: { locale: Locale }) {
  const t = ui[props.locale]

  return (
    <Section id="projects" title={t.home.projectsTitle}>
      <ol class="space-y-12">
        {profile.projects.map((project) => (
          <li>
            <h3 class="text-lg font-semibold tracking-tight">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                class="transition-opacity hover:opacity-80"
              >
                {project.name}
              </a>
            </h3>
            <p class="mt-1 text-sm text-muted">{project.tagline[props.locale]}</p>
            <p class="mt-2 text-sm leading-relaxed">{project.description[props.locale]}</p>
            <p class="mt-2 font-mono text-xs leading-relaxed text-muted">{project.stack}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
