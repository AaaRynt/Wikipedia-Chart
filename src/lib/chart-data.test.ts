// src/lib/chart-data.test.ts

import { describe, expect, it } from 'vitest'

import type { TArticleSeries, TRes } from '@/data/types'

import { buildChartData, parsePageviewDate } from '@/lib/chart-data'

function series(project: string, observations: [string, number][], granularity: TRes['granularity'] = 'daily'): TArticleSeries {
  return {
    target: { project, article: 'Japan' },
    status: observations.length ? 'success' : 'empty',
    items: observations.map(([timestamp, views]) => ({ project, article: 'Japan', timestamp, views, granularity, access: 'all-access', agent: 'user' })),
  }
}

describe('pageview date alignment', () => {
  it('leaves gaps when all editions miss the same date, preserving real zero views', () => {
    const data = buildChartData(
      [
        series('en.wikipedia', [
          ['2024010100', 2],
          ['2024010300', 0],
        ]),
        series('ja.wikipedia', [
          ['2024010300', 4],
          ['2024010100', 3],
        ]),
      ],
      { start: '20240101', end: '20240104', granularity: 'daily' },
    )
    expect(data).toEqual([
      { time: Date.UTC(2024, 0, 1), article_0: 2, article_1: 3 },
      { time: Date.UTC(2024, 0, 2), article_0: null, article_1: null },
      { time: Date.UTC(2024, 0, 3), article_0: 0, article_1: 4 },
      { time: Date.UTC(2024, 0, 4), article_0: null, article_1: null },
    ])
  })

  it('creates monthly buckets across leap years and the December boundary', () => {
    const data = buildChartData(
      [
        series(
          'en.wikipedia',
          [
            ['2023120100', 5],
            ['2024030100', 7],
          ],
          'monthly',
        ),
      ],
      { start: '20231220', end: '20240312', granularity: 'monthly' },
    )
    expect(data.map((row) => new Date(row.time).toISOString().slice(0, 10))).toEqual(['2023-12-01', '2024-01-01', '2024-02-01', '2024-03-01'])
    expect(data.map((row) => row.article_0)).toEqual([5, null, null, 7])
  })

  it('keeps uniform UTC daily spacing over daylight saving transitions', () => {
    const data = buildChartData([], { start: '20240309', end: '20240312', granularity: 'daily' })
    expect(data.slice(1).map((row, index) => row.time - data[index].time)).toEqual([86400000, 86400000, 86400000])
  })

  it('does not let out-of-range or invalid observations extend the query', () => {
    const data = buildChartData(
      [
        series('en.wikipedia', [
          ['2023123100', 1],
          ['2024010200', 2],
          ['2024023000', 3],
        ]),
      ],
      { start: '20240101', end: '20240101', granularity: 'daily' },
    )
    expect(data).toEqual([{ time: Date.UTC(2024, 0, 1), article_0: null }])
  })

  it('includes leap day and handles a single date', () => {
    const data = buildChartData([series('en.wikipedia', [['2024022900', 0]])], { start: '20240229', end: '20240229', granularity: 'daily' })
    expect(data).toEqual([{ time: Date.UTC(2024, 1, 29), article_0: 0 }])
  })

  it.each(['2023022900', '2024130100', '2024010123', 'invalid', '202401010000'])('rejects invalid date %s', (value) => {
    expect(parsePageviewDate(value)).toBeNull()
  })
})
