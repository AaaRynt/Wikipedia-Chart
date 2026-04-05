// src/components/layout/main.tsx
// https://recharts.org/
import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { TQuery, TRes } from '@/data/types'
import { formatKey } from '@/lib/format'

export function Main({ query }: { query: TQuery }) {
  const [res, setRes] = useState<TRes[]>([])

  useEffect(() => {
    async function fetchRes() {
      const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${query.project}/${query.access}/${query.agent}/Russo-Ukrainian_war/${query.granularity}/${query.start}/${query.end}`
      const temp = await fetch(url)
      const json = await temp.json()
      setRes(json.items)
    }
    fetchRes()
  }, [query])
  const chartData = useMemo(
    () =>
      res
        .map((item) => {
          const year = Number(item.timestamp.slice(0, 4))
          const month = Number(item.timestamp.slice(4, 6)) - 1
          const day = Number(item.timestamp.slice(6, 8))
          const date = new Date(year, month, day)
          return {
            ...item,
            time: date.getTime(),
          }
        })
        .sort((a, b) => a.time - b.time),
    [res],
  )

  return (
    <main className="flex-1 flex-col justify-center px-8">
      <Card className="h-[85vh] w-full">
        {res.length > 0 && (
          <>
            {/* 后期把Title改成输入的，判断加载只判断Content */}
            <CardHeader>
              <CardTitle>{formatKey(res[0].article, true)}</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--muted)" />
                  <XAxis
                    dataKey="time"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(value) => format(new Date(value), 'MMM')}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      color: 'var(--popover-foreground)',
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                    labelFormatter={(value) => format(new Date(value as number), 'yyyy, M/d')}
                    formatter={(value) => [`${value}`, `${(value as number) >= 2 ? 'views' : 'view'}`]}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 2 }}
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </>
        )}
      </Card>
    </main>
  )
}
