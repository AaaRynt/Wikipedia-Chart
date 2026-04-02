// src/components/App.tsx
import { Header, Main, Footer } from './layout'

export function App() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center *:flex *:w-full *:items-center">
      <Header />
      <Main />
      <Footer />
    </div>
  )
}
