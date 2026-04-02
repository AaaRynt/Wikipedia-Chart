// src/components/layout/main.tsx
import { useEffect, useMemo, useState } from 'react'
import type { Tres } from '@/data/types'
import { format } from 'date-fns'
import { formatKey } from '@/lib/format'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function Main() {
  const [res, setRes] = useState<Tres[]>([])

  useEffect(() => {
    async function fetchRes() {
      const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/Russo-Ukrainian_war/daily/20220101/20230101`
      const res = await fetch(url)
      const json = await res.json()
      setRes(json.items)
    }
    fetchRes()
  }, [])
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
    <main className="flex-1 flex-col justify-center">
      <Card className="h-[80vh] w-4/5">
        {res.length > 0 && (
          <>
            <CardHeader>
              <CardTitle>{formatKey(res[0].article, true)}</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="5 10" />
                  <XAxis
                    dataKey="time"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(value) => format(new Date(value), 'MMM')}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      color: 'var(--popover-foreground)',
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                    labelFormatter={(value) => format(new Date(value as number), 'MMM d, yyyy')}
                    formatter={(value) => [`${value}`, 'views']}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#aaaaff"
                    strokeWidth={1}
                    dot={{ r: 0 }}
                    activeDot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </>
        )}
      </Card>
    </main>
  )
}
