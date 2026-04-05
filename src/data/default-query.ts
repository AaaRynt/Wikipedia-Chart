// src/data/default-query.ts
import type { TQuery } from '@/data/types'

const date = new Date()
date.setDate(date.getDate() - 2)
const yyyy = date.getFullYear()
const MM = String(date.getMonth() + 1).padStart(2, '0')
const dd = String(date.getDate()).padStart(2, '0')

export const defaultQuery: TQuery = {
  project: 'en.wikipedia',
  article: 'Europa_(moon)',
  access: 'all-access',
  agent: 'user',
  granularity: 'daily',
  start: `${yyyy - 1}${MM}${dd}`,
  end: `${yyyy}${MM}${dd}`,
}
