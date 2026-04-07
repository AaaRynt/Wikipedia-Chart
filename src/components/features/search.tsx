// src/components/features/search.tsx
// https://en.wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&prop=pageprops%7Cpageimages%7Cdescription&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=100&pilimit=5&gpssearch=open&gpsnamespace=0&gpslimit=10&origin=*
'use client'

import 'lucide-react'
import { SearchIcon, TextSearchIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useDebounce } from 'use-debounce'
import { Loading } from '@/components/features'
import {
  Button,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui'
import type { SearchResponse, TQuery } from '@/data/types'

export function Search({ setQuery }: { setQuery: Dispatch<SetStateAction<TQuery>> }) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword] = useDebounce(keyword, 200)
  const [loading, setLoading] = useState(false)
  const [pages, setPages] = useState<NonNullable<NonNullable<SearchResponse['query']>['pages']>[string][]>([])
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
  useEffect(() => {
    const nextKeyword = debouncedKeyword.trim()
    if (!nextKeyword) {
      setPages([])
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const run = async () => {
      setLoading(true)
      try {
        const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&prop=pageprops|pageimages|description&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=100&pilimit=5&gpssearch=${encodeURIComponent(nextKeyword)}&gpsnamespace=0&gpslimit=10&origin=*`
        const res = await fetch(url, { signal: controller.signal })
        const json = (await res.json()) as SearchResponse
        const raw = json.query?.pages ?? {}
        const list = Object.values(raw).sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
        setPages(list)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setPages([])
        }
      } finally {
        setLoading(false)
      }
    }

    run()
    return () => controller.abort()
  }, [debouncedKeyword])

  const results = useMemo(() => pages, [pages])
  const handleSelect = (title: string) => {
    const article = title.replace(/\s+/g, '_')
    setQuery((prev) => ({ ...prev, article }))
    setOpen(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="rounded-full px-6">
        <SearchIcon />
        <CommandShortcut>⌘K</CommandShortcut>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput placeholder="search..." value={keyword} onValueChange={setKeyword} />
          <CommandList>
            {loading ? (
              <CommandEmpty>
                <Loading size="small" />
              </CommandEmpty>
            ) : results.length === 0 ? (
              <CommandEmpty>No results found¯\_(ツ)_/¯</CommandEmpty>
            ) : (
              <CommandGroup heading="Results">
                {results.map((page) => (
                  <CommandItem
                    key={page.pageid}
                    value={page.title}
                    className="flex items-start gap-3"
                    onSelect={() => handleSelect(page.title)}
                  >
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
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
