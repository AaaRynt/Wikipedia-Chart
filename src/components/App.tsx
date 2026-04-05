// src/components/App.tsx
import { useEffect, useState } from 'react'
import { defaultQuery } from '@/data/default-query'
import type { TQuery } from '@/data/types'
import { Footer, Header, Main } from './layout'

// 只忽略用户在URL末尾加的字段
// [TODO] 暂不处理用户缺失或修改非法URL字段，导致无法查询数据的问题：
// 返回默认查询，或者重定向到错误页面

export function App() {
  const [query, setQuery] = useState<TQuery>(() => {
    if (typeof window === 'undefined') return defaultQuery

    const parts = window.location.pathname.split('/').filter(Boolean),
      startIndex = parts.indexOf('Wikipedia-Chart') + 1,
      [project, access, agent, article, granularity, start, end] = parts.slice(startIndex, startIndex + 7)
    return {
      project: project || defaultQuery.project,
      article: article || defaultQuery.article,
      access: (access as TQuery['access']) || defaultQuery.access,
      agent: (agent as TQuery['agent']) || defaultQuery.agent,
      granularity: (granularity as TQuery['granularity']) || defaultQuery.granularity,
      start: start || defaultQuery.start,
      end: end || defaultQuery.end,
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const base = import.meta.env.BASE_URL ?? '/',
      normalizedBase = base.endsWith('/') ? base : `${base}/`,
      nextPath = `${normalizedBase}${query.project}/${query.access}/${query.agent}/${query.article}/${query.granularity}/${query.start}/${query.end}`
    window.history.replaceState(null, '', nextPath)
  }, [query])

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center *:flex *:w-full *:items-center">
      <Header />
      <Main query={query} />
      <Footer query={query} setQuery={setQuery} />
    </div>
  )
}
