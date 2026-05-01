// src/components/main/wiki-chart.tsx
import { eachMonthOfInterval, format } from 'date-fns'
import { useMemo } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Alert, AlertDescription, AlertTitle, CardContent } from '@/components/ui'
import type { TArticleSeries } from '@/data/types'
import { formatKey } from '@/util/format'

type ChartDatum = {
  time: number
  timestamp: string
  [key: string]: number | string
}

export function WikiChart({ res }: { res: TArticleSeries[] }) {
  const lines = useMemo(
    () =>
      res.map((series, index) => ({
        article: series.article,
        key: `article_${index}`,
        color: `var(--chart-${(index % 5) + 1})`,
      })),
    [res],
  )

  const chartData = useMemo(() => {
    const rows = new Map<number, ChartDatum>()

    res.forEach((series, index) => {
      series.items.forEach((item) => {
        const year = Number(item.timestamp.slice(0, 4)),
          month = Number(item.timestamp.slice(4, 6)) - 1,
          day = Number(item.timestamp.slice(6, 8)),
          time = new Date(year, month, day).getTime(),
          key = `article_${index}`,
          row = rows.get(time) ?? {
            time,
            timestamp: item.timestamp,
          }

        row[key] = item.views
        rows.set(time, row)
      })
    })

    return Array.from(rows.values()).sort((a, b) => a.time - b.time)
  }, [res])

  const lineNames = useMemo(
    () =>
      new Map(
        lines.map((line) => {
          return [line.key, formatKey(line.article)]
        }),
      ),
    [lines],
  )
  const hasData = chartData.length > 0

  const monthTicks = useMemo(() => {
    if (chartData.length === 0) return []
    const startTime = chartData[0].time,
      endTime = chartData[chartData.length - 1].time,
      start = new Date(startTime),
      end = new Date(endTime),
      ticks = [startTime, ...eachMonthOfInterval({ start, end }).map((date) => date.getTime()), endTime]

    return Array.from(new Set(ticks))
      .filter((value) => value >= startTime && value <= endTime)
      .sort((a, b) => a - b)
  }, [chartData])

  if (!hasData) {
    return (
      <CardContent className="flex h-full items-center justify-center">
        <Alert className="bg-secondary text-secondary-foreground w-full max-w-md shadow-xl">
          <AlertTitle>No pageview data</AlertTitle>
          <AlertDescription>
            The selected group did not return pageview data for this date range. Try another article or date range.
          </AlertDescription>
        </Alert>
      </CardContent>
    )
  }

  return (
    <CardContent className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="var(--muted)" vertical={false} />
          <XAxis
            dataKey="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            ticks={monthTicks}
            tickFormatter={(value) => format(new Date(value), 'MMM')}
            tickMargin={8}
          />
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
            labelFormatter={(value) => format(new Date(value as number), 'yyyy, M/d')}
            formatter={(value, name) => [`${value}`, lineNames.get(String(name)) ?? String(name)]}
          />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={formatKey(line.article)}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 2 }}
            />
          ))}
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  )
}
