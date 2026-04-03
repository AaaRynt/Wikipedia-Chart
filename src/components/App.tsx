// src/components/App.tsx
import { useEffect, useState } from 'react'
import { Header, Main, Footer } from './layout'

const defaultQuery = {
  article: 'Russo-Ukrainian_war',
  access: 'all-access',
  agent: 'all-agents',
  granularity: 'daily',
  start: '20220101',
  end: '20230101',
}

function parseQueryFromPath(pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length >= 6) {
    const [access, agent, article, granularity, start, end] = parts.slice(-6)
    return { ...defaultQuery, access, agent, article, granularity, start, end }
  }
  return defaultQuery
}

export function App() {
  const [query, setQuery] = useState(() => {
    if (typeof window === 'undefined') return defaultQuery
    return parseQueryFromPath(window.location.pathname)
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const base = import.meta.env.BASE_URL ?? '/'
    const normalizedBase = base.endsWith('/') ? base : `${base}/`
    const nextPath = `${normalizedBase}${query.access}/${query.agent}/${query.article}/${query.granularity}/${query.start}/${query.end}`
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
