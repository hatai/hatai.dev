import { describe, expect, it } from 'vitest'
import { parseProfile, profile } from './profile'
import type { Locale } from './i18n'

const locales: Locale[] = ['en', 'ja']

describe('profile', () => {
  it('exposes identity and contact data', () => {
    expect(profile.name.en).toBe('HAMADA Taigen')
    expect(profile.name.ja).toBe('濱田 泰源')
    expect(profile.email).toBe('me@hatai.dev')
    expect(profile.github).toBe('https://github.com/hatai')
    expect(profile.linkedin).toBe('https://linkedin.com/in/hamadataigen')
  })

  it('lists exactly the five known jobs, most recent first', () => {
    expect(profile.jobs).toHaveLength(5)
    expect(profile.jobs[0].company.en).toContain('iCARE')
    expect(profile.jobs[4].company.en).toBe('Network21 / Digital Hearts')
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

  it('lists personal projects with both locales populated', () => {
    expect(profile.projects).toHaveLength(6)
    expect(profile.projects.map((project) => project.name)).toContain('gitz')
    for (const project of profile.projects) {
      expect(project.url).toMatch(/^https:\/\/github\.com\/hatai\//)
      expect(project.stack.length).toBeGreaterThan(0)
      for (const locale of locales) {
        expect(project.tagline[locale].length).toBeGreaterThan(0)
        expect(project.description[locale].length).toBeGreaterThan(0)
      }
    }
  })
})

const minimalProfileYaml = `
name: {en: Test, ja: テスト}
title: {en: Title, ja: タイトル}
location: {en: Tokyo, ja: 東京}
email: me@example.com
github: https://github.com/example
linkedin: https://linkedin.com/in/example
availability: {en: Available, ja: 応談}
summary: {en: Summary, ja: サマリー}
highlights:
  en: [one]
  ja: [一]
skills:
  - category: {en: Core, ja: コア}
    starred: true
    skills: [something]
jobs:
  - company: {en: Acme, ja: アクメ}
    role: {en: Engineer, ja: エンジニア}
    period: {en: '2020', ja: 2020年}
    location: {en: Tokyo, ja: 東京}
    stack: stack
    highlights:
      en: [did]
      ja: [やった]
projects:
  - name: demo
    tagline: {en: Tagline, ja: タグライン}
    description: {en: Description, ja: 説明}
    url: https://github.com/example/demo
    stack: stack
`

describe('parseProfile', () => {
  it('parses a structurally complete profile', () => {
    const parsed = parseProfile(minimalProfileYaml)
    expect(parsed.name.ja).toBe('テスト')
    expect(parsed.jobs).toHaveLength(1)
  })

  it('throws on invalid YAML', () => {
    expect(() => parseProfile('name: [unclosed')).toThrow(/invalid YAML/)
  })

  it('throws with field context when a locale is missing', () => {
    const broken = minimalProfileYaml.replace(
      'name: {en: Test, ja: テスト}',
      'name:\n  en: Test',
    )
    expect(() => parseProfile(broken)).toThrow(/name\.ja/)
  })

  it('throws when en/ja bullet counts differ', () => {
    const broken = minimalProfileYaml.replace('en: [did]', 'en: [did, more]')
    expect(() => parseProfile(broken)).toThrow(/counts differ/)
  })

  it('throws when no skill group is starred', () => {
    const broken = minimalProfileYaml.replace('starred: true', 'starred: false')
    expect(() => parseProfile(broken)).toThrow(/starred/)
  })
})
