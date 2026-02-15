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
export function Cards({ behaviour, item, onRemove, variant = "default", onIncrease, onDecrease }) {
    const isCart = behaviour === "cart";
    const showQuantity = behaviour === "cart" || behaviour === "quantity";

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

            <CardHeader className="p-1.5 md:p-6 space-y-1">
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
        <Card className="relative mx-auto w-full max-w-sm pt-0 my-2 flex flex-col overflow-hidden">

            {/* Now we always wrap with ProductDetails so it's clickable everywhere */}
            <ProductDetails item={item}>
                {Content}
            </ProductDetails>


            <CardFooter className="p-1.5 md:p-3 mt-auto flex flex-row items-center gap-1.5 md:gap-2">
                {showQuantity ? (
                    <div className="flex flex-row w-full items-center gap-1.5 md:gap-2">
                        {/* Integrated Quantity Pill */}
                        <div className="flex items-center justify-between w-full md:flex-1 h-8 md:h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 px-1">
                            <Button
                                variant="ghost" size="icon" className="h-6 w-6 md:h-8 md:w-8"
                                onClick={(e) => { e.stopPropagation(); onDecrease(); }}
                            > - </Button>

                            <span className="text-sm font-mono font-bold">
                                {item.quantity || 1}
                            </span>

                            <Button
                                variant="ghost" size="icon" className="h-6 w-6 md:h-8 md:w-8"
                                onClick={(e) => { e.stopPropagation(); onIncrease(); }}
                            > + </Button>
                        </div>

                        {/* Show Remove only on Cart page */}
                        {behaviour === "cart" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white bg-red-500 hover:text-red-500 h-8 md:h-10 text-xs shrink-0 px-2"
                                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                ) : (
                    <AlertDialog
                        title={item.product_name}
                        item={item}
                        trigger={<Button className="w-full bg-black text-white dark:bg-white dark:text-black font-bold">Add to Cart</Button>}
                    />
                )}
            </CardFooter>
        </Card>
    );
}