// src/components/ui/download.tsx
import { Button } from '../ui/index'
import { RiDownload2Line } from '@remixicon/react'

export function Download() {
  return (
    <Button className="shadow-none active:translate-y-0!" size="icon" variant="outline">
      <RiDownload2Line />
    </Button>
  )
}
