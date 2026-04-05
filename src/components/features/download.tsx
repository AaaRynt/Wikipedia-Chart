// src/components/ui/download.tsx
import { RiDownload2Line } from '@remixicon/react'
import { Button } from '@/components/ui'

export function Download() {
  return (
    <Button className="cursor-pointer" size="icon-lg" variant="outline">
      <RiDownload2Line />
    </Button>
  )
}
