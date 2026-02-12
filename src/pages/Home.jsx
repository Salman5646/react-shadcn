"use client"
import { Navbarwithsearch } from "../comps/Navbarwithsearch"
import { useState, useEffect } from "react";
import { Footer } from "../comps/Footer"
import { Cards } from "../comps/Cards"
import { ProductSkeleton } from "../comps/ProductSkeleton" // Import your new skeleton
import { useSearchParams } from "react-router-dom"
import { ShoppingCart, CircleUser } from "lucide-react";
import { Link } from "react-router-dom";
// import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar"
import { SidebarProvider, useSidebar, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator, SidebarInset } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
// ... your other imports
export function Home() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // 1. Add loading state
    const [searchParams] = useSearchParams();
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark" || false
    );
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
        setIsLoading(true); // Ensure loading starts as true
        fetch("https://fakestoreapi.com/products")
            .then((res) => res.json())
            .then((data) => {
                const formattedData = data.map(item => ({
                    product_name: item.title,
                    product_description: item.description,
                    product_image: item.image,
                    category: item.category,
                    price: item.price,
                    rating: item.rating,
                }));
                setOrders(formattedData);
                setIsLoading(false); // 2. Turn off loading when data arrives
            })
            .catch((err) => {
                console.error("API Error:", err);
                setIsLoading(false);
            });
    }, []);

    const filteredOrders = orders.filter(order =>
        order.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SidebarProvider defaultOpen={false}>
            {/* 2. Add the actual Sidebar component here so it has something to show */}
            <Sidebar collapsible="icon">
                <SidebarHeader className="border-b border-sidebar-border pb-4">
                    <div className="flex items-center gap-3 px-2 pt-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold">
                            S
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm leading-none">Salman Shaikh</span>
                            <span className="text-xs text-muted-foreground">Premium Member</span>
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    {/* Main Navigation Group */}
                    <SidebarGroup>
                        <SidebarGroupLabel>Menu</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton isActive>
                                        <span className="flex items-center gap-2">🏠 Home</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton tooltip="Check your orders">
                                        <span className="flex items-center gap-2">📦 My Orders</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>
                                        <span className="flex items-center gap-2">❤️ Wishlist</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarSeparator />

                    {/* Categories Group - Matching your FakeStore API categories */}
                    <SidebarGroup>
                        <SidebarGroupLabel>Categories</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>✨ Electronics</SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>💎 Jewelry</SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>👕 Men's Clothing</SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>👗 Women's Clothing</SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarSeparator />

                    {/* Settings Group */}
                    <SidebarGroup>
                        <SidebarGroupLabel>Settings</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>⚙️ Account Settings</SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton className="text-red-500 hover:text-red-600">
                                        🚪 Logout
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="border-t border-sidebar-border p-4">
                    <div className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                        v1.0.4 - 2026 Build
                    </div>
                </SidebarFooter>
            </Sidebar>
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
                            filteredOrders.map((product, index) => (
                                <Cards
                                    key={index}
                                    item={product}
                                    variant="default"
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    No products found matching "{searchTerm}"
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
    function AccountButton() {
        const { toggleSidebar } = useSidebar(); // Access the toggle function

        return (
            <button onClick={toggleSidebar} className="fixed bottom-4 left-2 z-50">
                <CircleUser
                    size={40}
                    className="dark:bg-white dark:text-black bg-black text-white rounded-full p-2 border-gray-200"
                />
            </button>
        );
    }
}