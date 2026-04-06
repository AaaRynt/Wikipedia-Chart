// src/components/layout/main.tsx
// https://recharts.org/
import { useEffect, useState } from 'react'
import { Empty, Loading, WikiChart } from '@/components/main/index'
import { Card } from '@/components/ui'
import type { TQuery, TRes } from '@/data/types'

export function Main({ query }: { query: TQuery }) {
  const [res, setRes] = useState<TRes[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchRes() {
      setLoading(true)
      try {
        const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${encodeURIComponent(
          query.project,
        )}/${encodeURIComponent(query.access)}/${encodeURIComponent(query.agent)}/${encodeURIComponent(
          query.article,
        )}/${encodeURIComponent(query.granularity)}/${encodeURIComponent(query.start)}/${encodeURIComponent(query.end)}`
        const temp = await fetch(url)
        const json = await temp.json()
        setRes(json.items ?? [])
      } finally {
        setLoading(false)
      }
    }
    fetchRes()
  }, [query])

  return (
    <main className="flex-1 flex-col justify-center px-8">
      <Card className="h-[85vh] w-full">
        {loading ? <Loading /> : res.length > 0 ? <WikiChart res={res} /> : <Empty />}
      </Card>
    </main>
  )
}
