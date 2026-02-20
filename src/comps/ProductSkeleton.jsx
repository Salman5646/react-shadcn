import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardFooter, CardHeader, CardContent } from "@/components/ui/card"

export function ProductSkeleton() {
    return (
        <Card className="relative mx-auto w-full max-w-sm pt-0 my-2 flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
            {/* Image Area - Match Cards.jsx aspect-square */}
            <div className="relative aspect-square overflow-hidden bg-muted">
                <Skeleton className="h-full w-full rounded-none" />
                {/* Badge Position */}
                <div className="absolute top-1 right-1 md:top-2 md:right-2 z-20">
                    <Skeleton className="h-4 w-12 md:h-5 md:w-16 rounded-full" />
                </div>
            </div>

            <CardHeader className="p-2 md:p-4 space-y-1 md:space-y-2 flex-1">
                <div className="space-y-1">
                    {/* Title */}
                    <Skeleton className="h-4 md:h-6 w-3/4 rounded-md" />
                    {/* Description - 2 lines */}
                    <Skeleton className="h-3 md:h-4 w-full rounded-md" />
                    <Skeleton className="h-3 md:h-4 w-5/6 rounded-md" />
                </div>

                <CardContent className="p-0 pt-1 md:pt-2 mt-auto">
                    {/* Price */}
                    <Skeleton className="h-5 md:h-7 w-16 rounded-md" />
                </CardContent>
            </CardHeader>

            <CardFooter className="p-2 pt-0 md:p-4 md:pt-0 mt-auto">
                {/* Button */}
                <Skeleton className="h-8 md:h-10 w-full rounded-lg" />
            </CardFooter>
        </Card>
    )
}