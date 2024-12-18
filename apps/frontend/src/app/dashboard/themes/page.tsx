import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ThemeGrid } from '@/components/themes/theme-grid'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ThemesPage() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: themes, error } = await supabase
    .from('marketplace_items')
    .select('*')
    .eq('type', 'theme')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load themes. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Themes</h1>
          <p className="text-muted-foreground mt-2">
            Browse and install custom themes for your workspace
          </p>
        </div>
      </div>
      {themes && themes.length > 0 ? (
        <ThemeGrid themes={themes} />
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No themes found</h3>
          <p className="text-muted-foreground">
            Be the first to publish a theme in the marketplace!
          </p>
        </div>
      )}
    </div>
  )
}
