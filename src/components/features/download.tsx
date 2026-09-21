// src/components/features/download.tsx
import { toPng, toSvg } from 'html-to-image'
import { ChartSplineIcon, DownloadIcon, FileImageIcon, FileJsonIcon, TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'

import type { TQuery } from '@/data/types'

import { pageviewsApi } from '@/api/pageviews-api'
import { Button, HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui'

function buildFilename(query: TQuery) {
  const articles = query.articles.map((target) => `${target.project}-${target.article}`).join('_vs_')
  return `${articles}_${query.start}-${query.end}`.replace(/[\\/:*?"<>|]/g, '_')
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
  const articles = await pageviewsApi.getArticles(query)
  const payload = {
    version: 2,
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

export function Download({ query, chartReady, chartNode }: { query: TQuery; chartReady: boolean; chartNode: HTMLDivElement | null }) {
  const [pending, setPending] = useState<'svg' | 'png' | 'json' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hasGroup = query.articles.length > 0

  const handleDownload = async (kind: 'svg' | 'png' | 'json') => {
    if (!hasGroup || pending || (kind !== 'json' && !chartNode)) return
    setPending(kind)
    setError(null)
    try {
      const filename = buildFilename(query)
      if (kind === 'json') await downloadJson(query, filename)
      else if (kind === 'png') await downloadPng(chartNode!, filename)
      else await downloadSvg(chartNode!, filename)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Download failed')
    } finally {
      setPending(null)
    }
  }

  return (
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Button className="cursor-auto active:translate-y-0!" size="icon-lg" variant="outline" disabled={!hasGroup} aria-disabled={!hasGroup}>
          {error ? <TriangleAlertIcon aria-label={error} /> : <DownloadIcon />}
          <HoverCardContent className="flex w-auto max-w-sm flex-wrap gap-2 shadow-xl" side="bottom">
            <Button className="cursor-pointer" variant="secondary" disabled={!chartReady || pending !== null} onClick={() => handleDownload('svg')}>
              <ChartSplineIcon />
              <span className="font-mono">.svg</span>
            </Button>
            <Button className="cursor-pointer" variant="secondary" disabled={!chartReady || pending !== null} onClick={() => handleDownload('png')}>
              <FileImageIcon />
              <span className="font-mono">.png</span>
            </Button>
            <Button className="cursor-pointer" variant="secondary" disabled={pending !== null} onClick={() => handleDownload('json')}>
              <FileJsonIcon />
              <span className="font-mono">.json</span>
            </Button>
            {pending && (
              <p role="status" className="w-full text-xs text-muted-foreground">
                Exporting {pending.toUpperCase()}...
              </p>
            )}
            {error && (
              <p role="alert" className="w-full text-xs break-words text-destructive">
                {error}
              </p>
            )}
          </HoverCardContent>
        </Button>
      </HoverCardTrigger>
    </HoverCard>
  )
}
