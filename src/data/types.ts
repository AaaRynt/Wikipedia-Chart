// src/data/types.ts
export type TQuery = {
  /**
   *   {lang}.project
   */
  project: string
  /**
   * （空格用 _ 替代）
   */
  article: string
  granularity: 'monthly' | 'daily'
  access: 'all-access' | 'desktop' | 'mobile-app' | 'mobile-web'
  agent: 'all-agents' | 'automated' | 'spider' | 'user'
  /**
   *   request:YYYYMMDD00 / YYYYMMDD
   */
  start: string
  end: string
}
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

export type TKey = {
  label: string
  value: string[]
  svg: React.ElementType[]
  align: 'start' | 'center' | 'end'
}
