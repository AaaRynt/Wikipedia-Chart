// src/components/features/language-versions.tsx

import { ExternalLinkIcon, RotateCcwIcon, XIcon } from 'lucide-react'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

import type { TArticle, TLanguageMapping, TQuery } from '@/data/types'

import { wikidataApi } from '@/api/wikidata-api'
import { Loading } from '@/components/features'
import { Button } from '@/components/ui'
import { getLanguageLabel, wikipediaLanguages } from '@/data/languages'
import { getArticleLabel } from '@/lib/article'
import { applyLanguageMapping, toggleLanguage } from '@/lib/comparison'

type TMappingResult = { request: TArticle; mapping?: TLanguageMapping; error?: string }

export function LanguageVersions({ query, setQuery }: { query: TQuery; setQuery: Dispatch<SetStateAction<TQuery>> }) {
  const [result, setResult] = useState<TMappingResult | null>(null)
  const source = query.source
  const current = result && (result.request === source || result.mapping?.source === source) ? result : null

  useEffect(() => {
    if (!source || current) return
    const controller = new AbortController()
    const run = async () => {
      try {
        const mapping = await wikidataApi.getLanguageVersions(source, controller.signal)
        if (controller.signal.aborted) return
        setResult({ request: source, mapping })
        setQuery((prev) => applyLanguageMapping(prev, source, mapping))
      } catch (error) {
        if (!controller.signal.aborted) setResult({ request: source, error: error instanceof Error ? error.message : 'Language lookup failed' })
      }
    }
    run()
    return () => controller.abort()
  }, [source, current, setQuery])

  if (!source) return null
  const mapping = current?.mapping
  const versions = new Map(mapping?.versions.map((target) => [target.project, target]) ?? [])
  const languages = wikipediaLanguages.some((language) => language.project === source.project) ? wikipediaLanguages : [{ project: source.project, label: getLanguageLabel(source.project) }, ...wikipediaLanguages]
  const unavailable = mapping?.unavailable

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
        <span className="font-medium break-words">{getArticleLabel(source)}</span>
        {source.entityId && (
          <a href={`https://www.wikidata.org/wiki/${source.entityId}`} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-muted-foreground hover:underline">
            {source.entityId}
            <ExternalLinkIcon className="size-3" />
          </a>
        )}
        <Button size="icon-xs" variant="ghost" title="Clear entity" aria-label="Clear entity" onClick={() => setQuery((prev) => ({ ...prev, source: null, articles: [] }))}>
          <XIcon />
        </Button>
      </div>
      <div className="min-h-64 sm:min-h-44 lg:min-h-20">
        {!current ? (
          <div role="status" aria-label="Loading language versions" className="flex h-9 items-center">
            <Loading size="small" />
          </div>
        ) : current.error ? (
          <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-destructive">
            <span className="break-words">{current.error}</span>
            <Button variant="outline" size="sm" onClick={() => setResult(null)}>
              <RotateCcwIcon />
              Retry
            </Button>
          </div>
        ) : (
          <>
            {unavailable && (
              <p role="status" className="text-sm text-muted-foreground">
                {unavailable === 'missing-page' ? 'This Wikipedia article is no longer available.' : unavailable === 'no-entity' ? 'No linked Wikidata entity. Other language versions are unavailable.' : 'The linked Wikidata entity is unavailable.'}
              </p>
            )}
            {!unavailable && mapping && mapping.versions.length <= 1 && (
              <p role="status" className="text-sm text-muted-foreground">
                No other supported language versions.
              </p>
            )}
            <fieldset className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-6">
              <legend className="sr-only">Language versions</legend>
              {languages.map((language) => {
                const target = versions.get(language.project)
                const checked = query.articles.some((article) => article.project === language.project)
                return (
                  <label key={language.project} className={`flex min-w-0 items-start gap-2 text-sm ${target ? 'cursor-pointer' : 'text-muted-foreground'}`}>
                    <input
                      type="checkbox"
                      className="mt-1 size-4 shrink-0 accent-primary"
                      checked={checked}
                      disabled={!target}
                      onChange={(event) => {
                        const checked = event.currentTarget.checked
                        if (target) setQuery((prev) => toggleLanguage(prev, target, checked))
                      }}
                    />
                    <span className="min-w-0">
                      <span className="block">{language.label}</span>
                      <span className="block truncate text-xs text-muted-foreground" title={target?.article.replaceAll('_', ' ')}>
                        {target ? target.article.replaceAll('_', ' ') : 'No article'}
                      </span>
                    </span>
                  </label>
                )
              })}
            </fieldset>
          </>
        )}
      </div>
    </div>
  )
}
