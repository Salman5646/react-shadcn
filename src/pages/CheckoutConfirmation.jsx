import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, CreditCard, Loader2, Save, MapPin, Coins } from "lucide-react";
import { toast } from "sonner";
import { verifySession } from "@/lib/cookieUtils";
import { BackButton } from "../comps/BackButton";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, AccountButton } from "../comps/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { countryCityData } from "@/data/countryCities";
import * as cartService from "@/lib/cartService";

export default function CheckoutConfirmation() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [coins, setCoins] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        country: "India",
    });

    useEffect(() => {
        const initializeData = async () => {
            const verifiedUser = await verifySession();
            if (!verifiedUser) {
                toast.error("Please log in to checkout");
                navigate("/login");
                return;
            }
            setUser(verifiedUser);

            setForm({
                name: verifiedUser.name || "",
                phone: verifiedUser.phone || "",
                address: verifiedUser.address || "",
                city: verifiedUser.city || "",
                country: verifiedUser.country || "India",
            });

            // Load Cart
            const items = await cartService.getCart(verifiedUser);
            if (items.length === 0) {
                toast.error("Your cart is empty");
                navigate("/cart");
                return;
            }
            setCartItems(items);

            // Load Coins
            try {
                const res = await fetch("/api/coins", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setCoins(data.coins);
                }
            } catch (_) { }

            setLoading(false);
        };

        initializeData();
    }, [navigate]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === "country") {
            setForm({ ...form, country: value, city: "" });
        } else {
            setForm({ ...form, [id]: value });
        }
    };

    const total = cartItems.reduce((acc, item) => {
        return acc + (item.price * (item.quantity || 1));
    }, 0);

    const hasEnoughCoins = coins !== null && coins >= Math.round(total * 100) / 100;
    const cities = countryCityData[form.country] || [];

    const handleCheckout = async (e) => {
        e.preventDefault();

        // Basic Validation
        const nameRegex = /^[a-zA-Z\s]{2,}$/;
        const phoneRegex = /^\+?\d{10}$/;
        const addressRegex = /^[a-zA-Z0-9\s,.\-/#]{5,}$/;

        if (!nameRegex.test(form.name.trim())) return toast.error("Name must be at least 2 characters (letters only)");
        if (!phoneRegex.test(form.phone.replace(/[\s-]/g, ""))) return toast.error("Please enter a valid phone number (10 digits)");
        if (!addressRegex.test(form.address.trim())) return toast.error("Please enter a valid address (at least 5 characters)");
        if (!form.city) return toast.error("Please select your city");

        if (!hasEnoughCoins) {
            toast.error("You do not have enough coins to complete this purchase");
            return;
        }

        setCheckingOut(true);

        try {
            // Check Profile Update explicitly required during checkout sequence if they edited details
            await fetch("/api/update-profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ userId: user.id, ...form }),
            });

            const res = await fetch("/api/checkout", {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();

            if (res.ok) {
                setCartItems([]);
                setCoins(data.coins);
                toast.success(data.message, {
                    description: `Spent ${data.spent} coins. Remaining: ${data.coins} coins. Order will be shipped to: ${form.address}, ${form.city}`,
                });
                window.dispatchEvent(new Event("cartUpdate"));
                window.dispatchEvent(new Event("coinsUpdate"));
                window.dispatchEvent(new Event("userChange"));
                navigate("/orders");
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Checkout failed. Please try again.");
        } finally {
            setCheckingOut(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 transition-colors duration-300">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <BackButton to="/cart" label="Back to Cart" className="mb-2" />

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Checkout</h1>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Review your order details and confirm delivery address.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* Left Side: Form */}
                            <div className="md:col-span-7 space-y-6">
                                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                                    <Card className="border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                                    <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">Delivery Information</CardTitle>
                                                    <CardDescription>Confirm where to send your order</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="name" className="text-gray-700 dark:text-zinc-300">Full Name</Label>
                                                <Input id="name" value={form.name} onChange={handleChange} required className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="phone" className="text-gray-700 dark:text-zinc-300">Phone Number</Label>
                                                <Input id="phone" type="tel" value={form.phone} onChange={handleChange} required className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="address" className="text-gray-700 dark:text-zinc-300">Street Address</Label>
                                                <textarea id="address" value={form.address} onChange={handleChange} required rows={3} className="flex w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="country" className="text-gray-700 dark:text-zinc-300">Country</Label>
                                                    <select id="country" value={form.country} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                                        {Object.keys(countryCityData).map((c) => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="city" className="text-gray-700 dark:text-zinc-300">City</Label>
                                                    <select id="city" value={form.city} onChange={handleChange} required className="flex h-9 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                                        <option value="">Select City</option>
                                                        {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </form>
                            </div>

                            {/* Right Side: Order Summary */}
                            <div className="md:col-span-5 space-y-6">
                                <Card className="border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm sticky top-6">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg">Order Summary</CardTitle>
                                        <CardDescription>{cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} items in your cart</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
                                            {cartItems.map((item, index) => (
                                                <div key={index} className="flex gap-3 text-sm">
                                                    <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
                                                        <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.product_name}</p>
                                                        <p className="text-zinc-500 dark:text-zinc-400">Qty: {item.quantity || 1}</p>
                                                    </div>
                                                    <div className="text-right font-medium text-zinc-900 dark:text-zinc-100 flex items-start gap-1">
                                                        <Coins className="h-3.5 w-3.5 text-yellow-500 mt-0.5" /> {(item.price * (item.quantity || 1)).toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-500">Subtotal</span>
                                                <span className="font-mono">${total.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-500">Shipping</span>
                                                <span className="text-emerald-500 font-medium">Free</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg mt-2 font-medium">
                                                <span className="flex items-center gap-1.5"><Coins className="h-4 w-4 text-yellow-500" /> Your Coins</span>
                                                <span className={hasEnoughCoins ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                                                    {coins !== null ? coins.toFixed(2) : "—"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="font-bold text-lg">Total to Pay</span>
                                                <span className="font-bold text-xl font-mono flex items-center gap-1">
                                                    <Coins className="h-5 w-5 text-yellow-500" /> {total.toFixed(2)}
                                                </span>
                                            </div>

                                            <Button
                                                type="submit"
                                                form="checkout-form"
                                                disabled={checkingOut || !hasEnoughCoins}
                                                className={`w-full py-6 text-lg font-bold shadow-xl ${hasEnoughCoins
                                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"}`}
                                            >
                                                {checkingOut ? (
                                                    <span className="flex items-center gap-2">
                                                        <Loader2 className="h-5 w-5 animate-spin" /> Confirming...
                                                    </span>
                                                ) : !hasEnoughCoins ? (
                                                    `Need ${(total - coins).toFixed(2)} More Coins`
                                                ) : (
                                                    "Confirm & Pay"
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                    </div>
                </div>
                <AccountButton />
            </SidebarInset>
        </SidebarProvider>
    );
}
