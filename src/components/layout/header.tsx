// src/components/layout/header.tsx
import { RiGithubFill } from '@remixicon/react'

import type { TQuery } from '@/data/types'

import { Ask, Download, ThemeToggle } from '@/components/features'
import { Button, ButtonGroup } from '@/components/ui'

export function Header({ query, chartReady, chartNode }: { query: TQuery; chartReady: boolean; chartNode: HTMLDivElement | null }) {
  return (
    <header className="flex-wrap justify-between gap-4 px-4 py-2">
      <a className="shrink-0 font-mono text-sm hover:underline" href={import.meta.env.BASE_URL} target="_self">
        Wikipedia Chart
      </a>

      <div className="flex max-w-full min-w-0 flex-wrap items-center gap-4">
        <ButtonGroup>
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
