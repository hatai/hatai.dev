import { describe, expect, it } from 'vitest'
import { profile } from './profile'
import type { Locale } from './i18n'

const locales: Locale[] = ['en', 'ja']

describe('profile', () => {
  it('exposes identity and contact data', () => {
    expect(profile.name.en).toBe('Taigen Hamada')
    expect(profile.name.ja).toBe('濱田 泰玄')
    expect(profile.email).toBe('me@hatai.dev')
    expect(profile.github).toBe('https://github.com/hatai')
    expect(profile.linkedin).toBe('https://linkedin.com/in/hamadataigen')
  })

  it('lists exactly the five known jobs, most recent first', () => {
    expect(profile.jobs).toHaveLength(5)
    expect(profile.jobs[0].company.en).toContain('iCARE')
    expect(profile.jobs[4].company.en).toBe('Network21')
  })

  it('has non-empty localized fields for every job in both locales', () => {
    for (const job of profile.jobs) {
      for (const locale of locales) {
        expect(job.company[locale].length).toBeGreaterThan(0)
        expect(job.role[locale].length).toBeGreaterThan(0)
        expect(job.period[locale].length).toBeGreaterThan(0)
        expect(job.highlights[locale].length).toBeGreaterThan(0)
        for (const bullet of job.highlights[locale]) {
          expect(bullet.length).toBeGreaterThan(0)
        }
      }
      expect(job.stack.length).toBeGreaterThan(0)
    }
  })

  it('has matching bullet counts across locales and at least one starred skill group', () => {
    for (const job of profile.jobs) {
      expect(job.highlights.ja).toHaveLength(job.highlights.en.length)
    }
    expect(profile.skills.some((group) => group.starred)).toBe(true)
  })
})
