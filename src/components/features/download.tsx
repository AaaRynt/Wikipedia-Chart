// src/components/ui/download.tsx
import { Button } from '@/components/ui'
import { RiDownload2Line } from '@remixicon/react'

export function Download() {
  return (
    <Button className="cursor-pointer" size="icon-lg" variant="outline">
      <RiDownload2Line />
    </Button>
  )
}
