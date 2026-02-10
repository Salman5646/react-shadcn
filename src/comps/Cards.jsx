import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardDescription,
    CardFooter,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { AlertDialog } from "./AlertDialog"
import { ProductDetails } from "./ProductDetails"

export function Cards(props) {
    return (
        /* Added h-full, flex, and flex-col to make the card a vertical flex container */
        <Card className="relative mx-auto w-full max-w-sm pt-0 my-2 flex flex-col h-full overflow-hidden">
            <ProductDetails item={props.item}>
                <div className="h-full flex flex-col cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
                    <div className="absolute inset-0 z-30 aspect-video bg-black/35 pointer-events-none" />
                    <img
                        src={props.item.product_image}
                        alt="Product cover"
                        className="relative z-20 aspect-video w-full object-cover brightness-60 dark:brightness-40"
                    />

                    {/* Added flex-1 to CardHeader so it pushes the footer down */}
                    <CardHeader className="flex-1 p-1.5 md:p-6 space-y-1">
                        <div className="mb-2">
                            <Badge className="text-[10px] md:text-xs px-1 py-0.5" variant={props.variant}>{props.item.category}</Badge>
                        </div>
                        <CardTitle className="text-small md:text-base line-clamp-1 leading-tight">
                            {props.item.product_name}
                        </CardTitle>
                        <CardDescription className="hidden md:block text-xs md:text-small md:line-clamp-3 line-clamp-3">
                            {props.item.product_description}
                        </CardDescription>
                        <CardContent className="p-0 text-small md:text-base">
                            <p>${props.item.price}</p>
                        </CardContent>
                    </CardHeader>
                </div>
            </ProductDetails>

            {/* The footer will now always sit at the bottom */}
            <CardFooter className="p-1.5 md:p-4 md:pt-0 pt-0 mt-auto">
                <AlertDialog title={props.item.product_name} trigger={<Button className="w-full">Add to Cart</Button>} />
            </CardFooter>
        </Card>
    )
}