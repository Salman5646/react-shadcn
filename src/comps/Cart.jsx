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

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    // Calculating total using reduce
    const total = cartItems.reduce((acc, item) => {

        return acc + (item.price * (item.quantity || 1));
    }, 0);

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartItems(savedCart);
    }, []);
    const clearCart = () => {
        localStorage.removeItem("cart");
        setCartItems([]);
    };
    const removeItem = (indexToRemove) => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const updatedCart = savedCart.filter((_, index) => index !== indexToRemove);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        // Syncing with Home page badge
        window.dispatchEvent(new Event("cartUpdate"));
    };
    const updateQuantity = (index, delta) => {
        const updatedCart = [...cartItems];
        const newQuantity = (updatedCart[index].quantity || 1) + delta;

        if (newQuantity < 1) {
            removeItem(index); // Remove if quantity goes below 1
        } else {
            updatedCart[index].quantity = newQuantity;
            setCartItems(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            window.dispatchEvent(new Event("cartUpdate"));
        }
    };
    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-black text-white p-6 relative">
                    {/* Navigation */}
                    <Link to="/" className="inline-flex items-center gap-2 mb-8 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                        <span>Continue Shopping</span>
                    </Link>
                    <Trash onClick={clearCart} className="absolute top-6 right-6 cursor-pointer hover:text-red-500 transition-colors" />
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
                                        // Pass these props to the Card
                                        onIncrease={() => updateQuantity(index, 1)}
                                        onDecrease={() => updateQuantity(index, -1)}
                                    />

                                ))
                            ) : (
                                <div className="col-span-full   p-16 text-center bg-zinc-900/30">
                                    <p className="text-zinc-500 text-lg">Your cart is currently empty.</p>
                                </div>
                            )}
                        </div>

                        {/* 2. Footer Summary Section */}
                        {cartItems.length > 0 && (
                            <div className="mt-auto border-t border-zinc-800 pt-8 pb-12">
                                <div className="max-w-2xl mx-auto bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
                                    <Table>

                                        <TableHeader className="bg-zinc-800/50">
                                            <TableRow className="border-zinc-800">
                                                <TableHead className="text-zinc-300">Description</TableHead>
                                                <TableHead className="text-zinc-300">Details</TableHead>
                                                <TableHead className="text-right text-zinc-300">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>  
                                        <TableBody>
                                            <TableRow className="border-zinc-800">
                                                <TableCell className="font-medium">Items Total</TableCell>
                                                <TableCell className="text-zinc-400">
                                                    {cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} Unit(s)
                                                </TableCell>
                                                <TableCell className="text-right font-mono">${total.toFixed(2)}</TableCell>
                                            </TableRow>
                                            <TableRow className="border-zinc-800">
                                                <TableCell className="font-medium">Shipping</TableCell>
                                                <TableCell className="text-zinc-400">Standard Delivery</TableCell>
                                                <TableCell className="text-right text-green-500 font-bold uppercase">Free</TableCell>
                                            </TableRow>
                                            <TableRow className="border-zinc-700 bg-zinc-800/20">
                                                <TableCell colSpan={2} className="text-lg font-bold">Total Payable</TableCell>
                                                <TableCell className="text-right text-lg font-bold font-mono text-white">
                                                    ${total.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    <div className="p-4 bg-zinc-900">
                                        <Button className="w-full bg-white text-black hover:bg-zinc-200 py-6 text-lg font-bold rounded-lg shadow-xl">
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