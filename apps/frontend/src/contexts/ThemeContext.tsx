'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Theme {
  id: string
  name: string
  variables: {
    colors: {
      [key: string]: string
    }
    typography: {
      [key: string]: string
    }
    spacing: {
      [key: string]: string
    }
    effects: {
      [key: string]: string
    }
  }
  metadata?: {
    author: string
    website: string
    license: string
    tags: string[]
  }
  enabled?: boolean
  customization?: {
    disabledVariables?: string[]
  }
}

interface ThemeContextType {
  currentTheme: Theme | null
  installTheme: (theme: Theme) => Promise<void>
  uninstallTheme: () => Promise<void>
  toggleTheme: (enabled: boolean) => Promise<void>
  toggleThemeVariable: (variableName: string, enabled: boolean) => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null)

  useEffect(() => {
    // Load theme from database on mount
    loadTheme()
  }, [])

  const loadTheme = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('theme')
        .eq('user_id', user.id)
        .single()

      if (preferences?.theme) {
        setCurrentTheme(preferences.theme)
        if (preferences.theme.enabled !== false) {
          applyTheme(preferences.theme)
        } else {
          removeThemeStyles()
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error)
    }
  }

  const applyTheme = (theme: Theme) => {
    console.log('Applying theme:', theme)
    const root = document.documentElement
    
    // Apply colors
    if (theme.variables?.colors) {
      console.log('Applying colors:', theme.variables.colors)
      Object.entries(theme.variables.colors).forEach(([key, value]) => {
        // Skip disabled variables
        if (theme.customization?.disabledVariables?.includes(`colors.${key}`)) {
          return;
        }
        console.log(`Setting --${key} to ${value}`)
        root.style.setProperty(`--${key}`, value)
      })
    }

    // Apply typography
    if (theme.variables?.typography) {
      console.log('Applying typography:', theme.variables.typography)
      Object.entries(theme.variables.typography).forEach(([key, value]) => {
        if (theme.customization?.disabledVariables?.includes(`typography.${key}`)) {
          return;
        }
        root.style.setProperty(`--${key}`, value)
      })
    }

    // Apply spacing
    if (theme.variables?.spacing) {
      console.log('Applying spacing:', theme.variables.spacing)
      Object.entries(theme.variables.spacing).forEach(([key, value]) => {
        if (theme.customization?.disabledVariables?.includes(`spacing.${key}`)) {
          return;
        }
        root.style.setProperty(`--spacing-${key}`, value)
      })
    }

    // Apply effects
    if (theme.variables?.effects) {
      console.log('Applying effects:', theme.variables.effects)
      Object.entries(theme.variables.effects).forEach(([key, value]) => {
        if (theme.customization?.disabledVariables?.includes(`effects.${key}`)) {
          return;
        }
        root.style.setProperty(`--${key}`, value)
      })
    }

    // Force dark mode since our theme is dark
    document.documentElement.classList.add('dark')

    // Check if CSS variables were set
    const styles = getComputedStyle(root)
    console.log('Applied CSS variables:', {
      background: styles.getPropertyValue('--background'),
      foreground: styles.getPropertyValue('--foreground'),
      primary: styles.getPropertyValue('--primary')
    })
  }

  const removeThemeStyles = () => {
    const root = document.documentElement
    
    // Remove dark mode
    root.classList.remove('dark')
    
    // Reset to default theme
    const defaultTheme = {
      variables: {
        colors: {
          background: "0 0% 100%",
          foreground: "240 10% 3.9%",
          card: "0 0% 100%",
          "card-foreground": "240 10% 3.9%",
          popover: "0 0% 100%",
          "popover-foreground": "240 10% 3.9%",
          primary: "240 5.9% 10%",
          "primary-foreground": "0 0% 98%",
          secondary: "240 4.8% 95.9%",
          "secondary-foreground": "240 5.9% 10%",
          muted: "240 4.8% 95.9%",
          "muted-foreground": "240 3.8% 46.1%",
          accent: "240 4.8% 95.9%",
          "accent-foreground": "240 5.9% 10%",
          destructive: "0 84.2% 60.2%",
          "destructive-foreground": "0 0% 98%",
          border: "240 5.9% 90%",
          input: "240 5.9% 90%",
          ring: "240 5.9% 10%"
        }
      }
    }
    
    // Apply default theme colors
    Object.entries(defaultTheme.variables.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
  }

  const toggleThemeVariable = async (variableName: string, enabled: boolean) => {
    try {
      if (!currentTheme) return

      const updatedTheme = { ...currentTheme }
      
      // Initialize customization if it doesn't exist
      if (!updatedTheme.customization) {
        updatedTheme.customization = { disabledVariables: [] }
      }
      if (!updatedTheme.customization.disabledVariables) {
        updatedTheme.customization.disabledVariables = []
      }

      // Update disabled variables list
      if (enabled) {
        updatedTheme.customization.disabledVariables = 
          updatedTheme.customization.disabledVariables.filter(v => v !== variableName)
      } else {
        if (!updatedTheme.customization.disabledVariables.includes(variableName)) {
          updatedTheme.customization.disabledVariables.push(variableName)
        }
      }

      // Update database
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          theme: updatedTheme,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Update state and reapply theme
      setCurrentTheme(updatedTheme)
      if (updatedTheme.enabled !== false) {
        applyTheme(updatedTheme)
      }
    } catch (error) {
      console.error('Failed to toggle theme variable:', error)
      throw error
    }
  }

  const toggleTheme = async (enabled: boolean) => {
    try {
      if (!currentTheme) return

      const updatedTheme = { ...currentTheme, enabled }
      
      // Update database
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          theme: updatedTheme,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Update state
      setCurrentTheme(updatedTheme)
      
      // Apply or remove theme
      if (enabled) {
        applyTheme(updatedTheme)
      } else {
        removeThemeStyles()
      }
    } catch (error) {
      console.error('Failed to toggle theme:', error)
      throw error
    }
  }

  const installTheme = async (theme: Theme) => {
    try {
      const themeWithEnabled = { ...theme, enabled: true }
      
      // Save to database
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          theme: themeWithEnabled,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Update state and apply theme
      setCurrentTheme(themeWithEnabled)
      applyTheme(themeWithEnabled)
    } catch (error) {
      console.error('Failed to install theme:', error)
      throw error
    }
  }

  const uninstallTheme = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Remove from database
      const { error } = await supabase
        .from('user_preferences')
        .update({ 
          theme: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      // Reset state and remove theme styles
      setCurrentTheme(null)
      removeThemeStyles()
    } catch (error) {
      console.error('Failed to uninstall theme:', error)
      throw error
    }
  }

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      installTheme, 
      uninstallTheme, 
      toggleTheme,
      toggleThemeVariable 
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
