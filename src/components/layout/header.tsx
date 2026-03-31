// src/components/layout/header.tsx
import { RiGithubFill } from '@remixicon/react'
import { ButtonGroup } from '../ui'
import { Download, KeySelect, ThemeToggle } from '../features'
import { keys } from '../../data/keys'

export function Header() {
  return (
    <header className="justify-between p-4">
      <a
        className="flex items-center gap-2 hover:underline"
        href="https://github.com/AaaRynt/Wikipedia-Chart"
        target="_blank"
      >
        <RiGithubFill />
        <div className="font-mono text-sm">Wikipedia-Chart</div>
      </a>
      <div className="flex gap-2">
        {keys.map((key) => (
          <KeySelect keys={key} align={key.align} />
        ))}
        <ButtonGroup className="hidden sm:flex">
          <Download />
          <ThemeToggle />
        </ButtonGroup>
      </div>
    </header>
  )
}
