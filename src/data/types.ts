// src/data/types.ts
export type TArticle = {
  project: string
  article: string
  entityId?: string
}

export type TComparisonMode = 'articles' | 'languages'

export type TLanguageMapping = {
  source: TArticle
  versions: TArticle[]
  unavailable?: 'missing-page' | 'no-entity' | 'missing-entity'
}

export type TQuery = {
  mode: TComparisonMode
  source: TArticle | null
  searchProject: string
  articles: TArticle[]
  granularity: 'monthly' | 'daily'
  access: 'all-access' | 'desktop' | 'mobile-app' | 'mobile-web'
  agent: 'all-agents' | 'automated' | 'spider' | 'user'
  /**
   *   request:YYYYMMDD00 / YYYYMMDD
   */
  start: string
  end: string
}

export type TPageviewsQuery = Pick<TQuery, 'articles' | 'access' | 'agent' | 'granularity' | 'start' | 'end'>
// {
//   "project": "en.wikipedia",
//   "article": "Russo-Ukrainian_war",
//   "granularity": "daily",
//   "timestamp": "2022010200",
//   "access": "all-access",
//   "agent": "all-agents",
//   "views": 5
// }
export type TRes = {
  project: string
  article: string
  granularity: 'monthly' | 'daily'
  /**
   *   response:YYYYMMDD00
   */
  timestamp: string
  access: 'all-access' | 'desktop' | 'mobile-app' | 'mobile-web'
  agent: 'all-agents' | 'automated' | 'spider' | 'user'
  views: number
}

export type TArticleSeries = {
  target: TArticle
  items: TRes[]
  status: 'success' | 'empty' | 'error'
  error?: string
}

export type TKey = {
  label: string
  value: string[]
  svg: React.ElementType[]
  align: 'start' | 'center' | 'end'
}

export type TSearchPage = {
  pageid: number
  index?: number
  title: string
  description?: string
  pageprops?: { wikibase_item?: string }
  missing?: string
  invalid?: string
  thumbnail?: {
    source: string
    width: number
    height: number
  }
}

export type TSearchResponse = {
  error?: { info?: string }
  query?: {
    pages?: Record<string, TSearchPage>
  }
}

export type TPromptGroups = {
  title?: string
  group: string[]
  kind: 'preset-group' | 'preset-single' | 'user'
}[]
