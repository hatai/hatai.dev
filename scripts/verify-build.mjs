import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.argv[2] ?? 'dist/client')
let failed = 0

const pages = [
  ['index.html', 'Taigen Hamada'],
  ['index.html', 'hreflang="ja"'],
  // set-html-lang appends lang as the final <html> attribute (after data-hk),
  // so ' lang="..">' anchors on the html tag and cannot match hreflang links.
  ['index.html', ' lang="en">'],
  ['ja/index.html', ' lang="ja">'],
  ['ja/index.html', '濱田 泰玄'],
  ['blog/index.html', 'Why I Built This Site with TanStack Solid Start'],
  ['ja/blog/index.html', 'このサイトを TanStack Solid Start で作った理由'],
  [
    'blog/why-i-built-this-site-with-tanstack-solid-start/index.html',
    'Why I Built This Site with TanStack Solid Start',
  ],
  [
    'ja/blog/why-i-built-this-site-with-tanstack-solid-start/index.html',
    'このサイトを TanStack Solid Start で作った理由',
  ],
  ['404.html', 'Page not found'],
]

for (const [file, needle] of pages) {
  const path = resolve(root, file)
  if (!existsSync(path)) {
    console.error(`MISSING ${path}`)
    failed += 1
    continue
  }
  const html = readFileSync(path, 'utf8')
  if (!html.includes(needle)) {
    console.error(`CONTENT MISS ${path}: expected "${needle}"`)
    failed += 1
  } else {
    console.log(`OK ${path}`)
  }
}

if (existsSync(resolve(root, '404.html'))) {
  console.log(`OK ${resolve(root, '404.html')}`)
} else {
  console.warn('WARN 404.html not present (acceptable fallback)')
}

process.exit(failed ? 1 : 0)
