import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Cards } from "./Cards"
import { ChevronLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react";
export default function Cart() {
    const [cartItems, setCartItems] = useState([]);


    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartItems(savedCart);
    }, []);
    const removeItem = (indexToRemove) => {
        // 1. Get current items
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];

        // 2. Filter out the item at that specific index
        const updatedCart = savedCart.filter((_, index) => index !== indexToRemove);

        // 3. Update LocalStorage and local state
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);

        // 4. Dispatch the event so the Home page badge updates too!
        window.dispatchEvent(new Event("cartUpdate"));
    };
    return (
        <div className="container min-h-screen mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-black text-white">
            <div className="lg:col-span-full">
                <Link to="/" className="absolute top-4 left-4 md:top-8 md:left-8 text-white hover:text-gray-300 transition-colors">
                    <ChevronLeft className="h-6 w-6" />
                    <span className="sr-only">Back to Home</span>
                </Link>
                <h2 className="text-2xl text-center font-bold mb-4">Your Shopping Cart</h2>

                {/* 1. Use a grid or flex container to display the items */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {cartItems.length > 0 ? (
                        cartItems.map((product, index) => (
                            // 2. Pass the individual 'product' object, not the whole 'cartItems' array
                            <Cards
                                key={index}
                                item={product}
                                behaviour="cart"
                                variant="default"
                                onRemove={() => removeItem(index)}
                            />
                        ))
                    ) : (
                        <p className="text-center col-span-full py-10 text-gray-500">
                            Your cart is empty.
                        </p>
                    )}
                </div>
            </div>

            {/* Right side: Summary Card
            <Card className="h-fit">
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between font-bold">
                        <span>Total Items</span>
                        <span>{cartItems.length}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">Proceed to Checkout</Button>
                </CardFooter>
            </Card> */}
        </div>
    );
}