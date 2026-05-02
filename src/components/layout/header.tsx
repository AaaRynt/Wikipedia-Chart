// src/components/layout/header.tsx
import { RiGithubFill } from '@remixicon/react'
import type { Dispatch, SetStateAction } from 'react'
import { Ask, Download, Search, ThemeToggle } from '@/components/features'
import { Button, ButtonGroup } from '@/components/ui'
import type { TQuery } from '@/data/types'

export function Header({
  query,
  setQuery,
  chartReady,
  chartNode,
}: {
  query: TQuery
  setQuery: Dispatch<SetStateAction<TQuery>>
  chartReady: boolean
  chartNode: HTMLDivElement | null
}) {
  return (
    <header className="justify-between gap-8 px-4 py-2">
      <a className="font-mono text-sm hover:underline" href="/Wikipedia-Chart/" target="_self">
        Wikipedia Chart
      </a>

      <div className="flex items-center gap-4">
        <Search query={query} setQuery={setQuery} />
        <ButtonGroup className="hidden sm:flex">
          <Ask query={query} />
          <Download query={query} chartReady={chartReady} chartNode={chartNode} />
          <ThemeToggle />
        </ButtonGroup>
        <Button asChild variant="outline" size="icon-lg">
          <a href="https://github.com/AaaRynt/Wikipedia-Chart" target="_blank" rel="noreferrer">
            <RiGithubFill />
          </a>
        </Button>
      </div>
    </header>
  )
}
