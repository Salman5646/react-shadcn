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
import { cn } from "@/lib/utils"

// Change this line to explicitly pull out your custom props
export function Cards({ behaviour, item, onRemove, variant = "default" }) {
    const isCart = behaviour === "cart";

    const Content = (
        <div className={cn(
            "h-full flex flex-col transition-colors cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900/50",
        )}>
            {/* Overlay and Image */}
            <div className="absolute inset-0 z-30 aspect-video bg-black/35 pointer-events-none" />
            <img
                src={item.product_image}
                alt={item.product_name}
                className="relative z-20 aspect-video w-full object-cover brightness-60 dark:brightness-40"
            />

            <CardHeader className="flex-1 p-1.5 md:p-6 space-y-1">
                <div className="mb-2">
                    <Badge className="text-[10px] md:text-xs px-1 py-0.5" variant={variant}>
                        {item.category}
                    </Badge>
                </div>
                <CardTitle className="text-small md:text-base line-clamp-1 leading-tight">
                    {item.product_name}
                </CardTitle>
                <CardDescription className="text-xs md:text-small line-clamp-3">
                    {item.product_description}
                </CardDescription>
                <CardContent className="p-0 text-small md:text-base">
                    <p className="font-bold">${item.price}</p>
                </CardContent>
            </CardHeader>
        </div>
    );

    return (
        <Card className="relative mx-auto w-full max-w-sm pt-0 my-2 flex flex-col h-full overflow-hidden">

            {/* Now we always wrap with ProductDetails so it's clickable everywhere */}
            <ProductDetails item={item}>
                {Content}
            </ProductDetails>

            <CardFooter className="p-1.5 md:p-4 md:pt-0 pt-0 mt-auto">
                {isCart ? (
                    <Button
                        variant="destructive"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevents the modal from opening when clicking remove
                            onRemove();
                        }}
                        className="w-full"
                    >
                        Remove Item
                    </Button>
                ) : (
                    <AlertDialog
                        title={item.product_name}
                        item={item}
                        trigger={<Button className="w-full">Add to Cart</Button>}
                    />
                )}
            </CardFooter>
        </Card>
    );
}