import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export default function LoadingThemes() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex flex-col">
            <CardHeader>
              <Skeleton className="aspect-video w-full" />
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
