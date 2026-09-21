// src/components/features/comparison-controls.tsx

import { GitCompareArrowsIcon, LanguagesIcon } from 'lucide-react'
import { useId, useRef, type Dispatch, type SetStateAction } from 'react'

import type { TArticle, TComparisonMode, TQuery } from '@/data/types'

import { LanguageVersions, Search } from '@/components/features'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { getLanguageLabel, wikipediaLanguages } from '@/data/languages'
import { changeComparisonMode, changeSearchProject } from '@/lib/comparison'

export function ComparisonControls({ query, setQuery }: { query: TQuery; setQuery: Dispatch<SetStateAction<TQuery>> }) {
  const radioName = useId()
  const drafts = useRef<Partial<Record<TComparisonMode, TQuery>>>({})
  const articleDrafts = useRef(new Map<string, TArticle[]>())
  const modes = [
    { value: 'articles' as const, label: 'Articles', icon: GitCompareArrowsIcon },
    { value: 'languages' as const, label: 'Languages', icon: LanguagesIcon },
  ]

  return (
    <section aria-label="Comparison settings" className="flex-col items-stretch! gap-3 border-y border-border px-4 py-3 sm:px-8">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <fieldset className="flex shrink-0 rounded-md border border-input p-0.5">
          <legend className="sr-only">Comparison mode</legend>
          {modes.map(({ value, label, icon: Icon }) => (
            <label key={value} className="relative cursor-pointer">
              <input
                type="radio"
                name={radioName}
                value={value}
                checked={query.mode === value}
                className="peer sr-only"
                onChange={() => {
                  drafts.current[query.mode] = query
                  setQuery((prev) => changeComparisonMode(prev, value, drafts.current[value]))
                }}
              />
              <span className="flex h-8 items-center gap-2 rounded-sm px-3 text-sm text-muted-foreground peer-checked:bg-secondary peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                <Icon className="size-4" />
                {label}
              </span>
            </label>
          ))}
        </fieldset>
        <Select
          value={query.searchProject}
          onValueChange={(project) => {
            if (query.mode === 'articles') articleDrafts.current.set(query.searchProject, query.articles)
            setQuery((prev) => changeSearchProject(prev, project, articleDrafts.current.get(project)))
          }}
        >
          <SelectTrigger className="w-40 max-w-full" aria-label={query.mode === 'articles' ? 'Wikipedia language' : 'Search language'}>
            <SelectValue>{getLanguageLabel(query.searchProject)}</SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            {!wikipediaLanguages.some((language) => language.project === query.searchProject) && <SelectItem value={query.searchProject}>{getLanguageLabel(query.searchProject)}</SelectItem>}
            {wikipediaLanguages.map((language) => (
              <SelectItem key={language.project} value={language.project}>
                {language.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Search query={query} setQuery={setQuery} />
      </div>
      {query.mode === 'languages' && <LanguageVersions query={query} setQuery={setQuery} />}
    </section>
  )
}
