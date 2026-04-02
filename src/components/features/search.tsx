// src/components/features/search.tsx
import { useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

export function Search() {
  const [open, setOpen] = useState(false)
  return (
    <Command className="relative max-w-2xl flex-1 overflow-visible border">
      <CommandInput
        placeholder="Type a command or search..."
        onClick={() => setOpen((prev) => !prev)}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false)
          }
        }}
      />
      {open ? (
        <CommandList
          className="bg-popover absolute inset-x-0 top-full mt-2 rounded-xl border shadow-lg"
          onMouseDown={(event) => event.preventDefault()}
        >
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="History">
            <CommandItem>OpenAI</CommandItem>
            <CommandItem>Russo-Ukrainian_war</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Suggestions">
            <CommandItem>Trump</CommandItem>
            <CommandItem>Vibe_coding</CommandItem>
          </CommandGroup>
        </CommandList>
      ) : null}
    </Command>
  )
}
