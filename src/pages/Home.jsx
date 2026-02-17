"use client"
import { Navbarwithsearch } from "../comps/Navbarwithsearch"
import { useState, useEffect } from "react";
import { Footer } from "../comps/Footer"
import { Cards } from "../comps/Cards"
import { ProductSkeleton } from "../comps/ProductSkeleton" // Import your new skeleton
import { useSearchParams } from "react-router-dom"
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, AccountButton } from "../comps/AppSidebar"
import { cn } from "@/lib/utils"
// ... your other imports
export function Home() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // 1. Add loading state
    const [searchParams] = useSearchParams();
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark" || false
    );
    const addToCart = (product) => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];

        // Check if item already exists based on name (or id if you have one)
        const existingItemIndex = savedCart.findIndex(item => item.product_name === product.product_name);

        if (existingItemIndex > -1) {
            // If it exists, increment quantity
            savedCart[existingItemIndex].quantity = (savedCart[existingItemIndex].quantity || 1) + 1;
        } else {
            // If new, add with quantity 1
            savedCart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(savedCart));
        window.dispatchEvent(new Event("cartUpdate"));
    };
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const updateCart = () => {
            const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
            setCartItems(savedCart);
        };

        updateCart();
        window.addEventListener("storage", updateCart);
        return () => window.removeEventListener("storage", updateCart);
    }, []);
    const toggleDarkMode = () => setDarkMode(!darkMode);
    // Initialize search term from URL safely
    const initialSearch = searchParams ? searchParams.get("q") : "";
    const [searchTerm, setSearchTerm] = useState(initialSearch || "");

    useEffect(() => {
        setIsLoading(true);
        fetch("/api/products")
            .then((res) => res.json())
            .then((data) => {
                setOrders(data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("API Error:", err);
                setIsLoading(false);
            });
    }, []);

    const filteredOrders = orders.filter(order =>
        order.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleUpdateQuantity = (product, delta) => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingIndex = savedCart.findIndex(item => item.product_name === product.product_name);

        if (existingIndex > -1) {
            const newQty = (savedCart[existingIndex].quantity || 1) + delta;
            if (newQty < 1) {
                savedCart.splice(existingIndex, 1);
            } else {
                savedCart[existingIndex].quantity = newQty;
            }
        } else if (delta > 0) {
            // New item being added for the first time
            savedCart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(savedCart));
        setCartItems(savedCart); // Update local state immediately
        window.dispatchEvent(new Event("cartUpdate"));
    };
    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset className={cn(
                "flex flex-col min-h-screen transition-colors duration-300",
                darkMode ? "dark bg-slate-900" : "bg-white"
            )}>
                {/* 3. Navbar inside Inset ensures it gets pushed too */}
                <Navbarwithsearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    resultCount={filteredOrders.length}
                    toggleDarkMode={toggleDarkMode}
                    darkMode={darkMode}
                />

                {/* 4. Main content area */}
                <main className="flex-1 p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {isLoading ? (
                            Array.from({ length: 12 }).map((_, index) => (
                                <ProductSkeleton key={index} />
                            ))
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map((product, index) => {
                                const cartItem = cartItems.find(item => item.product_name === product.product_name);

                                return (
                                    <Cards
                                        key={index}
                                        item={cartItem || product}
                                        behaviour={cartItem ? "quantity" : "home"}
                                        onIncrease={() => handleUpdateQuantity(product, 1)}
                                        onDecrease={() => handleUpdateQuantity(product, -1)}
                                        variant="default"
                                    />
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    No products found !
                                </p>
                            </div>
                        )}
                    </div>
                </main>

                {/* 5. Floating Buttons and Footer */}
                <AccountButton />
                <Link to="/cart" className="fixed bottom-4 right-2 z-40">
                    <div className="relative">
                        <ShoppingCart
                            size={40}
                            className="dark:bg-white dark:text-black bg-black text-white border-gray-200 rounded-full p-2 shadow-lg"
                        />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white border-2 border-white dark:border-slate-900">
                                {cartItems.length}
                            </span>
                        )}
                    </div>
                </Link>
                <Footer />
            </SidebarInset>
        </SidebarProvider>
    );
}