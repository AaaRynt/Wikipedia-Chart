// src/components/layout/main.tsx

import { RotateCcwIcon } from 'lucide-react'
import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react'

import type { TPageviewsSnapshot, TQuery } from '@/data/types'

import { Loading } from '@/components/features'
import { Empty, WikiChart } from '@/components/main'
import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent } from '@/components/ui'
import { getArticleLabel } from '@/lib/article'

export function Main({ query, setQuery, snapshot, loading, onRetry, setChartNode }: { query: TQuery; setQuery: Dispatch<SetStateAction<TQuery>>; snapshot: TPageviewsSnapshot | null; loading: boolean; onRetry: () => void; setChartNode?: (node: HTMLDivElement | null) => void }) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const res = snapshot?.series ?? []
  const failed = res.filter((series) => series.status === 'error')
  const empty = res.filter((series) => series.status === 'empty')
  const hasData = res.some((series) => series.items.length > 0)

  useEffect(() => {
    setChartNode?.(cardRef.current)
  }, [setChartNode])

  return (
    <main className="flex-1 flex-col justify-center px-2 py-4 sm:px-8">
      <div ref={cardRef} className="w-full">
        <Card className="h-[65vh] min-h-80 w-full rounded-md">
          {loading ? (
            <CardContent className="flex h-full items-center justify-center">
              <Loading size="big" />
            </CardContent>
          ) : query.articles.length > 0 ? (
            <>
              {failed.length > 0 && (
                <CardContent className="max-h-36 shrink-0 overflow-y-auto">
                  <Alert variant="destructive">
                    <AlertTitle>Some pageviews could not be loaded</AlertTitle>
                    <AlertDescription className="break-words">{failed.map((series) => `${getArticleLabel(series.target)}: ${series.error}`).join('; ')}</AlertDescription>
                    <Button variant="outline" size="sm" className="mt-2 w-fit" onClick={onRetry}>
                      <RotateCcwIcon /> Retry
                    </Button>
                  </Alert>
                </CardContent>
              )}
              {(hasData || failed.length > 0) && empty.length > 0 && (
                <CardContent>
                  <p role="status" className="text-sm text-muted-foreground">
                    No pageview data: {empty.map((series) => getArticleLabel(series.target)).join(', ')}
                  </p>
                </CardContent>
              )}
              {(hasData || failed.length === 0) && <WikiChart res={res} query={query} />}
            </>
          ) : (
            <Empty query={query} setQuery={setQuery} />
          )}
        </Card>
      </div>
    </main>
  )
}
