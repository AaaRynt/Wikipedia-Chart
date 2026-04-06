// src/components/main/Loading.tsx
import { useEffect, useState } from 'react'
import { Alert, AlertTitle, CardContent } from '@/components/ui'
import { Spinner } from '@/components/ui/spinner'

export function Loading() {
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ''
        return prev + '.'
      })
    }, 250)

    return () => clearInterval(timer)
  }, [])
  return (
    <CardContent className="flex h-full items-center justify-center">
      <Alert className="text-card bg-card-foreground w-48 rounded-full shadow-xl">
        <AlertTitle className="flex items-center gap-1">
          <Spinner className="size-6" />
          <span className="text-2xl font-bold">LOADING{dots}</span>
        </AlertTitle>
      </Alert>
    </CardContent>
  )
}
