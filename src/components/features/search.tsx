// src/components/features/search.tsx
'use client'

import { SearchIcon, TextSearchIcon, XIcon } from 'lucide-react'
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

import type { TQuery, TSearchPage } from '@/data/types'

import { wikipediaApi } from '@/api/wikipedia-api'
import { Loading } from '@/components/features'
import { Badge, Button, Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut, ItemContent, ItemDescription, ItemMedia, ItemTitle, Kbd, KbdGroup } from '@/components/ui'
import { getArticleKey, getArticleLabel, normalizeArticleTitle } from '@/lib/article'

type TSearchResult = {
  project: string
  keyword: string
  pages: TSearchPage[]
  error: string | null
}

export function Search({ query, setQuery }: { query: TQuery; setQuery: Dispatch<SetStateAction<TQuery>> }) {
  const [open, setOpen] = useState(false),
    [keyword, setKeyword] = useState(''),
    [result, setResult] = useState<TSearchResult | null>(null),
    [debouncedKeyword] = useDebounce(keyword, 200)
  const currentResult = result?.project === query.searchProject && result.keyword === keyword.trim() ? result : null
  const pages = currentResult?.pages ?? []
  const error = currentResult?.error
  const loading = open && keyword.trim().length > 0 && (keyword !== debouncedKeyword || !currentResult)
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
    if (!open || !nextKeyword) return

    const controller = new AbortController()
    const run = async () => {
      try {
        const list = await wikipediaApi.search(query.searchProject, nextKeyword, controller.signal)
        if (!controller.signal.aborted) setResult({ project: query.searchProject, keyword: nextKeyword, pages: list, error: null })
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({ project: query.searchProject, keyword: nextKeyword, pages: [], error: error instanceof Error ? error.message : 'Search failed' })
        }
      }
    }

    run()
    return () => controller.abort()
  }, [debouncedKeyword, query.searchProject, open])

  const handleSelect = (page: TSearchPage) => {
    const target = { project: query.searchProject, article: normalizeArticleTitle(page.title), ...(page.pageprops?.wikibase_item ? { entityId: page.pageprops.wikibase_item } : {}) }
    setQuery((prev) => {
      if (prev.articles.some((article) => getArticleKey(article) === getArticleKey(target))) return prev
      return { ...prev, articles: [...prev.articles, target] }
    })
    setKeyword('')
    setResult(null)
    setOpen(false)
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <Button onClick={() => setOpen(true)} variant="outline" className="shrink-0 cursor-pointer rounded-full px-4 active:translate-y-0!" aria-label="Search Wikipedia">
        <SearchIcon />
        {query.articles.length === 0 && (
          <CommandShortcut>
            <KbdGroup>
              <Kbd>{typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl'}</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </CommandShortcut>
        )}
      </Button>
      {query.articles.length > 0 && (
        <div className="flex min-w-0 flex-wrap gap-1">
          {query.articles.map((target) => (
            <Current
              key={getArticleKey(target)}
              title={getArticleLabel(target)}
              onRemove={() => {
                setQuery((prev) => ({ ...prev, articles: prev.articles.filter((item) => getArticleKey(item) !== getArticleKey(target)) }))
              }}
            />
          ))}
        </div>
      )}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput placeholder="search..." value={keyword} onValueChange={setKeyword} />
          <CommandList>
            {loading ? (
              <CommandEmpty>
                <Loading size="small" />
              </CommandEmpty>
            ) : error ? (
              <CommandEmpty>
                <span role="alert">{error}</span>
              </CommandEmpty>
            ) : pages.length === 0 ? (
              <CommandEmpty>{keyword.trim() ? 'No results found' : `Search ${query.searchProject}`}</CommandEmpty>
            ) : (
              <CommandGroup heading="Results">
                {pages.map((page) => (
                  <CommandItem key={page.pageid} value={page.title} className="flex items-start gap-3" onSelect={() => handleSelect(page)}>
                    <ItemMedia variant={page.thumbnail?.source ? 'image' : 'icon'} className="flex size-10 items-center justify-center overflow-hidden rounded-sm">
                      {page.thumbnail?.source ? <img src={page.thumbnail.source} alt={page.title} className="h-full w-full object-cover" loading="lazy" /> : <TextSearchIcon />}
                    </ItemMedia>
                    <ItemContent className="flex flex-col gap-1">
                      <ItemTitle className="text-sm font-medium">{page.title}</ItemTitle>
                      <ItemDescription className="text-xs text-muted-foreground">{page.description ?? 'No description'}</ItemDescription>
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
    <Badge variant="secondary" className="min-h-7 max-w-full cursor-auto gap-1 pr-1 pl-2">
      <span className="min-w-0 truncate" title={title}>
        {title}
      </span>
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        aria-label={`Remove ${title}`}
        className="size-4 cursor-pointer rounded-sm p-2 text-muted-foreground hover:bg-ring! hover:text-secondary-foreground"
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
