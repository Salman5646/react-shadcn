import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Cards } from "./Cards"
import { ChevronLeft, Trash } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, AccountButton } from "./AppSidebar"
import { verifySession } from "@/lib/cookieUtils"
import * as cartService from "@/lib/cartService"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [user, setUser] = useState(null);
    // Calculating total using reduce
    const total = cartItems.reduce((acc, item) => {

        return acc + (item.price * (item.quantity || 1));
    }, 0);

    const getProductLabels = (product) => {
        const labels = [];
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (product.createdAt && new Date(product.createdAt) > sevenDaysAgo) labels.push("New");
        if (product.rating?.rate >= 4) labels.push("Hot");
        if (product.price < 50) labels.push("Sale");
        return labels;
    };

    useEffect(() => {
        verifySession().then(verified => setUser(verified));
    }, []);

    useEffect(() => {
        const loadCart = async () => {
            const items = await cartService.getCart(user);
            setCartItems(items);
        };
        loadCart();

        const handler = () => loadCart();
        window.addEventListener("cartUpdate", handler);
        return () => window.removeEventListener("cartUpdate", handler);
    }, [user]);

    const clearCartHandler = async () => {
        await cartService.clearCart(user);
        setCartItems([]);
    };
    const removeItem = async (indexToRemove) => {
        const item = cartItems[indexToRemove];
        const items = await cartService.removeFromCart(item, indexToRemove, user);
        setCartItems(items);
    };
    const updateQuantity = async (index, delta) => {
        const item = cartItems[index];
        const newQuantity = (item.quantity || 1) + delta;

        if (newQuantity < 1) {
            removeItem(index);
        } else {
            const items = await cartService.updateQuantity(item, newQuantity, user);
            setCartItems(items);
        }
    };
    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-white dark:bg-slate-900 text-black dark:text-white p-6 relative transition-colors duration-300">
                    {/* Navigation */}
                    <Link to="/" className="inline-flex items-center gap-2 mb-8 text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                        <span>Continue Shopping</span>
                    </Link>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Trash className="absolute top-6 right-6 cursor-pointer hover:text-red-500 transition-colors" />
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border-zinc-200 dark:border-zinc-800">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Clear Cart?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                                    Are you sure you want to remove all items from your cart?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-zinc-200 dark:bg-zinc-800 border-none text-black dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={clearCartHandler} className="bg-red-600 hover:bg-red-700 text-white">
                                    Clear Cart
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <div className="container mx-auto max-w-5xl">
                        <h2 className="text-3xl font-bold mb-8 text-center">Your Shopping Cart</h2>

                        {/* 1. Product Grid Section */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-12">
                            {cartItems.length > 0 ? (
                                cartItems.map((product, index) => (
                                    <Cards
                                        key={index}
                                        item={product}
                                        behaviour="cart"
                                        onRemove={() => removeItem(index)}
                                        onIncrease={() => updateQuantity(index, 1)}
                                        onDecrease={() => updateQuantity(index, -1)}
                                    />

                                ))
                            ) : (
                                <div className="col-span-full   p-16 text-center bg-gray-100 dark:bg-zinc-900/30">
                                    <p className="text-gray-400 dark:text-zinc-500 text-lg">Your cart is currently empty.</p>
                                </div>
                            )}
                        </div>

                        {/* 2. Footer Summary Section */}
                        {cartItems.length > 0 && (
                            <div className="mt-auto border-t border-gray-200 dark:border-zinc-800 pt-8 pb-12">
                                <div className="max-w-2xl mx-auto bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
                                    <Table>

                                        <TableHeader className="bg-gray-100 dark:bg-zinc-800/50">
                                            <TableRow className="border-gray-200 dark:border-zinc-800">
                                                <TableHead className="text-gray-600 dark:text-zinc-300">Description</TableHead>
                                                <TableHead className="text-gray-600 dark:text-zinc-300">Details</TableHead>
                                                <TableHead className="text-right text-zinc-300">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow className="border-gray-200 dark:border-zinc-800">
                                                <TableCell className="font-medium">Items Total</TableCell>
                                                <TableCell className="text-gray-500 dark:text-zinc-400">
                                                    {cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} Unit(s)
                                                </TableCell>
                                                <TableCell className="text-right font-mono">${total.toFixed(2)}</TableCell>
                                            </TableRow>
                                            <TableRow className="border-gray-200 dark:border-zinc-800">
                                                <TableCell className="font-medium">Shipping</TableCell>
                                                <TableCell className="text-gray-500 dark:text-zinc-400">Standard Delivery</TableCell>
                                                <TableCell className="text-right text-green-500 font-bold uppercase">Free</TableCell>
                                            </TableRow>
                                            <TableRow className="border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800/20">
                                                <TableCell colSpan={2} className="text-lg font-bold">Total Payable</TableCell>
                                                <TableCell className="text-right text-black dark:text-white font-bold font-mono">
                                                    ${total.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    <div className="p-4 bg-gray-100 dark:bg-zinc-900">
                                        <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-zinc-200 py-6 text-lg font-bold rounded-lg shadow-xl">
                                            Proceed to Payment
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <AccountButton />
            </SidebarInset>
        </SidebarProvider>
    );
}