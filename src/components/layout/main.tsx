// src/components/layout/main.tsx
// https://recharts.org/
import { useEffect, useRef, useState } from 'react'
import { Loading } from '@/components/features'
import { Empty, WikiChart } from '@/components/main/'
import { Card, CardContent } from '@/components/ui'
import type { TQuery, TRes } from '@/data/types'

export function Main({
  query,
  onReady,
  onChartRef,
}: {
  query: TQuery
  onReady?: (ready: boolean) => void
  onChartRef?: (node: HTMLDivElement | null) => void
}) {
  const [res, setRes] = useState<TRes[]>([])
  const [loading, setLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function fetchRes() {
      setLoading(true)
      try {
        const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${encodeURIComponent(query.project)}/${encodeURIComponent(query.access)}/${encodeURIComponent(query.agent)}/${encodeURIComponent(query.article)}/${encodeURIComponent(query.granularity)}/${encodeURIComponent(query.start)}/${encodeURIComponent(query.end)}`
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
    onChartRef?.(cardRef.current)
  }, [onChartRef])
  useEffect(() => {
    onReady?.(!loading && res.length > 0)
  }, [loading, res.length, onReady])

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
            <Empty />
          )}
        </Card>
      </div>
    </main>
  )
}
