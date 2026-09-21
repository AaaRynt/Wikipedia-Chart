// src/components/layout/main.tsx

import { RotateCcwIcon } from 'lucide-react'
import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from 'react'

import type { TArticleSeries, TPageviewsQuery, TQuery } from '@/data/types'

import { pageviewsApi } from '@/api/pageviews-api'
import { Loading } from '@/components/features'
import { Empty, WikiChart } from '@/components/main'
import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent } from '@/components/ui'
import { getArticleLabel } from '@/lib/article'

export function Main({ query, setQuery, setChartReady, setChartNode }: { query: TQuery; setQuery: Dispatch<SetStateAction<TQuery>>; setChartReady?: (ready: boolean) => void; setChartNode?: (node: HTMLDivElement | null) => void }) {
  const { articles, access, agent, granularity, start, end } = query
  const request = useMemo<TPageviewsQuery>(() => ({ articles, access, agent, granularity, start, end }), [articles, access, agent, granularity, start, end])
  const [result, setResult] = useState<{ request: TPageviewsQuery; series: TArticleSeries[] } | null>(null)
  const [retry, setRetry] = useState(0)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const res = result?.request === request ? result.series : []
  const loading = request.articles.length > 0 && result?.request !== request
  const failed = res.filter((series) => series.status === 'error')
  const empty = res.filter((series) => series.status === 'empty')
  const hasData = res.some((series) => series.items.length > 0)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchRes() {
      if (request.articles.length === 0) return
      try {
        const series = await pageviewsApi.getArticles(request, controller.signal)
        if (!controller.signal.aborted) setResult({ request, series })
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({ request, series: request.articles.map((target) => ({ target, items: [], status: 'error', error: error instanceof Error ? error.message : 'Pageviews request failed' })) })
        }
      }
    }
    fetchRes()
    return () => controller.abort()
  }, [request, retry])
  useEffect(() => {
    setChartNode?.(cardRef.current)
  }, [setChartNode])
  useEffect(() => {
    setChartReady?.(!loading && hasData)
  }, [loading, hasData, setChartReady])

  return (
    <main className="flex-1 flex-col justify-center px-2 py-4 sm:px-8">
      <div ref={cardRef} className="w-full">
        <Card className="h-[65vh] min-h-80 w-full rounded-md">
          {loading ? (
            <CardContent className="flex h-full items-center justify-center">
              <Loading size="big" />
            </CardContent>
          ) : query.articles.length > 0 ? (
            <>
              {failed.length > 0 && (
                <CardContent className="max-h-36 shrink-0 overflow-y-auto">
                  <Alert variant="destructive">
                    <AlertTitle>Some pageviews could not be loaded</AlertTitle>
                    <AlertDescription className="break-words">{failed.map((series) => `${getArticleLabel(series.target)}: ${series.error}`).join('; ')}</AlertDescription>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-fit"
                      onClick={() => {
                        setResult(null)
                        setRetry((value) => value + 1)
                      }}
                    >
                      <RotateCcwIcon /> Retry
                    </Button>
                  </Alert>
                </CardContent>
              )}
              {(hasData || failed.length > 0) && empty.length > 0 && (
                <CardContent>
                  <p role="status" className="text-sm text-muted-foreground">
                    No pageview data: {empty.map((series) => getArticleLabel(series.target)).join(', ')}
                  </p>
                </CardContent>
              )}
              {(hasData || failed.length === 0) && <WikiChart res={res} />}
            </>
          ) : (
            <Empty query={query} setQuery={setQuery} />
          )}
        </Card>
      </div>
    </main>
  )
}
