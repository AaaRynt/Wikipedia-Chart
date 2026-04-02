// src/components/layout/main.tsx
import * as React from 'react'
import { format } from 'date-fns'
import res from '@/data/res.json'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function Main() {
  const chartData = React.useMemo(
    () =>
      res.items
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
    [],
  )

  return (
    <main className="flex-1 flex-col justify-center">
      <h1>{res.items[0].article}</h1>
      <div className="h-80 w-full">
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
              strokeWidth={2}
              dot={{ r: 0 }}
              activeDot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  )
}
