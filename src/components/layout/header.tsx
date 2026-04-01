// src/components/layout/header.tsx
import { RiGithubFill } from '@remixicon/react'
import { Download, Search, ThemeToggle } from '@/components/features'
import { ButtonGroup } from '@/components/ui'

export function Header() {
  return (
    <header className="justify-between p-4">
      <a
        className="flex items-center gap-2 hover:underline"
        href="https://github.com/AaaRynt/Wikipedia-Chart"
        target="_blank"
      >
        <RiGithubFill />
        <div className="font-mono text-sm">Wikipedia Chart</div>
      </a>
      <Search />
      <ButtonGroup className="hidden sm:flex">
        <Download />
        <ThemeToggle />
      </ButtonGroup>
    </header>
  )
}
