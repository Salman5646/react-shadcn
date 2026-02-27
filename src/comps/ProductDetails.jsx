import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog"
import { Star, PackageCheck } from "lucide-react" // New Icons
import { verifySession } from "@/lib/cookieUtils"
import * as cartService from "@/lib/cartService"

const handleAddToCart = async (product) => {
    const user = await verifySession();
    const existingCart = await cartService.getCart(user);

    const isItemInCart = existingCart.find((item) => item.product_name === product.product_name);

    if (!isItemInCart) {
        await cartService.addToCart(product, user);
        window.dispatchEvent(new Event("storage"));
        alert(`${product.product_name} added to cart!`);
    } else {
        alert("Item is already in your cart.");
    }
};
export function ProductDetails({ item, children }) {
    // Note: FakeStoreAPI rating object looks like { rate: 3.9, count: 120 }
    const rating = item.rating?.rate || 0;
    const stockCount = item.rating?.count || 0;
    const handleAdd = () => {
        const cartItem = item;
        handleAddToCart(cartItem);
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="dark:bg-slate-900 dark:text-white text-black w-[95%] max-w-[500px] max-h-[90vh] overflow-y-auto rounded-lg border-gray-200 dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{item.product_name}</DialogTitle>
                    <DialogDescription className="sr-only">
                        Detailed view of {item.product_name}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    {/* Image Container */}
                    <div className="bg-white p-4 rounded-xl flex justify-center relative overflow-hidden group">
                        {/* Background Image (Standard) */}
                        <img
                            src={item.product_image}
                            alt={item.product_name}
                            className={"h-56 object-contain transition-opacity duration-300"}
                        />

                    </div>

                    {/* Stats Row: Category & Price */}
                    <div className="flex justify-between items-center">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full text-xs font-medium uppercase tracking-wider">
                            {item.category}
                        </span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ${item.price}
                        </span>
                    </div>

                    {/* Rating & Stock Row */}
                    <div className="flex items-center gap-6 border-y border-gray-100 dark:border-slate-800 py-3">
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        className={`${i < Math.round(rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300 dark:text-gray-600"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="font-semibold">{rating}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">({stockCount} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <PackageCheck size={18} />
                            <span className="text-sm font-medium">In Stock</span>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase">Description</h4>
                        <div className="max-h-[200px] overflow-y-auto pr-2">

                            <p className="text-sm leading-relaxed dark:text-gray-300">
                                {item.product_description}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-row gap-2 sm:justify-end">
                    <DialogClose asChild>
                        <Button variant="outline" className="flex-1 sm:flex-none">Close</Button>
                    </DialogClose>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}