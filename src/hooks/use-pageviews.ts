// src/hooks/use-pageviews.ts

import { useEffect, useState } from 'react'

import type { TPageviewsQuery, TPageviewsSnapshot } from '@/data/types'

import { pageviewsApi } from '@/api/pageviews-api'
import { getPageviewsRequestKey } from '@/lib/pageviews-snapshot'

export function usePageviews(query: TPageviewsQuery) {
  const requestKey = getPageviewsRequestKey(query)
  const [result, setResult] = useState<TPageviewsSnapshot | null>(null)
  const [attempt, setAttempt] = useState(0)
  const hasArticles = query.articles.length > 0
  const snapshot = hasArticles && result?.requestKey === requestKey ? result : null

  useEffect(() => {
    const request: TPageviewsQuery = JSON.parse(requestKey)
    if (request.articles.length === 0) return
    const controller = new AbortController()
    const run = async () => {
      try {
        const series = await pageviewsApi.getArticles(request, controller.signal)
        if (!controller.signal.aborted) setResult({ requestKey, series, fetchedAt: new Date().toISOString() })
      } catch (error) {
        if (!controller.signal.aborted) {
          const series = request.articles.map((target) => ({ target, items: [], status: 'error' as const, error: error instanceof Error ? error.message : 'Pageviews request failed', url: pageviewsApi.buildUrl(request, target), statusCode: 0, data: null }))
          setResult({ requestKey, series, fetchedAt: new Date().toISOString() })
        }
      }
    }
    run()
    return () => controller.abort()
  }, [requestKey, attempt])

  const retry = () => {
    setResult(null)
    setAttempt((value) => value + 1)
  }

  return { snapshot, loading: hasArticles && !snapshot, retry }
}
