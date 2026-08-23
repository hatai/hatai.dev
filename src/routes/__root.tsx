import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/solid-router'

import { HydrationScript } from 'solid-js/web'
import { Suspense } from 'solid-js'

import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { NotFoundView } from '../components/NotFoundView'
import appCss from '../styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFoundView,
})

function RootDocument() {
  return (
    <html>
      <head>
        <HydrationScript />
        <HeadContent />
      </head>
      <body>
        <Suspense>
          <RootLayout />
        </Suspense>
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
    <>
      <a
        href="#content"
        class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-bg focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div class="flex min-h-dvh flex-col">
        <Header />
        <div class="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    </>
  )
}
