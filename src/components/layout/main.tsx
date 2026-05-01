// src/components/layout/main.tsx
// https://recharts.org/
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react'
import { Loading } from '@/components/features'
import { Empty, WikiChart } from '@/components/main/'
import { Card, CardContent } from '@/components/ui'
import type { TQuery, TRes } from '@/data/types'

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
  const [res, setRes] = useState<TRes[]>([])
  const [loading, setLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function fetchRes() {
      if (!query.article) {
        setRes([])
        return
      }

      setLoading(true)
      try {
        const segments = [
          query.project,
          query.access,
          query.agent,
          query.article,
          query.granularity,
          query.start,
          query.end,
        ].map(encodeURIComponent)
        const url = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/' + segments.join('/')
        const temp = await fetch(url)
        const json = await temp.json()
        setRes(json.items ?? [])
      } finally {
        setLoading(false)
      }
    }
    fetchRes()
  }, [query])
  useEffect(() => {
    setChartNode?.(cardRef.current)
  }, [setChartNode])
  useEffect(() => {
    setChartReady?.(!loading && res.length > 0)
  }, [loading, res.length, setChartReady])

  return (
    <main className="flex-1 flex-col justify-center px-8">
      <div ref={cardRef} className="w-full">
        <Card className="h-[85vh] w-full">
          {loading ? (
            <CardContent className="flex h-full items-center justify-center">
              <Loading size="big" />
            </CardContent>
          ) : res.length > 0 ? (
            <WikiChart res={res} />
          ) : (
            <Empty setQuery={setQuery} />
          )}
        </Card>
      </div>
    </main>
  )
}
