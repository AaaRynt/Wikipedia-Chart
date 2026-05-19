// src/components/features/ask.tsx
import { RiOpenaiFill } from '@remixicon/react'
import { Button } from '@/components/ui'
import type { TQuery } from '@/data/types'
import { formatKey } from '@/lib/format'

export function Ask({ query }: { query: TQuery }) {
  function buildPrompt(query: TQuery) {
    function buildPageviewsUrl(query: TQuery, article: string) {
      const segments = [query.project, query.access, query.agent, article, query.granularity, query.start, query.end]
        .map(encodeURIComponent)
        .join('/')

      return 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/' + segments
    }

    const articles = query.group.map((article) => formatKey(article)).join(', '),
      links = query.group.map((article) => `- ${formatKey(article)}: ${buildPageviewsUrl(query, article)}`).join('\n')

    return `Analyze the Wikimedia pageviews chart:

  Articles: ${articles}
  Date range: ${query.start} to ${query.end}
  Project: ${query.project}
  Access: ${query.access}
  Agent: ${query.agent}
  Granularity: ${query.granularity}

  Data links:
  ${links}

  Please explain the trend, compare the articles, identify spikes or unusual changes, and give possible real-world reasons. Keep the analysis concise and useful for understanding the chart.`
  }
  const disabled = query.group.length === 0

  return (
    <Button
      asChild={!disabled}
      variant="outline"
      size="icon-lg"
      disabled={disabled}
      aria-disabled={disabled}
      className="active:translate-y-0!"
    >
      {disabled ? (
        <RiOpenaiFill />
      ) : (
        <a
          href={`https://chatgpt.com/?prompt=${encodeURIComponent(buildPrompt(query))}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Ask ChatGPT to analyze chart"
        >
          <RiOpenaiFill />
        </a>
      )}
    </Button>
  )
}
