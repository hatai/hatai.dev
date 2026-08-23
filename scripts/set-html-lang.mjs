// The router head API cannot set attributes on <html>, so rewrite the lang
// attribute on the static output after prerendering: paths under ja/ are
// Japanese, everything else is English.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

const root = resolve(process.argv[2] ?? 'dist/client')

function htmlFiles(dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...htmlFiles(path))
    else if (entry.name.endsWith('.html')) files.push(path)
  }
  return files
}

function withLang(html, lang) {
  return html.replace(/<html\b[^>]*>/i, (tag) => {
    const withoutLang = tag.replace(/\s+lang=(".*?"|'.*?'|[^\s>]+)/gi, '')
    return `${withoutLang.slice(0, -1)} lang="${lang}">`
  })
}

let changed = 0
for (const file of htmlFiles(root)) {
  const rel = relative(root, file)
  const lang = rel.split(sep)[0] === 'ja' ? 'ja' : 'en'
  const html = readFileSync(file, 'utf8')
  const rewritten = withLang(html, lang)
  if (rewritten !== html) {
    writeFileSync(file, rewritten)
    changed += 1
    console.log(`lang=${lang} ${relative(process.cwd(), file)}`)
  }
}
console.log(`set-html-lang: ${changed} file(s) updated`)
