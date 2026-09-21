// src/components/features/ask.tsx
import { RiOpenaiFill } from '@remixicon/react'

import type { TQuery } from '@/data/types'

import { pageviewsApi } from '@/api/pageviews-api'
import { Button } from '@/components/ui'
import { getArticleLabel } from '@/lib/article'

export function Ask({ query }: { query: TQuery }) {
  function buildPrompt(query: TQuery) {
    const articles = query.articles.map(getArticleLabel).join(', '),
      links = query.articles.map((target) => `- ${getArticleLabel(target)}: ${pageviewsApi.buildUrl(query, target)}`).join('\n')

    return `Analyze the Wikimedia pageviews chart:

  Articles: ${articles}
  Comparison: ${query.mode === 'languages' ? `Language editions of ${query.source ? getArticleLabel(query.source) : 'one entity'} (${query.source?.entityId ?? 'no linked entity'})` : 'Articles in one Wikipedia language'}
  Date range: ${query.start} to ${query.end}
  Access: ${query.access}
  Agent: ${query.agent}
  Granularity: ${query.granularity}

  Data links:
  ${links}

  Please explain the trend, compare the articles, identify spikes or unusual changes, and give possible real-world reasons. Language editions do not identify reader countries. Missing data is not zero views. Keep the analysis concise and useful for understanding the chart.`
  }
  const disabled = query.articles.length === 0

  return (
    <Button asChild={!disabled} variant="outline" size="icon-lg" disabled={disabled} aria-disabled={disabled} className="active:translate-y-0!">
      {disabled ? (
        <RiOpenaiFill />
      ) : (
        <a href={`https://chatgpt.com/?prompt=${encodeURIComponent(buildPrompt(query))}`} target="_blank" rel="noreferrer" aria-label="Ask ChatGPT to analyze chart">
          <RiOpenaiFill />
        </a>
      )}
    </Button>
  )
}
