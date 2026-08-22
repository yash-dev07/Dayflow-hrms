'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-sm backdrop-blur-md text-foreground flex items-center justify-center dark:bg-white/5 dark:hover:bg-white/10 bg-black/5 hover:bg-black/10 dark:border-white/10 border-black/10"
      title="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-500" />
      )}
    </button>
  )
}
