// src/api/pageviews-api.ts
import type { TArticle, TArticleSeries, TQuery, TRes } from '@/data/types'

export type TPageviewsResult = TArticleSeries & {
  url: string
  statusCode: number
  data: unknown
}

function buildUrl(query: TQuery, target: TArticle) {
  const segments = [target.project, query.access, query.agent, target.article, query.granularity, query.start, query.end].map(encodeURIComponent)
  return `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${segments.join('/')}`
}

function isPageview(value: unknown): value is TRes {
  if (!value || typeof value !== 'object') return false
  return 'timestamp' in value && typeof value.timestamp === 'string' && /^\d{10}$/.test(value.timestamp) && 'views' in value && typeof value.views === 'number' && Number.isFinite(value.views) && value.views >= 0
}

async function getArticle(query: TQuery, target: TArticle, signal?: AbortSignal): Promise<TPageviewsResult> {
  const url = buildUrl(query, target)
  let statusCode = 0
  let data: unknown = null

  try {
    const response = await fetch(url, { signal })
    statusCode = response.status
    data = await response.json()

    if (response.status === 404) return { target, url, statusCode, data, items: [], status: 'empty' }
    if (!response.ok) throw new Error(`Pageviews request failed (HTTP ${response.status})`)
    if (!data || typeof data !== 'object' || !('items' in data) || !Array.isArray(data.items) || !data.items.every(isPageview)) {
      throw new Error('Invalid pageviews response')
    }

    return { target, url, statusCode, data, items: data.items, status: data.items.length > 0 ? 'success' : 'empty' }
  } catch (error) {
    if (signal?.aborted || (error instanceof Error && error.name === 'AbortError')) throw error
    return { target, url, statusCode, data, items: [], status: 'error', error: error instanceof Error ? error.message : 'Pageviews request failed' }
  }
}

function getArticles(query: TQuery, signal?: AbortSignal) {
  return Promise.all(query.articles.map((target) => getArticle(query, target, signal)))
}

export const pageviewsApi = { buildUrl, getArticle, getArticles }
