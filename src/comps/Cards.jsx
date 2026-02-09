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
        <Card className="font-mono text-xs relative mx-auto w-full max-w-sm pt-0 my-2 flex flex-col h-full overflow-hidden">
            <div className="absolute inset-0 z-30 aspect-video bg-black/35 pointer-events-none" />
            <img
                src={props.img}
                alt="Product cover"
                className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
            />

            {/* Added flex-1 to CardHeader so it pushes the footer down */}
            <CardHeader className="flex-1">
                <div className="mb-2">
                    <Badge variant={props.variant}>{props.badge}</Badge>
                </div>
                <CardTitle className="line-clamp-1">{props.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                    {props.desc}
                </CardDescription>
            </CardHeader>

            {/* The footer will now always sit at the bottom */}
            <CardFooter className="pt-0">
                <AlertDialog title={props.title} trigger={<Button className="w-full">Add to Cart</Button>} />
            </CardFooter>
        </Card>
    )
}