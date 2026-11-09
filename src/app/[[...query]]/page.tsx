'use client'

import { ThemeProvider } from 'next-themes'
import dynamic from 'next/dynamic'

const App = dynamic(() => import('@/components/App').then((module) => module.App), { ssr: false })

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <App />
    </ThemeProvider>
  )
}
