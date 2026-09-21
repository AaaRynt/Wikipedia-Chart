// src/lib/chart-data.ts

import type { TArticleSeries, TPageviewsQuery } from '@/data/types'

export type TChartDatum = {
  time: number
  [key: string]: number | null
}

export function parsePageviewDate(value: string): number | null {
  if (!/^\d{8}(00)?$/.test(value)) return null
  const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
  const time = Date.parse(`${iso}T00:00:00Z`)
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === iso ? time : null
}

export function buildChartData(series: TArticleSeries[], query: Pick<TPageviewsQuery, 'start' | 'end' | 'granularity'>): TChartDatum[] {
  const start = parsePageviewDate(query.start)
  const end = parsePageviewDate(query.end)
  if (start === null || end === null || start > end) return []
  const cursor = new Date(start)
  if (query.granularity === 'monthly') cursor.setUTCDate(1)
  const rows = new Map<number, TChartDatum>()

  // Create every requested bucket, including dates missing from all language editions.
  while (cursor.getTime() <= end) {
    const time = cursor.getTime()
    const row: TChartDatum = { time }
    series.forEach((_, index) => {
      row[`article_${index}`] = null
    })
    rows.set(time, row)
    if (query.granularity === 'monthly') cursor.setUTCMonth(cursor.getUTCMonth() + 1)
    else cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  series.forEach((entry, index) => {
    entry.items.forEach((item) => {
      const time = parsePageviewDate(item.timestamp)
      const row = time === null ? undefined : rows.get(time)
      if (row) row[`article_${index}`] = item.views
    })
  })
  return Array.from(rows.values())
}
