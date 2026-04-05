// src/components/main/wiki-chart.tsx
import { format } from 'date-fns'
import { useMemo } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CardContent } from '@/components/ui'
import type { TQuery, TRes } from '@/data/types'
import { formatKey } from '@/util/format'

export function WikiChart({ res, query }: { res: TRes[]; query: TQuery }) {
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
    <CardContent className="h-full">
      {/* 后期把Title改成输入的，判断加载只判断Content */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="var(--muted)" vertical={false} />
          <XAxis
            dataKey="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => format(new Date(value), 'MMM')}
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
          <Legend formatter={() => formatKey(query.article, true)} />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  )
}
