// src/components/ui/theme-toggle.tsx
import { RiMoonFill, RiSunFill } from '@remixicon/react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme(),
    Icon = theme === 'dark' ? RiSunFill : RiMoonFill

  return (
    <Button
      className="cursor-pointer active:translate-y-0!"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      size="icon-lg"
      variant="outline"
    >
      <Icon />
    </Button>
  )
}
