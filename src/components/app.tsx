// src/components/app.tsx
import { useEffect, useState } from 'react'

import type { TQuery } from '@/data/types'

import { ComparisonControls } from '@/components/features'
import { Footer, Header, Main } from '@/components/layout'
import { defaultQuery } from '@/data/default-query'
import { usePageviews } from '@/hooks/use-pageviews'
import { formatQueryUrl, parseQueryUrl } from '@/lib/query-url'

export function App() {
  const [chartNode, setChartNode] = useState<HTMLDivElement | null>(null)
  const [query, setQuery] = useState<TQuery>(() => {
    if (typeof window === 'undefined') return defaultQuery
    return parseQueryUrl(new URL(window.location.href), defaultQuery)
  })
  const { snapshot, loading, retry } = usePageviews(query)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.history.replaceState(null, '', formatQueryUrl(query, import.meta.env.BASE_URL ?? '/'))
  }, [query])

  return (
    <div className="flex min-h-screen flex-col items-center bg-background text-foreground *:flex *:w-full *:items-center">
      <Header query={query} snapshot={snapshot} chartNode={chartNode} />
      <ComparisonControls query={query} setQuery={setQuery} />
      <Main query={query} setQuery={setQuery} snapshot={snapshot} loading={loading} onRetry={retry} setChartNode={setChartNode} />
      <Footer query={query} setQuery={setQuery} />
    </div>
  )
}
