import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"

export function ProductSkeleton() {
    return (
        <Card className="flex flex-col h-full overflow-hidden bg-zinc-0">
            {/* Image Area */}
            <Skeleton className="aspect-video w-full rounded-none bg-zinc-800" />

            <CardHeader className="flex-1 space-y-3 p-4">
                {/* Badge */}
                <Skeleton className="h-4 w-12 bg-zinc-800" />
                {/* Title */}
                <Skeleton className="h-5 w-3/4 bg-zinc-800" />
                {/* Description Lines */}
                <div className="space-y-2">
                    <Skeleton className="h-3 w-full bg-zinc-800" />
                    <Skeleton className="h-3 w-full bg-zinc-800" />
                    <Skeleton className="h-3 w-5/6 bg-zinc-800" />
                </div>
                <Skeleton className="h-3 w-1/2 bg-zinc-800" />
            </CardHeader>

            <CardFooter className="p-4 pt-0">
                <Skeleton className="h-9 w-full bg-zinc-800" />
            </CardFooter>
        </Card>
    )
}