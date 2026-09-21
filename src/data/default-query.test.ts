// src/data/default-query.test.ts
import { afterEach, expect, it, vi } from 'vitest'

import { formatQueryUrl, parseQueryUrl } from '@/lib/query-url'

afterEach(() => {
  vi.useRealTimers()
  vi.resetModules()
})

it('keeps the default range valid when the end date is leap day', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2024, 2, 2, 12))
  const { defaultQuery } = await import('@/data/default-query')
  expect(defaultQuery.start).toBe('20230228')
  expect(defaultQuery.end).toBe('20240229')
  const restored = parseQueryUrl(new URL(formatQueryUrl(defaultQuery, '/'), 'https://example.com'), defaultQuery)
  expect(restored).toEqual(defaultQuery)
  expect(restored).not.toBe(defaultQuery)
})
