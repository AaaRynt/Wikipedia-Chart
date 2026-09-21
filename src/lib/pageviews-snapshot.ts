// src/lib/pageviews-snapshot.ts

import type { TPageviewsQuery, TPageviewsSnapshot, TQuery } from '@/data/types'

export function getPageviewsRequestKey(query: TPageviewsQuery) {
  // Search language and QIDs do not change the pageviews request.
  return JSON.stringify({
    articles: query.articles.map(({ project, article }) => ({ project, article })),
    access: query.access,
    agent: query.agent,
    granularity: query.granularity,
    start: query.start,
    end: query.end,
  } satisfies TPageviewsQuery)
}

export function createPageviewsExport(query: TQuery, snapshot: TPageviewsSnapshot) {
  if (getPageviewsRequestKey(query) !== snapshot.requestKey) throw new Error('The current query is still loading')
  return {
    version: 3,
    exportedAt: new Date().toISOString(),
    fetchedAt: snapshot.fetchedAt,
    query,
    articles: snapshot.series.map((series, index) => ({ ...series, target: query.articles[index] })),
  }
}
