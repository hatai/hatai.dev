import type { Locale } from "./i18n";

export type Localized<T> = Record<Locale, T>;

export interface Job {
  company: Localized<string>;
  role: Localized<string>;
  period: Localized<string>;
  location: Localized<string>;
  stack: string;
  highlights: Localized<string[]>;
}

export interface SkillGroup {
  category: Localized<string>;
  starred: boolean;
  skills: string[];
}

export interface Project {
  name: string
  tagline: Localized<string>
  description: Localized<string>
  url: string
  stack: string
}

export const profile = {
  name: { en: "HAMADA Taigen", ja: "濱田 泰源" },
  title: {
    en: "Full-Stack Software Engineer · AI-Native",
    ja: "フルスタックエンジニア · AIネイティブ",
  },
  location: { en: "Remote — Japan (JST)", ja: "リモート — 日本(JST)" },
  email: "me@hatai.dev",
  github: "https://github.com/hatai",
  linkedin: "https://linkedin.com/in/hamadataigen",
  availability: {
    en: "Available 20–30 hrs/week as an independent contractor · Remote · Japan (JST)",
    ja: "独立契約(業務委託)で週20〜30時間対応可能 · リモート · 日本(JST)",
  },
  summary: {
    en: "Full-stack software engineer with 10 years of experience building production web services end-to-end — POS systems, real-time video streaming, reservation platforms, and healthcare SaaS. Currently: LLM document-processing in production and developer-platform work (CI/CD, test-suite performance). Tech lead (PL/PM) and hands-on engineer on teams of 3–6.",
    ja: "POSシステム、リアルタイム動画配信、予約プラットフォーム、ヘルスケアSaaSなど、プロダクションのWebサービスをEnd-to-Endで構築してきたフルスタックエンジニア(経験10年)。現在はLLMによる文書処理の本番運用と、開発基盤の改善(CI/CD、テストスイート高速化)を担当。3〜6名チームでテックリード(PL/PM)と実装を兼任。",
  },
  highlights: {
    en: [
      "Shipped LLM-based document extraction to production at a healthcare SaaS — replaced a legacy OCR pipeline with substantially higher accuracy; owns the Python/FastAPI/LangChain pipeline and its task-queue workers on AWS.",
      "Release engineering: rebuilt container CI/CD around a build-once model — prebuilt base images plus an ECR registry cache cut image builds from 17 minutes to under 5; added automated rollback and reusable deploy workflows (QA/staging/prod).",
      "Test infrastructure: led a 9-part RSpec optimization project on a 100k+-commit Rails/Vue monorepo (CircleCI Gen2, test-suite splitting, auto-rerun) — individual suite runtimes cut by up to ~40%.",
      "Daily production user of Claude Code, Cursor, GitHub Copilot, Codex, and Devin — distilled the know-how into agent skills (LangChain, Langfuse, FastAPI, Terraform, optimize-rspec) and shared them across the engineering team.",
      "Spec-driven development: write thorough design docs and context so coding agents deliver the intended result on the first pass.",
    ],
    ja: [
      "ヘルスケアSaaSでLLM文書抽出を本番投入 — 既存OCRパイプラインを置き換え、精度を大幅に向上。Python/FastAPI/LangChainパイプラインとタスクキューワーカーをAWS上で設計・運用。",
      "リリースエンジニアリング: build-onceモデルへのCI/CD再構築。ベースイメージ事前ビルドとECRレジストリキャッシュでイメージビルドを17分→5分未満に短縮し、自動ロールバックとQA/staging/prod共通の再利用可能なデプロイワークフローを整備。",
      "テスト基盤: 10万コミット超のRails/Vueモノリスで9分割のRSpec高速化プロジェクトを主導(CircleCI Gen2、テスト分割、自動リラン)。スイート単位の実行時間を最大約40%短縮。",
      "Claude Code、Cursor、GitHub Copilot、Codex、Devinを業務で毎日使用。ノウハウをエージェントスキル(LangChain、Langfuse、FastAPI、Terraform、optimize-rspec)として整理し、開発チーム全体に展開。",
      "スペック駆動開発: 設計ドキュメントとコンテキストを丁寧に整備し、コーディングエージェントが一発で意図した成果物を出すための実践。",
    ],
  },
  skills: [
    {
      category: { en: "AI Tooling", ja: "AIツール" },
      starred: true,
      skills: [
        "Claude Code",
        "Cursor",
        "GitHub Copilot",
        "Codex",
        "Devin",
        "LangChain",
        "LangGraph",
        "Langfuse",
      ],
    },
    {
      category: { en: "Languages", ja: "言語" },
      starred: false,
      skills: [
        "TypeScript",
        "JavaScript (ES6)",
        "Ruby",
        "Python",
        "PHP",
        "Java",
        "+ Kotlin, C++11, Zig, Lua, Rust, Go, Elixir",
      ],
    },
    {
      category: { en: "Frontend", ja: "フロントエンド" },
      starred: false,
      skills: [
        "React",
        "Vue.js",
        "Next.js",
        "Gatsby",
        "Astro",
        "TanStack Start",
        "React Router v7",
        "React Admin",
        "Storybook",
        "jQuery",
        "Sass",
      ],
    },
    {
      category: { en: "Backend", ja: "バックエンド" },
      starred: false,
      skills: [
        "Ruby on Rails",
        "Node.js / Express",
        "FastAPI",
        "Django",
        "Spring Boot",
        "CakePHP",
        "FuelPHP",
        "Ktor",
        "Phoenix",
      ],
    },
    {
      category: { en: "Databases", ja: "データベース" },
      starred: false,
      skills: ["PostgreSQL", "MySQL / MariaDB", "MongoDB"],
    },
    {
      category: { en: "Cloud / Infra", ja: "クラウド / インフラ" },
      starred: false,
      skills: [
        "AWS",
        "Google Cloud (Cloud Run)",
        "Docker",
        "Terraform",
        "GitHub Actions",
        "CircleCI",
        "Datadog",
        "Firebase",
        "Supabase",
        "Cloudflare",
      ],
    },
    {
      category: { en: "Auth / Others", ja: "認証 / その他" },
      starred: false,
      skills: ["Auth0", "Clerk", "Twilio", "Vite", "Webpack", "Git"],
    },
  ],
  jobs: [
    {
      company: {
        en: "iCARE, Inc. — Carely (healthcare SaaS)",
        ja: "株式会社iCARE — Carely(健康管理SaaS)",
      },
      role: {
        en: "Full-Stack Engineer / Tech Lead (PL/PM)",
        ja: "フルスタックエンジニア / テックリード(PL/PM)",
      },
      period: { en: "Nov 2022 – Present", ja: "2022年11月 – 現在" },
      location: { en: "Tokyo, Japan", ja: "東京" },
      stack: "Vue.js, Ruby on Rails, Python, FastAPI, AWS, PostgreSQL",
      highlights: {
        en: [
          "Built the LLM document ingestion feature now in production: users photograph or scan health checkup results and the system structures the data — replacing OCR with LLMs for substantially higher accuracy; owns the FastAPI/LangChain pipeline and task-queue workers on AWS.",
          "Led a dedicated AI OCR R&D phase (Oct 2024 – Oct 2025): evaluated models and approaches on real-world documents, then designed and shipped the production pipeline.",
          "Designed a configurable rules engine for health-check conditions (e.g., metabolic syndrome criteria); the design was reused by later features, cutting future dev effort.",
          "Release engineering and observability for the OCR service: build-once CI/CD (image builds 17 min → under 5 min), automated rollback workflows, Datadog APM dashboards, and retry instrumentation for queue workers.",
          "Developer platform (2026): led a 9-part RSpec optimization of the Carely monorepo — CircleCI Gen2, test-suite splitting, auto-rerun, suite runtimes down up to ~40%; migrated frontend linting to type-aware oxlint and upgraded Bundler to 4.",
          "Led AI-tool adoption across the engineering org: Claude Code workflows and Agent Skills, improving team-wide productivity.",
        ],
        ja: [
          "健康診断結果を撮影・スキャンするとデータを構造化するLLM文書取り込み機能を本番投入。OCRをLLMに置き換え、精度を大幅に向上。FastAPI/LangChainパイプラインとタスクキューワーカーをAWS上で設計・運用。",
          "AI OCRのR&D専任期間(2024年10月〜2025年10月)を主導。実ドキュメントでモデル・方式を評価し、本番パイプラインを設計・実装。",
          "健康診断判定の設定可能なルールエンジン(メタボリックシンドローム基準など)を設計。柔軟な設計が他機能にも再利用され、開発コストを削減。",
          "OCRサービスのリリースエンジニアリングとオブザーバビリティ: build-once CI/CD(イメージビルド17分→5分未満)、自動ロールバックワークフロー、Datadog APMダッシュボード、キューワーカーのリトライ計装を整備。",
          "開発基盤(2026年): CarelyモノリスのRSpec高速化を9分割で主導 — CircleCI Gen2、テスト分割、自動リランによりスイート実行時間を最大約40%短縮。フロントエンドのlintをtype-awareなoxlintへ移行し、Bundlerを4へアップグレード。",
          "Claude CodeワークフローとAgent SkillsによるAIツール導入をエンジニア組織全体で推進し、チーム全体の生産性を向上。",
        ],
      },
    },
    {
      company: {
        en: "Legalscape (legal-tech SaaS)",
        ja: "Legalscape(法律テックSaaS)",
      },
      role: {
        en: "Independent Contractor — 24 hrs/week",
        ja: "業務委託 — 週24時間",
      },
      period: { en: "Jun 2024 – Jun 2026", ja: "2024年6月 – 2026年6月" },
      location: { en: "Remote, Japan", ja: "リモート(日本)" },
      stack:
        "Vue.js, React, React Admin, React Router v7, Node.js, Express, TypeORM, Python",
      highlights: {
        en: [
          "Delivered new features and a frontend redesign while working 24 hrs/week in parallel with full-time employment — a proven part-time remote contractor track record.",
          "Full-stack ownership on a 3-person team: frontend and server-side development.",
        ],
        ja: [
          "正社員業と並行して週24時間で勤務しながら、新機能の提供とフロントエンドの全面リニューアルを完遂 — 副業リモート契約の実績。",
          "3名チームでフルスタックを担当: フロントエンドおよびサーバーサイド開発。",
        ],
      },
    },
    {
      company: { en: "FAIR NEXT INNOVATION", ja: "FAIR NEXT INNOVATION" },
      role: {
        en: "Full-Stack Engineer / Tech Lead (PL/PM)",
        ja: "フルスタックエンジニア / テックリード(PL/PM)",
      },
      period: { en: "May 2019 – Oct 2022", ja: "2019年5月 – 2022年10月" },
      location: { en: "Tokyo, Japan", ja: "東京" },
      stack:
        "Next.js, React, Gatsby, Node.js, Ruby on Rails, Kotlin/Ktor, GCP (Cloud Run), Auth0, Twilio",
      highlights: {
        en: [
          "Led 5 web services from inception through design and launch as PL/PM and hands-on engineer on teams of 3–6.",
          "Public gym web reservation service (Saga Prefecture): Gatsby + Rails + GCP Cloud Run + Auth0 — designed the entire admin UI/UX myself where no designer was assigned.",
          "Real-time video streaming service (Next.js + Kotlin/Ktor); web gacha and web voting services (Next.js + Rails); contact-center internal chat tool (Next.js + Twilio) shipped on a tight schedule with zero critical bugs.",
        ],
        ja: [
          "PL/PM兼実装エンジニアとして、3〜6名のチームで5つのWebサービスを0→1で立ち上げ。",
          "公共体育館Web予約サービス(佐賀県): Gatsby + Rails + GCP Cloud Run + Auth0。デザイナー不在の中、管理画面のUI/UXを自身で設計。",
          "リアルタイム動画配信サービス(Next.js + Kotlin/Ktor)、Webガチャ・Web投票(Next.js + Rails)、コンタクトセンター向けチャットツール(Next.js + Twilio)を短期間でリリースし、重大バグゼロ。",
        ],
      },
    },
    {
      company: { en: "Silicon Studio", ja: "シリコンスタジオ" },
      role: { en: "C++ Engineer", ja: "C++エンジニア" },
      period: { en: "May 2018 – Apr 2019", ja: "2018年5月 – 2019年4月" },
      location: { en: "Tokyo, Japan", ja: "東京" },
      stack: "C++11, Qt, Visual Studio, in-house rendering engine (Mizuchi)",
      highlights: {
        en: [
          "Built a digital dashboard mock tool (Qt) used to prototype next-generation vehicle instrument clusters for a major automaker.",
          "Improved driving-simulator graphics: reflected vehicle telemetry (speed, steering angle) in real-time scenes rendered by the in-house engine.",
        ],
        ja: [
          "大手自動車メーカーの次世代車載メーターのプロトタイプに使用されるデジタルダッシュボードモックツール(Qt)を構築。",
          "ドライビングシミュレータのグラフィックを改善: 内製レンダリングエンジンのリアルタイムシーンに車両テレメトリ(速度・操舵角)を反映。",
        ],
      },
    },
    {
      company: { en: "Network21 / Digital Hearts", ja: "Network21 / デジタルハーツ" },
      role: { en: "Software Engineer", ja: "ソフトウェアエンジニア" },
      period: { en: "May 2016 – Apr 2018", ja: "2016年5月 – 2018年4月" },
      location: { en: "Tokyo, Japan", ja: "東京" },
      stack: "Java, Spring, Objective-C, Python, Scrapy, Selenium",
      highlights: {
        en: [
          "Developed an iPad/iPhone POS register application: Java/Spring backend + Objective-C iOS app.",
          "As main programmer, built a web scraping tool that detects cross-site-request vulnerabilities — launched as a new business line with significant early revenue.",
          "Continuously developed test automation (Java/Selenium) on a 5-person team for Digital Hearts, the group's parent test-services company (2017–2018).",
        ],
        ja: [
          "iPad/iPhone向けPOSレジアプリケーションを開発: Java/Springサーバーサイド + Objective-C iOSアプリ。",
          "メインプログラマとして、クロスサイトリクエスト脆弱性を検出するWebスクレイピングツールを構築 — 新規事業として立ち上げ、初期の大きな収益を創出。",
          "グループの親会社でテストサービス企業のデジタルハーツにて、テスト自動化(Java/Selenium)の開発を5名チームで随時担当(2017〜2018年)。",
        ],
      },
    },
  ],
  projects: [
    {
      name: "gitz",
      tagline: {
        en: "A terminal git TUI in Zig, aiming for JetBrains-grade interaction",
        ja: "JetBrains相当の操作感を目指す、Zig製ターミナルgit TUI",
      },
      description: {
        en: "A commit-focused git TUI with a three-pane Changes/Diff/Commit flow, plus a log-view context menu for revert, cherry-pick, reset, tag, branch, and compare operations. 380+ commits of active solo development.",
        ja: "Changes/Diff/Commitの3ペインでステージング・差分閲覧・コミットを行うgit TUI。ログビューのコンテキストメニューからrevert・cherry-pick・reset・tag・branch・compare操作にも対応。380以上のコミットで個人開発を継続中。",
      },
      url: "https://github.com/hatai/gitz",
      stack: "Zig 0.16 · zigzag",
    },
  ],
};
