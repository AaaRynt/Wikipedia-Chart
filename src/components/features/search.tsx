// src/components/features/search.tsx
// https://en.wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&prop=pageprops%7Cpageimages%7Cdescription&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=100&pilimit=5&gpssearch=open&gpsnamespace=0&gpslimit=10&origin=*

'use client'

import 'lucide-react'
import { SearchIcon, TextSearchIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import search from '@/data/search.json'
import type { SearchResponse } from '@/data/types'

export function Search() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])
  const pages = useMemo(() => {
    const data = search as SearchResponse
    const raw = data.query?.pages ?? {}
    return Object.values(raw).sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
  }, [])

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="px-4">
        <SearchIcon />
        <span>Search</span>
        <CommandShortcut>⌘K</CommandShortcut>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="search..." />
          <CommandList>
            <CommandGroup heading="Results">
              <CommandEmpty>No results found¯\_(ツ)_/¯</CommandEmpty>
              {pages.map((page) => (
                <CommandItem key={page.pageid} className="flex items-start gap-3">
                  <ItemMedia
                    variant={page.thumbnail?.source ? 'image' : 'icon'}
                    className="flex size-10 items-center justify-center overflow-hidden rounded-sm"
                  >
                    {page.thumbnail?.source ? (
                      <img
                        src={page.thumbnail.source}
                        alt={page.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <TextSearchIcon />
                    )}
                  </ItemMedia>
                  <ItemContent className="flex flex-col gap-1">
                    <ItemTitle className="text-sm font-medium">{page.title}</ItemTitle>
                    <ItemDescription className="text-muted-foreground text-xs">
                      {page.description ?? 'No description'}
                    </ItemDescription>
                  </ItemContent>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
