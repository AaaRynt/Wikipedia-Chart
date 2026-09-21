// src/components/layout/header.tsx
import type { Dispatch, SetStateAction } from 'react'

import { RiGithubFill } from '@remixicon/react'

import type { TQuery } from '@/data/types'

import { Ask, Download, Search, ThemeToggle } from '@/components/features'
import { Button, ButtonGroup } from '@/components/ui'

export function Header({ query, setQuery, chartReady, chartNode }: { query: TQuery; setQuery: Dispatch<SetStateAction<TQuery>>; chartReady: boolean; chartNode: HTMLDivElement | null }) {
  return (
    <header className="flex-wrap justify-between gap-4 px-4 py-2">
      <a className="shrink-0 font-mono text-sm hover:underline" href="/" target="_self">
        Wikipedia Chart
      </a>

      <div className="flex max-w-full min-w-0 flex-wrap items-center gap-4">
        <Search query={query} setQuery={setQuery} />
        <ButtonGroup className="hidden sm:flex">
          <Ask query={query} />
          <Download query={query} chartReady={chartReady} chartNode={chartNode} />
          <ThemeToggle />
        </ButtonGroup>
        <Button asChild variant="outline" size="icon-lg" className="active:translate-y-0!">
          <a href="https://github.com/AaaRynt/Wikipedia-Chart" target="_blank" rel="noreferrer">
            <RiGithubFill />
          </a>
        </Button>
      </div>
    </header>
  )
}
