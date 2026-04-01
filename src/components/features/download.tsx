// src/components/ui/download.tsx
import { Button } from '@/components/ui'
import { RiDownload2Line } from '@remixicon/react'

export function Download() {
  return (
    <Button className="cursor-pointer" size="icon" variant="outline">
      <RiDownload2Line />
    </Button>
  )
}
