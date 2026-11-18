import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.argv[2] ?? 'dist/client')
let failed = 0

const pages = [
  ['index.html', 'HAMADA Taigen'],
  ['index.html', 'hreflang="ja"'],
  // set-html-lang appends lang as the final <html> attribute (after data-hk),
  // so ' lang="..">' anchors on the html tag and cannot match hreflang links.
  ['index.html', ' lang="en">'],
  ['ja/index.html', ' lang="ja">'],
  ['ja/index.html', '濱田 泰源'],
  ['blog/index.html', 'Why I Built This Site with TanStack Solid Start'],
  ['blog/index.html', 'Building a Development Flow Run by an AI Agent Team'],
  ['ja/blog/index.html', 'このサイトを TanStack Solid Start で作った理由'],
  ['ja/blog/index.html', 'AIエージェントチームで回す開発フローを組んだ話'],
  [
    'blog/building-an-agent-team-development-flow/index.html',
    'Building a Development Flow Run by an AI Agent Team',
  ],
  [
    'blog/building-an-agent-team-development-flow/index.html',
    '/img/agent-team-flow.en.svg',
  ],
  [
    'blog/building-an-agent-team-development-flow/index.html',
    '/img/bottleneck-moves.en.svg',
  ],
  [
    'blog/building-an-agent-team-development-flow/index.html',
    '/img/conductor-failover.en.svg',
  ],
  [
    'ja/blog/building-an-agent-team-development-flow/index.html',
    'AIエージェントチームで回す開発フローを組んだ話',
  ],
  [
    'ja/blog/building-an-agent-team-development-flow/index.html',
    '/img/agent-team-flow.ja.svg',
  ],
  [
    'ja/blog/building-an-agent-team-development-flow/index.html',
    '/img/bottleneck-moves.ja.svg',
  ],
  [
    'ja/blog/building-an-agent-team-development-flow/index.html',
    '/img/conductor-failover.ja.svg',
  ],
  ['img/agent-team-flow.en.svg', '<svg'],
  ['img/agent-team-flow.ja.svg', '<svg'],
  ['img/bottleneck-moves.en.svg', '<svg'],
  ['img/bottleneck-moves.ja.svg', '<svg'],
  ['img/conductor-failover.en.svg', '<svg'],
  ['img/conductor-failover.ja.svg', '<svg'],
  [
    'blog/why-i-built-this-site-with-tanstack-solid-start/index.html',
    'Why I Built This Site with TanStack Solid Start',
  ],
  [
    'ja/blog/why-i-built-this-site-with-tanstack-solid-start/index.html',
    'このサイトを TanStack Solid Start で作った理由',
  ],
  ['index.html', 'gitz'],
  ['ja/index.html', 'gitz'],
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
