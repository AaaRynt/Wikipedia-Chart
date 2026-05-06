// src/components/ui/download.tsx
import { toPng, toSvg } from 'html-to-image'
import { ChartSplineIcon, DownloadIcon, FileImageIcon, FileJsonIcon } from 'lucide-react'
import { useState } from 'react'
import { Button, HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui'
import type { TQuery } from '@/data/types'

function buildFilename(query: TQuery) {
  return `${query.group.join('_vs_')}_${query.start}-${query.end}`
}

function buildPageviewsUrl(query: TQuery, article: string) {
  const segments = [query.project, query.access, query.agent, article, query.granularity, query.start, query.end]
    .map(encodeURIComponent)
    .join('/')

  return 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/' + segments
}

async function downloadPng(node: HTMLElement, filename: string) {
  const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${filename}.png`
  a.click()
}

async function downloadSvg(node: HTMLElement, filename: string) {
  const dataUrl = await toSvg(node, { cacheBust: true })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${filename}.svg`
  a.click()
}

async function downloadJson(query: TQuery, filename: string) {
  const articles = await Promise.all(
    query.group.map(async (article) => {
      const url = buildPageviewsUrl(query, article)

      try {
        const res = await fetch(url)
        const data = (await res.json()) as unknown

        return {
          article,
          url,
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          data,
        }
      } catch (error) {
        return {
          article,
          url,
          ok: false,
          status: 0,
          statusText: 'Network Error',
          error: error instanceof Error ? error.message : String(error),
          data: null,
        }
      }
    }),
  )
  const payload = {
    exportedAt: new Date().toISOString(),
    query,
    articles,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }),
    objectUrl = URL.createObjectURL(blob),
    a = document.createElement('a')

  a.href = objectUrl
  a.download = `${filename}.json`
  a.click()
  URL.revokeObjectURL(objectUrl)
}

export function Download({
  query,
  chartReady,
  chartNode,
}: {
  query: TQuery
  chartReady: boolean
  chartNode: HTMLDivElement | null
}) {
  const [jsonLoading, setJsonLoading] = useState(false)
  const hasGroup = query.group.length > 0

  const handleSvg = async () => {
    if (!chartNode) return
    await downloadSvg(chartNode, buildFilename(query))
  }
  const handlePng = async () => {
    if (!chartNode) return
    await downloadPng(chartNode, buildFilename(query))
  }
  const handleJson = async () => {
    if (!hasGroup || jsonLoading) return
    setJsonLoading(true)
    try {
      await downloadJson(query, buildFilename(query))
    } finally {
      setJsonLoading(false)
    }
  }

  return (
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Button
          className="cursor-auto active:translate-y-0!"
          size="icon-lg"
          variant="outline"
          disabled={!hasGroup}
          aria-disabled={!hasGroup}
        >
          <DownloadIcon />
          <HoverCardContent className="flex w-auto gap-2 shadow-xl" side="bottom">
            <Button className="cursor-pointer" variant="secondary" disabled={!chartReady} onClick={handleSvg}>
              <ChartSplineIcon />
              <span className="font-mono">.svg</span>
            </Button>
            <Button className="cursor-pointer" variant="secondary" disabled={!chartReady} onClick={handlePng}>
              <FileImageIcon />
              <span className="font-mono">.png</span>
            </Button>
            <Button className="cursor-pointer" variant="secondary" disabled={jsonLoading} onClick={handleJson}>
              <FileJsonIcon />
              <span className="font-mono">.json</span>
            </Button>
          </HoverCardContent>
        </Button>
      </HoverCardTrigger>
    </HoverCard>
  )
}
