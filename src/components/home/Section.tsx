import type { JSX } from 'solid-js'

export function Section(props: { id: string; title: string; children: JSX.Element }) {
  return (
    <section class="mt-16" aria-labelledby={props.id}>
      <div class="flex items-center gap-4">
        <h2 id={props.id} class="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          {props.title}
        </h2>
        <span class="h-px flex-1 bg-line" aria-hidden="true" />
      </div>
      <div class="mt-7">{props.children}</div>
    </section>
  )
}
