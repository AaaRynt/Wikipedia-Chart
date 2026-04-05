// src/components/main/wiki-chart.tsx
import { eachMonthOfInterval, format } from 'date-fns'
import { useMemo } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CardContent } from '@/components/ui'
import type { TRes } from '@/data/types'
import { formatKey } from '@/util/format'

export function WikiChart({ res }: { res: TRes[] }) {
  const chartData = useMemo(
    () =>
      res
        .map((item) => {
          const year = Number(item.timestamp.slice(0, 4)),
            month = Number(item.timestamp.slice(4, 6)) - 1,
            day = Number(item.timestamp.slice(6, 8)),
            date = new Date(year, month, day)
          return {
            ...item,
            time: date.getTime(),
          }
        })
        .sort((a, b) => a.time - b.time),
    [res],
  )
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
            tickFormatter={(value) => format(new Date(value), 'M/d')}
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
          <Legend formatter={() => formatKey(res[0].article, true)} />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  )
}
