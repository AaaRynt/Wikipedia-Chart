// src/components/main/empty.tsx
import { ArrowUpRightIcon, GitCompareIcon, InfoIcon } from 'lucide-react'
import { type Dispatch, type SetStateAction, useMemo } from 'react'
import { Alert, AlertDescription, AlertTitle, Badge, CardContent } from '@/components/ui'
import { groups } from '@/data/prompts'
import type { TQuery } from '@/data/types'
import { fisherYates } from '@/util/fisher–yates'
import { formatKey } from '@/util/format'

export function Empty({ setQuery }: { setQuery: Dispatch<SetStateAction<TQuery>> }) {
  const entries = useMemo(() => fisherYates([...groups]), [])

  return (
    <CardContent className="flex h-full items-center justify-center">
      <Alert className="text-secondary-foreground bg-secondary w-full max-w-xl px-6 py-4 shadow-xl">
        <InfoIcon className="mt-1" />
        <AlertTitle className="text-base">
          Compare article pageviews from&nbsp;
          <a
            href="https://www.wikipedia.org/"
            target="_blank"
            rel="noreferrer"
            className="text-lg font-semibold no-underline! hover:underline!"
          >
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
                className="bg-secondary h-auto min-h-7 cursor-pointer gap-2 px-3 py-1 transition hover:brightness-125"
                onClick={() => {
                  setQuery((prev) => ({ ...prev, group: entry.group }))
                }}
              >
                {entry.title ? (
                  <>
                    <GitCompareIcon />
                    <span>{formatKey(entry.title, false)}</span>
                    <span className="text-muted-foreground">({entry.group.length})</span>
                  </>
                ) : (
                  formatKey(entry.group[0])
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
