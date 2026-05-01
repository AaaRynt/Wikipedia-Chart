// src/components/layout/main.tsx
// https://recharts.org/
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react'
import { Loading } from '@/components/features'
import { Empty, WikiChart } from '@/components/main/'
import { Card, CardContent } from '@/components/ui'
import type { TArticleSeries, TQuery } from '@/data/types'

export function Main({
  query,
  setQuery,
  setChartReady,
  setChartNode,
}: {
  query: TQuery
  setQuery: Dispatch<SetStateAction<TQuery>>
  setChartReady?: (ready: boolean) => void
  setChartNode?: (node: HTMLDivElement | null) => void
}) {
  const [res, setRes] = useState<TArticleSeries[]>([])
  const [loading, setLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchRes() {
      if (query.group.length === 0) {
        setRes([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const series = await Promise.all(
          query.group.map(async (article) => {
            const segments = [
              query.project,
              query.access,
              query.agent,
              article,
              query.granularity,
              query.start,
              query.end,
            ].map(encodeURIComponent)
            const url = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/' + segments.join('/')
            const temp = await fetch(url, { signal: controller.signal })
            if (!temp.ok) return { article, items: [] }
            const json = await temp.json()
            return { article, items: json.items ?? [] }
          }),
        )
        setRes(series)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setRes([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }
    fetchRes()
    return () => controller.abort()
  }, [query])
  useEffect(() => {
    setChartNode?.(cardRef.current)
  }, [setChartNode])
  useEffect(() => {
    setChartReady?.(!loading && res.some((series) => series.items.length > 0))
  }, [loading, res, setChartReady])

  return (
    <main className="flex-1 flex-col justify-center px-8">
      <div ref={cardRef} className="w-full">
        <Card className="h-[85vh] w-full">
          {loading ? (
            <CardContent className="flex h-full items-center justify-center">
              <Loading size="big" />
            </CardContent>
          ) : query.group.length > 0 ? (
            <WikiChart res={res} />
          ) : (
            <Empty setQuery={setQuery} />
          )}
        </Card>
      </div>
    </main>
  )
}
