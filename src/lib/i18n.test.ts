import { describe, expect, it } from 'vitest'
import {
  alternateLocalePath,
  localeFromPath,
  localePath,
  ui,
  type Locale,
} from './i18n'

describe('localePath', () => {
  it('keeps English paths unprefixed', () => {
    expect(localePath('en', '/')).toBe('/')
    expect(localePath('en', '/blog')).toBe('/blog')
  })
  it('prefixes Japanese paths with /ja', () => {
    expect(localePath('ja', '/')).toBe('/ja')
    expect(localePath('ja', '/blog/my-post')).toBe('/ja/blog/my-post')
  })
})

describe('alternateLocalePath', () => {
  it('adds /ja to an English path', () => {
    expect(alternateLocalePath('en', '/')).toBe('/ja')
    expect(alternateLocalePath('en', '/blog/x')).toBe('/ja/blog/x')
  })
  it('strips /ja from a Japanese path', () => {
    expect(alternateLocalePath('ja', '/ja')).toBe('/')
    expect(alternateLocalePath('ja', '/ja/blog/x')).toBe('/blog/x')
  })
  it('does not treat /ja-prefixed other segments as the locale prefix', () => {
    expect(alternateLocalePath('ja', '/jack')).toBe('/jack')
  })
})

describe('localeFromPath', () => {
  it('detects the locale from a pathname', () => {
    expect(localeFromPath('/')).toBe<Locale>('en')
    expect(localeFromPath('/blog/x')).toBe<Locale>('en')
    expect(localeFromPath('/jack')).toBe<Locale>('en')
    expect(localeFromPath('/ja')).toBe<Locale>('ja')
    expect(localeFromPath('/ja/blog/x')).toBe<Locale>('ja')
  })
})

describe('ui dictionary', () => {
  it('has matching key structure in both locales', () => {
    const shape = (value: unknown): string[] => {
      if (Array.isArray(value)) return ['[]']
      if (typeof value === 'object' && value !== null) {
        return Object.entries(value).flatMap(([key, nested]) =>
          shape(nested).map((suffix) => (suffix === '[]' ? `${key}[]` : `${key}.${suffix}`)),
        )
      }
      return ['']
    }
    expect(shape(ui.ja)).toEqual(shape(ui.en))
  })
})
