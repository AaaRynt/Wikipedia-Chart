// src/components/layout/main.tsx
// https://recharts.org/
import { useEffect, useState } from 'react'
import { Loading, WikiChart } from '@/components/main/index'
import { Card } from '@/components/ui'
import type { TQuery, TRes } from '@/data/types'

export function Main({ query }: { query: TQuery }) {
  const [res, setRes] = useState<TRes[]>([])

  useEffect(() => {
    async function fetchRes() {
      const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${query.project}/${query.access}/${query.agent}/${query.article}/${query.granularity}/${query.start}/${query.end}`,
        temp = await fetch(url),
        json = await temp.json()
      setRes(json.items)
    }
    fetchRes()
  }, [query])

  return (
    <main className="flex-1 flex-col justify-center px-8">
      <Card className="h-[85vh] w-full">{res.length > 0 ? <WikiChart res={res} /> : <Loading />}</Card>
    </main>
  )
}
