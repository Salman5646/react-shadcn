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
import {
    AlertDialog as UIAlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { verifySession } from "@/lib/cookieUtils"
import * as cartService from "@/lib/cartService"


// Change this line to explicitly pull out your custom props
export function Cards({ behaviour, item, onRemove, variant = "default", onIncrease, onDecrease, isAdmin, onDelete }) {
    const isCart = behaviour === "cart";
    const showQuantity = behaviour === "cart" || behaviour === "quantity";

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        const user = await verifySession();
        await cartService.addToCart(item, user);
        window.dispatchEvent(new Event("storage"));

        const currentTime = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        toast.success(`${item.product_name} added successfully`, {
            description: `Added on ${new Date().toLocaleDateString()} at ${currentTime}`,
            action: {
                label: "Close",
                onClick: () => { },
            },
        });
    };

    const Content = (
        <div className={cn(
            "h-full flex flex-col cursor-pointer",
        )}>
            {/* Image Container with Overflow Hidden for Zoom Effect */}
            <div className="relative aspect-square overflow-hidden bg-muted">
                {/* Overlay */}
                <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-1 right-1 md:top-2 md:right-2 z-20 flex flex-col items-end gap-1">
                    <Badge className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold shadow-sm backdrop-blur-md bg-white/90 text-black dark:bg-black/90 dark:text-white border-0 px-1.5 py-0.5" variant="secondary">
                        {item.category}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-2 md:p-4 space-y-1 md:space-y-2 flex-1">
                <div className="space-y-1">
                    <CardTitle className="text-sm md:text-base font-semibold line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                        {item.product_name}
                    </CardTitle>
                    <div className="overflow-hidden max-h-[2.5rem] md:max-h-[3rem]">
                        <CardDescription className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {item.product_description}
                        </CardDescription>
                    </div>
                </div>
                <CardContent className="p-0 pt-1 md:pt-2 mt-auto">
                    <p className="text-base md:text-lg font-bold text-primary">${item.price}</p>
                </CardContent>
            </CardHeader>
        </div>
    );

    return (
        <Card className="relative mx-auto w-full max-w-sm pt-0 my-2 flex flex-col overflow-hidden group transition-all duration-300 hover:shadow-xl border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">



            {/* Now we always wrap with Link so it's clickable everywhere */}
            <Link to={`/product/${item._id}`}>
                {Content}
            </Link>


            <CardFooter className="p-2 pt-0 md:p-4 md:pt-0 mt-auto">
                {showQuantity ? (
                    <div className="flex flex-row w-full items-center gap-1 md:gap-2">
                        {/* Integrated Quantity Pill */}
                        <div className="flex items-center justify-between flex-1 h-8 md:h-10 bg-muted/50 rounded-lg border border-border px-1">
                            <Button
                                variant="ghost" size="icon" className="h-6 w-6 md:h-8 md:w-8 hover:bg-background rounded-md"
                                onClick={(e) => { e.stopPropagation(); onDecrease(); }}
                            > - </Button>

                            <span className="text-xs md:text-sm font-semibold">
                                {item.quantity || 1}
                            </span>

                            <Button
                                variant="ghost" size="icon" className="h-6 w-6 md:h-8 md:w-8 hover:bg-background rounded-md"
                                onClick={(e) => { e.stopPropagation(); onIncrease(); }}
                            > + </Button>
                        </div>

                        {/* Show Remove only on Cart page */}
                        {behaviour === "cart" && (
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 md:h-10 md:w-10 shrink-0 rounded-lg shadow-sm"
                                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            >
                                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                        )}
                    </div>
                ) : isAdmin ? (
                    <UIAlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold shadow-sm h-8 md:h-10 text-xs md:text-sm rounded-lg">
                                <Trash2 className="mr-2 h-3 w-3 md:h-4 md:w-4" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the product
                                    <strong> {item.product_name}</strong>.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </UIAlertDialog>
                ) : (
                    <Button
                        onClick={handleAddToCart}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm h-8 md:h-10 text-xs md:text-sm rounded-lg transition-transform active:scale-95 duration-200"
                    >
                        Add to Cart
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}