// src/lib/query-url.ts
import type { TArticle, TQuery } from '@/data/types'

import { isWikipediaProject, normalizeArticleTitle, uniqueArticles } from '@/lib/article'

const accessValues = ['all-access', 'desktop', 'mobile-app', 'mobile-web'] as const
const agentValues = ['all-agents', 'automated', 'spider', 'user'] as const
const granularityValues = ['monthly', 'daily'] as const

function isDate(value: string) {
  if (!/^\d{8}$/.test(value)) return false
  const date = new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10).replaceAll('-', '') === value
}

function readArticles(value: unknown): TArticle[] | null {
  if (!Array.isArray(value)) return null
  const articles: TArticle[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object' || !isWikipediaProject(item.project) || typeof item.article !== 'string' || !item.article.trim()) return null
    if (item.entityId !== undefined && (typeof item.entityId !== 'string' || !/^Q[1-9]\d*$/.test(item.entityId))) return null
    articles.push({ project: item.project, article: normalizeArticleTitle(item.article), ...(item.entityId ? { entityId: item.entityId } : {}) })
  }
  return uniqueArticles(articles)
}

function readQuery(values: Record<string, unknown>): TQuery | null {
  const { searchProject, access, agent, granularity, start, end } = values
  const articles = readArticles(values.articles)
  if (!isWikipediaProject(searchProject) || !articles) return null
  if (!accessValues.includes(access as TQuery['access']) || !agentValues.includes(agent as TQuery['agent']) || !granularityValues.includes(granularity as TQuery['granularity'])) return null
  if (typeof start !== 'string' || typeof end !== 'string' || !isDate(start) || !isDate(end) || start > end) return null
  return { searchProject, articles, access: access as TQuery['access'], agent: agent as TQuery['agent'], granularity: granularity as TQuery['granularity'], start, end }
}

export function parseQueryUrl(url: URL, fallback: TQuery): TQuery {
  try {
    const params = url.searchParams
    if (params.has('v')) {
      if (params.get('v') !== '2') return fallback
      return (
        readQuery({
          searchProject: params.get('project'),
          articles: JSON.parse(params.get('articles') ?? 'null'),
          access: params.get('access'),
          agent: params.get('agent'),
          granularity: params.get('granularity'),
          start: params.get('start'),
          end: params.get('end'),
        }) ?? fallback
      )
    }

    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] === 'Wikipedia-Chart') parts.shift()
    if (parts.length !== 7) return fallback
    const [project, access, agent, group, granularity, start, end] = parts
    return (
      readQuery({
        searchProject: project,
        articles: group.split(';').map((article) => ({ project, article: decodeURIComponent(article) })),
        access,
        agent,
        granularity,
        start,
        end,
      }) ?? fallback
    )
  } catch {
    return fallback
  }
}

export function formatQueryUrl(query: TQuery, basePath: string) {
  const base = basePath.endsWith('/') ? basePath : `${basePath}/`
  const params = new URLSearchParams({
    v: '2',
    project: query.searchProject,
    articles: JSON.stringify(query.articles),
    access: query.access,
    agent: query.agent,
    granularity: query.granularity,
    start: query.start,
    end: query.end,
  })
  return `${base}?${params}`
}
