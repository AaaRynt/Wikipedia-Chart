// src/components/layout/header.tsx
import { RiGithubFill } from '@remixicon/react'
import { Download, Search, ThemeToggle } from '@/components/features'
import { Button, ButtonGroup } from '@/components/ui'

export function Header() {
  return (
    <header className="justify-between gap-8 px-4 py-2">
      <a className="font-mono text-sm hover:underline" href="/Wikipedia-Chart/" target="_self">
        Wikipedia Chart
      </a>
      <Search />
      <div className="flex gap-4">
        <ButtonGroup className="hidden sm:flex">
          <Download />
          <ThemeToggle />
        </ButtonGroup>
        <Button asChild variant="outline" size="icon-lg">
          <a href="https://github.com/AaaRynt/Wikipedia-Chart" target="_blank">
            <RiGithubFill />
          </a>
        </Button>
      </div>
    </header>
  )
}
