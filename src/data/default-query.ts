// src/data/default-query.ts
import { format, subDays, subYears } from 'date-fns'

import type { TQuery } from '@/data/types'

const end = subDays(new Date(), 2)

export const defaultQuery: TQuery = {
  mode: 'articles',
  source: null,
  searchProject: 'en.wikipedia',
  articles: [],
  access: 'all-access',
  agent: 'user',
  granularity: 'daily',
  start: format(subYears(end, 1), 'yyyyMMdd'),
  end: format(end, 'yyyyMMdd'),
}
