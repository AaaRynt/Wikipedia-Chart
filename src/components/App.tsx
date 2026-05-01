// src/components/App.tsx
import { useEffect, useState } from 'react'
import { defaultQuery } from '@/data/default-query'
import type { TQuery } from '@/data/types'
import { Footer, Header, Main } from './layout'

export function App() {
  const [chartReady, setChartReady] = useState(false)
  const [chartNode, setChartNode] = useState<HTMLDivElement | null>(null)
  const [query, setQuery] = useState<TQuery>(() => {
    if (typeof window === 'undefined') return defaultQuery

    const parts = window.location.pathname.split('/').filter(Boolean),
      startIndex = parts.indexOf('Wikipedia-Chart') + 1,
      routeParts = parts.slice(startIndex, startIndex + 7),
      [project, access, agent, article, granularity, start, end] = routeParts

    return {
      project: project || defaultQuery.project,
      article: routeParts.length >= 7 ? article || defaultQuery.article : '',
      access: (access as TQuery['access']) || defaultQuery.access,
      agent: (agent as TQuery['agent']) || defaultQuery.agent,
      granularity: (granularity as TQuery['granularity']) || defaultQuery.granularity,
      start: start || defaultQuery.start,
      end: end || defaultQuery.end,
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const base = import.meta.env.BASE_URL ?? '/',
      normalizedBase = base.endsWith('/') ? base : `${base}/`,
      nextPath = query.article
        ? `${normalizedBase}${query.project}/${query.access}/${query.agent}/${query.article}/${query.granularity}/${query.start}/${query.end}`
        : normalizedBase

    window.history.replaceState(null, '', nextPath)
  }, [query])

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center *:flex *:w-full *:items-center">
      <Header query={query} setQuery={setQuery} chartReady={chartReady} chartNode={chartNode} />
      <Main query={query} setQuery={setQuery} setChartReady={setChartReady} setChartNode={setChartNode} />
      <Footer query={query} setQuery={setQuery} />
    </div>
  )
}
