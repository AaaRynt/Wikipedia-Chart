// src/components/layout/footer.tsx
import * as React from 'react'
import { format } from 'date-fns'
import { DatePickerWithRange, KeySelect } from '@/components/features'
import { keys } from '@/data/keys'

type Query = {
  article: string
  access: string
  agent: string
  granularity: string
  start: string
  end: string
}

function toDate(value: string) {
  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(4, 6)) - 1
  const day = Number(value.slice(6, 8))
  return new Date(year, month, day)
}

export function Footer({ query, setQuery }: { query: Query; setQuery: React.Dispatch<React.SetStateAction<Query>> }) {
  const rangeValue = React.useMemo(
    () => ({
      from: toDate(query.start),
      to: toDate(query.end),
    }),
    [query.start, query.end],
  )

  return (
    <footer className="justify-center gap-6 px-4 py-2">
      <DatePickerWithRange
        value={rangeValue}
        onChange={(range) => {
          if (!range?.from && !range?.to) return
          setQuery((prev) => ({
            ...prev,
            start: range?.from ? format(range.from, 'yyyyMMdd') : prev.start,
            end: range?.to ? format(range.to, 'yyyyMMdd') : prev.end,
          }))
        }}
      />
      <div className="flex gap-2">
        {keys.map((key) => (
          <KeySelect
            key={key.label}
            pKey={key}
            value={query[key.label as 'access' | 'agent' | 'granularity']}
            onValueChange={(value) => {
              setQuery((prev) => {
                const label = key.label as keyof Query
                return { ...prev, [label]: value }
              })
            }}
          />
        ))}
      </div>
    </footer>
  )
}
