export type Locale = 'en' | 'ja'

const en = {
  siteName: 'Taigen Hamada',
  siteTagline: 'Full-Stack Software Engineer · AI-Native',
  nav: { home: 'Home', blog: 'Blog' },
  langLabel: '日本語',
  skipToContent: 'Skip to content',
  home: {
    availability: 'Available 20–30 hrs/week as an independent contractor · Remote · Japan (JST)',
    summary:
      'Full-stack software engineer with 10 years of experience building production web services end-to-end — POS systems, real-time video streaming, reservation platforms, and healthcare SaaS. Tech lead (PL/PM) and hands-on engineer on teams of 3–6.',
    ctaGitHub: 'GitHub',
    ctaLinkedIn: 'LinkedIn',
    ctaEmail: 'Email',
    highlightsTitle: 'AI-Native Development',
    skillsTitle: 'Skills',
    skillsNote: '★ = daily production use',
    experienceTitle: 'Experience',
    contactTitle: 'Contact',
    contactLead: 'Open to contract work, AI evaluation projects, or a quick tech chat:',
    viewBlog: 'Read the blog',
  },
  blog: {
    title: 'Blog',
    description: 'Notes on full-stack development, AI-native workflows, and how this site was built.',
    backToBlog: 'All posts',
    noPosts: 'No posts yet.',
    readOther: '日本語で読む',
  },
  notFound: {
    title: 'Page not found',
    lead: 'The page you are looking for does not exist.',
    backHome: 'Back to home',
  },
  footer: {
    builtWith: 'Built with TanStack Solid Start',
  },
}

const ja: typeof en = {
  siteName: '濱田 泰玄',
  siteTagline: 'フルスタックエンジニア · AIネイティブ',
  nav: { home: 'ホーム', blog: 'ブログ' },
  langLabel: 'English',
  skipToContent: 'コンテンツへスキップ',
  home: {
    availability: '独立契約(業務委託)で週20〜30時間対応可能 · リモート · 日本(JST)',
    summary:
      'POSシステム、リアルタイム動画配信、予約プラットフォーム、ヘルスケアSaaSなど、プロダクションのWebサービスをEnd-to-Endで構築してきたフルスタックエンジニア(経験10年)。3〜6名チームでテックリード(PL/PM)と実装を兼任。',
    ctaGitHub: 'GitHub',
    ctaLinkedIn: 'LinkedIn',
    ctaEmail: 'メール',
    highlightsTitle: 'AIネイティブ開発',
    skillsTitle: 'スキル',
    skillsNote: '★ = 業務で毎日利用',
    experienceTitle: '職歴',
    contactTitle: 'お問い合わせ',
    contactLead: '契約案件・AI評価プロジェクト・技術雑談など、お気軽にどうぞ:',
    viewBlog: 'ブログを読む',
  },
  blog: {
    title: 'ブログ',
    description: 'フルスタック開発、AIネイティブなワークフロー、このサイトの作り方についてのメモ。',
    backToBlog: '記事一覧',
    noPosts: 'まだ記事はありません。',
    readOther: 'Read in English',
  },
  notFound: {
    title: 'ページが見つかりません',
    lead: 'お探しのページは存在しません。',
    backHome: 'ホームに戻る',
  },
  footer: {
    builtWith: 'TanStack Solid Start で構築',
  },
}

export type Ui = typeof en
export const ui: Record<Locale, Ui> = { en, ja }

export function localePath(locale: Locale, path: string): string {
  if (locale === 'en') return path
  return path === '/' ? '/ja' : `/ja${path}`
}

export function alternateLocalePath(locale: Locale, pathname: string): string {
  if (locale === 'ja') return pathname.replace(/^\/ja(?=\/|$)/, '') || '/'
  return pathname === '/' ? '/ja' : `/ja${pathname}`
}

export function localeFromPath(pathname: string): Locale {
  return pathname === '/ja' || pathname.startsWith('/ja/') ? 'ja' : 'en'
}
