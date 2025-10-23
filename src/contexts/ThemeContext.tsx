import { createContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../hooks/useAuth'

interface ThemeContextType {
  primaryColor: string
  setPrimaryColor: (color: string) => Promise<void>
  secondaryColor: string
  setSecondaryColor: (color: string) => Promise<void>
  loading: boolean
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [primaryColor, setPrimaryColorState] = useState('#3b82f6')
  const [secondaryColor, setSecondaryColorState] = useState('#10b981')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth() || { user: null }

  useEffect(() => {
    async function loadTheme() {
      if (user?.restaurantId) {
        setLoading(true)
        const { data, error } = await supabase
          .from('restaurants')
          .select('primary_color, secondary_color')
          .eq('id', user.restaurantId)
          .single()

        if (data && !error) {
          updateCssVariables(data.primary_color, data.secondary_color)
          setPrimaryColorState(data.primary_color)
          setSecondaryColorState(data.secondary_color)
        }
        setLoading(false)
      }
    }

    if (user?.restaurantId) {
      loadTheme()
    } else {
      setLoading(false)
    }
  }, [user?.restaurantId])

  const updateCssVariables = (primary: string, secondary: string) => {
    document.documentElement.style.setProperty('--color-primary', primary)
    document.documentElement.style.setProperty('--color-primary-light', adjustColor(primary, 20))
    document.documentElement.style.setProperty('--color-primary-dark', adjustColor(primary, -20))
    
    document.documentElement.style.setProperty('--color-secondary', secondary)
    document.documentElement.style.setProperty('--color-secondary-light', adjustColor(secondary, 20))
    document.documentElement.style.setProperty('--color-secondary-dark', adjustColor(secondary, -20))
  }

  // Helper function to lighten or darken a color
  const adjustColor = (color: string, amount: number): string => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => {
      const value = Math.min(255, Math.max(0, parseInt(color, 16) + amount))
      return value.toString(16).padStart(2, '0')
    })
  }

  const setPrimaryColor = async (color: string) => {
    if (!user?.restaurantId) return

    setPrimaryColorState(color)
    updateCssVariables(color, secondaryColor)
    
    await supabase
      .from('restaurants')
      .update({ primary_color: color })
      .eq('id', user.restaurantId)
  }

  const setSecondaryColor = async (color: string) => {
    if (!user?.restaurantId) return

    setSecondaryColorState(color)
    updateCssVariables(primaryColor, color)
    
    await supabase
      .from('restaurants')
      .update({ secondary_color: color })
      .eq('id', user.restaurantId)
  }

  return (
    <ThemeContext.Provider
      value={{
        primaryColor,
        setPrimaryColor,
        secondaryColor,
        setSecondaryColor,
        loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
