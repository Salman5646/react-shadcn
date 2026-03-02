import { Button } from "@/components/ui/button"
import { Cards } from "../comps/Cards"
import { ChevronLeft, Heart } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, AccountButton } from "../comps/AppSidebar"
import { verifySession } from "@/lib/cookieUtils"
import * as wishlistService from "@/lib/wishlistService"

export default function Wishlist() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const verified = await verifySession();
            if (!verified) {
                navigate("/login");
            } else {
                setUser(verified);
            }
        };
        checkAuth();
    }, [navigate]);

    useEffect(() => {
        const loadWishlist = async () => {
            if (!user) return;
            const items = await wishlistService.getWishlist(user);
            setWishlistItems(items);
        };
        loadWishlist();

        const handler = () => loadWishlist();
        window.addEventListener("wishlistUpdate", handler);
        return () => window.removeEventListener("wishlistUpdate", handler);
    }, [user]);

    const handleToggleWishlist = async (product) => {
        const isInWishlist = wishlistItems.some(item => (item._id || item.productId) === product._id);
        const updated = await wishlistService.toggleWishlist(product, user, isInWishlist);
        if (updated) setWishlistItems(updated);
    };

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-white dark:bg-slate-900 text-black dark:text-white p-6 relative transition-colors duration-300">
                    <Link to="/" className="inline-flex items-center gap-2 mb-8 text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                        <span>Back to Shop</span>
                    </Link>

                    <div className="container mx-auto max-w-5xl">
                        <div className="flex flex-col items-center mb-12">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 mb-4 shadow-lg shadow-red-500/10">
                                <Heart className="h-8 w-8 fill-current" />
                            </div>
                            <h2 className="text-4xl font-black tracking-tight text-center italic uppercase">My <span className="text-red-500">Wishlist</span></h2>
                            <p className="text-gray-500 dark:text-zinc-400 mt-2 font-medium">Your curated collection of premium favorites</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-12">
                            {wishlistItems.length > 0 ? (
                                wishlistItems.map((product, index) => (
                                    <Cards
                                        key={product._id || index}
                                        item={product}
                                        behaviour="home"
                                        onToggleWishlist={() => handleToggleWishlist(product)}
                                        isWishlisted={true}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full p-20 text-center bg-gray-50 dark:bg-zinc-900/30 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-zinc-800">
                                    <Heart className="h-12 w-12 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
                                    <p className="text-gray-400 dark:text-zinc-500 max-w-xs mx-auto mb-8">Start saving your favorite items to see them here and get notified of deals.</p>
                                    <Link to="/">
                                        <Button className="rounded-xl px-8 py-6 font-bold shadow-lg shadow-primary/20">Explore Products</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <AccountButton />
            </SidebarInset>
        </SidebarProvider>
    );
}
