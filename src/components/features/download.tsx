// src/components/ui/download.tsx
import { DownloadIcon } from 'lucide-react'
import { Button } from '@/components/ui'

function downloadSvgAsPng(svg: SVGSVGElement, filename: string) {
  const cloned = svg.cloneNode(true) as SVGSVGElement
  cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const serializer = new XMLSerializer()
  const source = serializer.serializeToString(cloned)
  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  const image = new Image()
  image.onload = () => {
    const ratio = window.devicePixelRatio || 1
    const width = svg.clientWidth || Number(svg.getAttribute('width')) || 800
    const height = svg.clientHeight || Number(svg.getAttribute('height')) || 450
    const canvas = document.createElement('canvas')
    canvas.width = width * ratio
    canvas.height = height * ratio
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(ratio, ratio)
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(image, 0, 0, width, height)
      const pngUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = pngUrl
      a.download = filename
      a.click()
    }
    URL.revokeObjectURL(url)
  }
  image.src = url
}

export function Download({ chartReady, chartNode }: { chartReady: boolean; chartNode: HTMLDivElement | null }) {
  const handleClick = () => {
    if (!chartNode) return
    const svg = chartNode.querySelector('svg')
    if (!svg) return
    downloadSvgAsPng(svg, 'wikipedia-chart.png')
  }

  return (
    <Button
      className="cursor-pointer"
      size="icon-lg"
      variant="outline"
      onClick={handleClick}
      disabled={!chartReady}
      aria-disabled={!chartReady}
    >
      <DownloadIcon />
    </Button>
  )
}
