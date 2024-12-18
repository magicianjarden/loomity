import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ThemeInstallButton } from './theme-install-button'
import { Badge } from '@/components/ui/badge'

interface Theme {
  id: string
  name: string
  description: string
  preview_images: string[]
  author_id: string
  content_url: string
  downloads: number
  rating: number
  tags: string[]
  version: string
}

interface ThemeGridProps {
  themes: Theme[]
}

export function ThemeGrid({ themes }: ThemeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {themes.map((theme) => (
        <Card key={theme.id} className="flex flex-col">
          <CardHeader className="relative aspect-video overflow-hidden">
            {theme.preview_images?.[0] ? (
              <Image
                src={theme.preview_images[0]}
                alt={theme.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No preview available</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{theme.name}</h3>
              <Badge variant="secondary">v{theme.version}</Badge>
            </div>
            <p className="text-muted-foreground text-sm mb-4">{theme.description}</p>
            <div className="flex flex-wrap gap-2">
              {theme.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div>{theme.downloads} downloads</div>
              <div>★ {theme.rating.toFixed(1)}</div>
            </div>
            <ThemeInstallButton theme={theme} />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
