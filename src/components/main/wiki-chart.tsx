// src/components/main/wiki-chart.tsx
import { useMemo } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { TArticleSeries, TPageviewsQuery } from '@/data/types'

import { Alert, AlertDescription, AlertTitle, CardContent } from '@/components/ui'
import { getArticleKey, getArticleLabel } from '@/lib/article'
import { buildChartData } from '@/lib/chart-data'

const monthLabel = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' })
const dateLabel = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })

export function WikiChart({ res, query }: { res: TArticleSeries[]; query: TPageviewsQuery }) {
  const lines = useMemo(
    () =>
      res.map((series, index) => ({
        label: getArticleLabel(series.target),
        id: getArticleKey(series.target),
        key: `article_${index}`,
        color: `var(--chart-${(index % 5) + 1})`,
        dash: [undefined, '6 3', '2 3'][Math.floor(index / 5) % 3],
      })),
    [res],
  )

  const { start, end, granularity } = query
  const chartData = useMemo(() => buildChartData(res, { start, end, granularity }), [res, start, end, granularity])

  const lineNames = useMemo(
    () =>
      new Map(
        lines.map((line) => {
          return [line.key, line.label]
        }),
      ),
    [lines],
  )
  const hasData = res.some((series) => series.items.length > 0)

  const monthTicks = useMemo(() => {
    if (chartData.length === 0) return []
    return chartData.filter((row, index) => index === 0 || index === chartData.length - 1 || new Date(row.time).getUTCDate() === 1).map((row) => row.time)
  }, [chartData])

  if (!hasData) {
    return (
      <CardContent className="flex h-full items-center justify-center">
        <Alert className="w-full max-w-md bg-secondary text-secondary-foreground shadow-xl">
          <AlertTitle>No pageview data</AlertTitle>
          <AlertDescription>The selected group did not return pageview data for this date range. Try another article or date range.</AlertDescription>
        </Alert>
      </CardContent>
    )
  }

  return (
    <CardContent className="min-h-0 flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="var(--muted)" vertical={false} />
          <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} ticks={monthTicks} tickFormatter={(value) => monthLabel.format(value)} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <Tooltip
            cursor={false}
            contentStyle={{
              color: 'var(--foreground)',
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              opacity: '0.8',
            }}
            labelFormatter={(value) => dateLabel.format(Number(value))}
            formatter={(value, name) => [`${value}`, lineNames.get(String(name)) ?? String(name)]}
          />
          {lines.map((line) => (
            <Line key={line.id} type="monotone" dataKey={line.key} name={line.label} stroke={line.color} strokeDasharray={line.dash} strokeWidth={2} dot={chartData.length <= 31 ? { r: 2 } : false} activeDot={{ r: 2 }} connectNulls={false} />
          ))}
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  )
}
