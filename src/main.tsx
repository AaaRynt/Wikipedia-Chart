import { ThemeProvider } from 'next-themes'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './components/App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
