import * as React from "react"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
}

export function ThemeProvider({ children, defaultTheme = 'light', storageKey = 'vite-ui-theme' }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState(defaultTheme)

  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const ThemeContext = React.createContext<{
  theme: string
  setTheme: (theme: string) => void
}>({
  theme: 'light',
  setTheme: () => null,
})
