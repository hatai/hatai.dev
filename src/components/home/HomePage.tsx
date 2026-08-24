import type { Locale } from '../../lib/i18n'
import { Hero } from './Hero'
import { Highlights } from './Highlights'
import { Skills } from './Skills'
import { Experience } from './Experience'
import { Projects } from './Projects'
import { Contact } from './Contact'

export function HomePage(props: { locale: Locale }) {
  return (
    <main id="content" class="mx-auto w-full max-w-2xl px-5 pb-16">
      <Hero locale={props.locale} />
      <Highlights locale={props.locale} />
      <Skills locale={props.locale} />
      <Experience locale={props.locale} />
      <Projects locale={props.locale} />
      <Contact locale={props.locale} />
    </main>
  )
}
