// src/components/ui/download.tsx
import { toPng, toSvg } from 'html-to-image'
import { ChartSplineIcon, DownloadIcon, FileImageIcon } from 'lucide-react'
import { Button, HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui'
import type { TQuery } from '@/data/types'

function buildFilename(query: TQuery) {
  const title = query.article.replace(/\s+/g, '_')
  return `${title}_${query.start}-${query.end}`
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

export function Download({
  chartReady,
  chartNode,
  query,
}: {
  chartReady: boolean
  chartNode: HTMLDivElement | null
  query: TQuery
}) {
  const handleSvg = async () => {
    if (!chartNode) return
    await downloadSvg(chartNode, buildFilename(query))
  }
  const handlePng = async () => {
    if (!chartNode) return
    await downloadPng(chartNode, buildFilename(query))
  }

  return (
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Button
          className="cursor-help active:translate-y-0!"
          size="icon-lg"
          variant="outline"
          disabled={!chartReady}
          aria-disabled={!chartReady}
        >
          <DownloadIcon />
          <HoverCardContent className="flex w-auto gap-2 shadow-xl" side="bottom">
            <Button className="cursor-pointer" variant="secondary" onClick={handleSvg}>
              <ChartSplineIcon />
              <span className="font-mono">.svg</span>
            </Button>
            <Button className="cursor-pointer" variant="secondary" onClick={handlePng}>
              <FileImageIcon />
              <span className="font-mono">.png</span>
            </Button>
          </HoverCardContent>
        </Button>
      </HoverCardTrigger>
    </HoverCard>
  )
}
