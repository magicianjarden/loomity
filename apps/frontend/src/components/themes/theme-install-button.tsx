'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Check } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { toast } from 'sonner'

interface Theme {
  id: string
  name: string
  content_url: string
}

interface ThemeInstallButtonProps {
  theme: Theme
}

export function ThemeInstallButton({ theme }: ThemeInstallButtonProps) {
  const [isInstalling, setIsInstalling] = useState(false)
  const { currentTheme, installTheme } = useTheme()
  const isInstalled = currentTheme?.id === theme.id

  const handleInstall = async () => {
    try {
      setIsInstalling(true)
      console.log('Fetching theme data from:', theme.content_url)
      const response = await fetch(theme.content_url)
      const themeData = await response.json()
      console.log('Theme data:', themeData)
      
      await installTheme({
        id: theme.id,
        name: theme.name,
        variables: themeData.variables,
        metadata: themeData.metadata
      })
      
      toast.success('Theme installed successfully')
    } catch (error) {
      console.error('Failed to install theme:', error)
      toast.error('Failed to install theme')
    } finally {
      setIsInstalling(false)
    }
  }

  if (isInstalled) {
    return (
      <Button variant="outline" disabled>
        <Check className="mr-2 h-4 w-4" />
        Installed
      </Button>
    )
  }

  return (
    <Button
      onClick={handleInstall}
      disabled={isInstalling}
    >
      <Download className="mr-2 h-4 w-4" />
      {isInstalling ? 'Installing...' : 'Install'}
    </Button>
  )
}
