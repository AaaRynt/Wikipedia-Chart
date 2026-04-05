// src/components/main/fault.tsx
import { useEffect, useState } from 'react'
import { Alert, AlertTitle, CardContent } from '@/components/ui'

export function Fault() {
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
      <Alert className="text-secondary-foreground bg-secondary w-40 rounded-xl py-4 pl-6 text-xl font-bold shadow-xl">
        <AlertTitle>LOADING {dots}</AlertTitle>
      </Alert>
    </CardContent>
  )
}
