// src/components/main/Loading.tsx
import { useEffect, useState } from 'react'
import { Alert, AlertTitle, Badge, Spinner } from '@/components/ui'

export function Loading({ size = 'small' }: { size: 'small' | 'big' }) {
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
  switch (size) {
    case 'big':
      return (
        <Alert className="text-card bg-card-foreground w-48 rounded-full shadow-xl">
          <AlertTitle className="flex items-center gap-1 select-none">
            <Spinner className="size-6" />
            <span className="text-2xl font-bold">LOADING{dots}</span>
          </AlertTitle>
        </Alert>
      )
    case 'small':
      return (
        <Badge variant="secondary" className="select-none">
          <span>Loading</span>
          <Spinner data-icon="inline-end" />
        </Badge>
      )
  }
}
