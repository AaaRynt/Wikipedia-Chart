// src/components/features/search.tsx
// https://en.wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&prop=pageprops%7Cpageimages%7Cdescription&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=100&pilimit=5&gpssearch=open&gpsnamespace=0&gpslimit=10&origin=*
'use client'

import 'lucide-react'
import { SearchIcon, TextSearchIcon, XIcon } from 'lucide-react'
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Loading } from '@/components/features'
import {
  Badge,
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
  Kbd,
  KbdGroup,
} from '@/components/ui'
import type { SearchResponse, TQuery } from '@/data/types'
import { formatKey } from '@/util/format'

export function Search({ query, setQuery }: { query: TQuery; setQuery: Dispatch<SetStateAction<TQuery>> }) {
  const [open, setOpen] = useState(false),
    [keyword, setKeyword] = useState(''),
    [loading, setLoading] = useState(false),
    [pages, setPages] = useState<NonNullable<NonNullable<SearchResponse['query']>['pages']>[string][]>([]),
    [debouncedKeyword] = useDebounce(keyword, 200)
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    setQuery((prev) => {
      if (prev.group.includes(article)) return prev
      return { ...prev, group: [...prev.group, article] }
    })
    setKeyword('')
    setOpen(false)
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Button onClick={() => setOpen(true)} variant="outline" className="cursor-pointer rounded-full px-4">
        <SearchIcon />
        {query.group.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {query.group.map((title) => (
              <Current
                key={title}
                title={title}
                onRemove={() => {
                  setQuery((prev) => ({ ...prev, group: prev.group.filter((item) => item !== title) }))
                }}
              />
            ))}
          </div>
        ) : (
          <CommandShortcut>
            <KbdGroup>
              <Kbd>{navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl'}</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </CommandShortcut>
        )}
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
    </div>
  )
}

const Current = ({ title, onRemove }: { title: string; onRemove: () => void }) => {
  return (
    <Badge variant="secondary" className="h-7 cursor-auto gap-1 pr-1 pl-2">
      {formatKey(title)}
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        aria-label={`Remove ${formatKey(title)}`}
        className="hover:bg-ring! text-muted-foreground hover:text-secondary-foreground size-4 cursor-pointer rounded-sm p-2"
        onClick={(event) => {
          event.stopPropagation()
          onRemove()
        }}
      >
        <XIcon />
      </Button>
    </Badge>
  )
}
