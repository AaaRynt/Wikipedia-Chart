// src/data/types.ts
export type Tres = {
  /**
   *   {lang}.wikipedia
   */
  project: string
  /**
   * （空格用 _ 替代）
   */
  article: string
  granularity: 'monthly' | 'daily'
  /**
   *   request:YYYYMMDD00 / YYYYMMDD
   *
   *   response:YYYYMMDD00
   */
  timestamp: string
  access: 'all-access' | 'desktop' | 'mobile-app' | 'mobile-web'
  agent: 'all-agents' | 'automated' | 'spider' | 'user'
  views: number
}
