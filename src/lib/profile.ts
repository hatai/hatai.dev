import { load as loadYaml } from 'js-yaml'
import raw from '../content/profile.yaml?raw'
import type { Locale } from './i18n'

export type Localized<T> = Record<Locale, T>

export interface Job {
  company: Localized<string>
  role: Localized<string>
  period: Localized<string>
  location: Localized<string>
  stack: string
  highlights: Localized<string[]>
}

export interface SkillGroup {
  category: Localized<string>
  starred: boolean
  skills: string[]
}

export interface Project {
  name: string
  tagline: Localized<string>
  description: Localized<string>
  url: string
  stack: string
}

export interface Profile {
  name: Localized<string>
  title: Localized<string>
  location: Localized<string>
  email: string
  github: string
  linkedin: string
  availability: Localized<string>
  summary: Localized<string>
  highlights: Localized<string[]>
  skills: SkillGroup[]
  jobs: Job[]
  projects: Project[]
}

const LOCALES: Locale[] = ['en', 'ja']

function record(value: unknown, where: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`profile: ${where} must be a mapping`)
  }
  return value as Record<string, unknown>
}

function arrayField(value: unknown, where: string): unknown[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`profile: ${where} must be a non-empty array`)
  }
  return value
}

function requiredString(value: unknown, where: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`profile: ${where} must be a non-empty string`)
  }
  return value
}

function localizedString(value: unknown, where: string): Localized<string> {
  const source = record(value, where)
  const out = {} as Localized<string>
  for (const locale of LOCALES) {
    out[locale] = requiredString(source[locale], `${where}.${locale}`)
  }
  return out
}

function stringList(value: unknown, where: string): string[] {
  const items = arrayField(value, where)
  return items.map((item, index) => requiredString(item, `${where}[${index}]`))
}

function localizedList(value: unknown, where: string): Localized<string[]> {
  const source = record(value, where)
  const en = stringList(source.en, `${where}.en`)
  const ja = stringList(source.ja, `${where}.ja`)
  if (en.length !== ja.length) {
    throw new Error(
      `profile: ${where} en/ja bullet counts differ (${en.length} vs ${ja.length})`,
    )
  }
  return { en, ja }
}

export function parseProfile(source: string): Profile {
  let data: unknown
  try {
    data = loadYaml(source)
  } catch (err) {
    throw new Error(
      `invalid YAML in profile: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
  const root = record(data, 'profile root')

  const skills = arrayField(root.skills, 'skills').map((item, i) => {
    const group = record(item, `skills[${i}]`)
    return {
      category: localizedString(group.category, `skills[${i}].category`),
      starred: group.starred === true,
      skills: stringList(group.skills, `skills[${i}].skills`),
    } satisfies SkillGroup
  })
  if (!skills.some((group) => group.starred)) {
    throw new Error('profile: at least one skill group must be starred')
  }

  const jobs = arrayField(root.jobs, 'jobs').map((item, i) => {
    const job = record(item, `jobs[${i}]`)
    return {
      company: localizedString(job.company, `jobs[${i}].company`),
      role: localizedString(job.role, `jobs[${i}].role`),
      period: localizedString(job.period, `jobs[${i}].period`),
      location: localizedString(job.location, `jobs[${i}].location`),
      stack: requiredString(job.stack, `jobs[${i}].stack`),
      highlights: localizedList(job.highlights, `jobs[${i}].highlights`),
    } satisfies Job
  })

  const projects = arrayField(root.projects, 'projects').map((item, i) => {
    const project = record(item, `projects[${i}]`)
    return {
      name: requiredString(project.name, `projects[${i}].name`),
      tagline: localizedString(project.tagline, `projects[${i}].tagline`),
      description: localizedString(
        project.description,
        `projects[${i}].description`,
      ),
      url: requiredString(project.url, `projects[${i}].url`),
      stack: requiredString(project.stack, `projects[${i}].stack`),
    } satisfies Project
  })

  return {
    name: localizedString(root.name, 'name'),
    title: localizedString(root.title, 'title'),
    location: localizedString(root.location, 'location'),
    email: requiredString(root.email, 'email'),
    github: requiredString(root.github, 'github'),
    linkedin: requiredString(root.linkedin, 'linkedin'),
    availability: localizedString(root.availability, 'availability'),
    summary: localizedString(root.summary, 'summary'),
    highlights: localizedList(root.highlights, 'highlights'),
    skills,
    jobs,
    projects,
  }
}

export const profile = parseProfile(raw)
