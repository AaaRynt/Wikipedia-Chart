// src/components/ui/download.tsx
import { DownloadIcon } from 'lucide-react'
import { Button } from '@/components/ui'

export function Download() {
  return (
    <Button className="cursor-pointer" size="icon-lg" variant="outline">
      <DownloadIcon />
    </Button>
  )
}
