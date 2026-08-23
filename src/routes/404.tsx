import { createFileRoute } from '@tanstack/solid-router'
import { NotFoundView } from '../components/NotFoundView'

export const Route = createFileRoute('/404')({
  component: NotFoundView,
})
