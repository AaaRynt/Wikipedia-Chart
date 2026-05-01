// src/components/main/empty.tsx
import { ArrowUpRightIcon, InfoIcon } from 'lucide-react'
import { type Dispatch, type SetStateAction, useMemo } from 'react'
import { Alert, AlertDescription, AlertTitle, Badge, CardContent } from '@/components/ui'
import { suggestions } from '@/data/prompts'
import type { TQuery } from '@/data/types'
import { fisherYates } from '@/util/fisher–yates'
import { formatKey } from '@/util/format'

export function Empty({ setQuery }: { setQuery: Dispatch<SetStateAction<TQuery>> }) {
  const entries = useMemo(() => fisherYates([...suggestions]).slice(0, 20), [])

  return (
    <CardContent className="flex h-full items-center justify-center">
      <Alert className="text-secondary-foreground bg-secondary w-full max-w-xl px-6 py-4 shadow-xl">
        <InfoIcon className="mt-1" />
        <AlertTitle className="text-base">
          Search an article from&nbsp;
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
          <p>Pick a suggestion to load its pageview chart:</p>
          <div className="flex flex-wrap gap-x-1 gap-y-2">
            {entries.map((prompt) => (
              <Badge
                key={prompt}
                variant="outline"
                className="bg-secondary h-7 cursor-pointer transition hover:brightness-125"
                onClick={() => {
                  setQuery((prev) => ({ ...prev, article: prompt }))
                }}
              >
                {formatKey(prompt)}
                <ArrowUpRightIcon />
              </Badge>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    </CardContent>
  )
}
