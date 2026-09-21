// src/components/main/empty.tsx
import { ArrowUpRightIcon, GitCompareIcon, InfoIcon } from 'lucide-react'
import { type Dispatch, type SetStateAction, useMemo } from 'react'

import type { TQuery } from '@/data/types'

import { Alert, AlertDescription, AlertTitle, Badge, CardContent } from '@/components/ui'
import { groups } from '@/data/prompts'
import { normalizeArticleTitle } from '@/lib/article'
import { fisherYates } from '@/lib/fisher–yates'
import { formatKey } from '@/lib/format'

export function Empty({ query, setQuery }: { query: TQuery; setQuery: Dispatch<SetStateAction<TQuery>> }) {
  const entries = useMemo(() => fisherYates([...groups]).slice(0, 20), [])

  if (query.mode === 'languages' || query.searchProject !== 'en.wikipedia') {
    return (
      <CardContent className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <p role="status">{query.mode === 'languages' ? (query.source ? 'No languages selected' : 'No entity selected') : 'No articles selected'}</p>
      </CardContent>
    )
  }

  return (
    <CardContent className="flex min-h-0 flex-1 overflow-y-auto">
      <Alert className="m-auto w-full max-w-xl shrink-0 bg-secondary px-6 py-4 text-secondary-foreground shadow-xl">
        <InfoIcon className="mt-1" />
        <AlertTitle className="text-base">
          Compare article pageviews from&nbsp;
          <a href="https://www.wikipedia.org/" target="_blank" rel="noreferrer" className="text-lg font-semibold no-underline! hover:underline!">
            Wikipedia
          </a>
        </AlertTitle>
        <AlertDescription className="space-y-4">
          <p>Pick a group to load multiple lines, or use search to add articles one by one:</p>
          <div className="flex flex-wrap gap-2">
            {entries.map((entry) => (
              <Badge
                key={`${entry.title}-${entry.group.join('|')}`}
                variant="outline"
                className="h-auto min-h-7 cursor-pointer gap-2 bg-secondary px-3 py-1 transition hover:brightness-125"
                onClick={() => {
                  setQuery((prev) => ({ ...prev, mode: 'articles', source: null, searchProject: 'en.wikipedia', articles: entry.group.map((article) => ({ project: 'en.wikipedia', article: normalizeArticleTitle(article) })) }))
                }}
              >
                {entry.kind === 'preset-group' ? (
                  <>
                    <GitCompareIcon />
                    <span>{formatKey(entry.title!, false)}</span>
                    <span className="text-muted-foreground">({entry.group.length})</span>
                  </>
                ) : (
                  formatKey(entry.group[0], false)
                )}
                <ArrowUpRightIcon />
              </Badge>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    </CardContent>
  )
}
