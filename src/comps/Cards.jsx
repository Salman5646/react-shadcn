import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { AlertDialog } from "./AlertDialog"

export function Cards(props) {
    return (
        /* Added h-full, flex, and flex-col to make the card a vertical flex container */
        <Card className="font-mono relative mx-auto w-full max-w-sm pt-0 my-2 flex flex-col h-full overflow-hidden">
            <div className="absolute inset-0 z-30 aspect-video bg-black/35 pointer-events-none" />
            <img
                src={props.img}
                alt="Product cover"
                className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
            />

            {/* Added flex-1 to CardHeader so it pushes the footer down */}
            <CardHeader className="flex-1 p-1.5 md:p-6 space-y-1">
                <div className="mb-2">
                    <Badge className="text-[10px] md:text-xs px-1 py-0.5" variant={props.variant}>{props.badge}</Badge>
                </div>
                <CardTitle className="text-xs md:text-base line-clamp-1 leading-tight">
                    {props.title}
                </CardTitle>
                <CardDescription className="hidden md:block text-xs md:text-small md:line-clamp-3 line-clamp-3">
                    {props.desc}
                </CardDescription>
            </CardHeader>

            {/* The footer will now always sit at the bottom */}
            <CardFooter className="p-1.5 md:p-4 md:pt-0 pt-0">
                <AlertDialog title={props.title} trigger={<Button className="w-full">Add to Cart</Button>} />
            </CardFooter>
        </Card>
    )
}