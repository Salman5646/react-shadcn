"use client"
import { Navbarwithsearch } from "../comps/Navbarwithsearch"
import { useState, useEffect } from "react";
import { Footer } from "../comps/Footer"
import { Cards } from "../comps/Cards"
import { ListFilter, X, ArrowUpDown } from "lucide-react";
import { ProductSkeleton } from "@/comps/ProductSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom"
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, AccountButton } from "../comps/AppSidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { verifySession } from "@/lib/cookieUtils"
import * as cartService from "@/lib/cartService"
import * as wishlistService from "@/lib/wishlistService"
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

const HeroSlideshow = ({ products }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Minimum swipe distance (in pixels)
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            setCurrentIndex((prev) => (prev + 1) % products.length);
        } else if (isRightSwipe) {
            setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
        }
    };

    useEffect(() => {
        if (!products.length || isHovered) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % products.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [products, isHovered]);

    if (!products.length) return null;

    const currentProduct = products[currentIndex];

    return (
        <div
            className="group relative w-full h-[300px] md:h-[450px] lg:h-[500px] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-200/20 shadow-2xl transition-all duration-500 hover:shadow-black/20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Background Images with Fade */}
            {products.map((product, idx) => (
                <div
                    key={product._id}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                        currentIndex === idx ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    )}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
                    <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}

            {/* Content Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 lg:px-24">
                <div className="max-w-xl space-y-4 md:space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 px-3 py-1 uppercase tracking-widest text-[10px] md:text-xs">
                            Featured Product
                        </Badge>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-yellow-500 text-xs font-bold">{currentProduct.rating?.rate || 0}</span>
                        </div>
                    </div>

                    <h1 className="text-2xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-none drop-shadow-lg">
                        {currentProduct.product_name}
                    </h1>

                    <p className="text-xs md:text-lg text-zinc-300 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-md drop-shadow-md">
                        {currentProduct.product_description}
                    </p>

                    <div className="flex items-center gap-4 md:gap-8">
                        <div>
                            <p className="text-zinc-400 text-[10px] md:text-sm font-medium uppercase tracking-wider mb-0.5 md:mb-1">Starting from</p>
                            <p className="text-white text-xl md:text-4xl font-bold tracking-tighter italic">₹{currentProduct.price}</p>
                        </div>
                        <Link
                            to={`/product/${currentProduct._id}`}
                            className="bg-white text-black hover:bg-zinc-200 px-6 md:px-10 py-2.5 md:py-4 rounded-full font-bold text-xs md:text-base transition-all active:scale-95 shadow-xl hover:shadow-white/10"
                        >
                            Explore Now
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-6 left-8 md:left-16 z-30 flex items-center gap-4">
                <div className="flex gap-2">
                    {products.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={cn(
                                "h-1 transition-all duration-300 rounded-full",
                                currentIndex === idx ? "w-6 md:w-8 bg-white" : "w-2 md:w-3 bg-white/30 hover:bg-white/50"
                            )}
                        />
                    ))}
                </div>
            </div>

            <div className="absolute bottom-8 right-8 md:right-16 z-30 hidden md:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)}
                    className="p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all active:scale-90"
                >
                    <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % products.length)}
                    className="p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all active:scale-90"
                >
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>
        </div>
    );
};

const HeroSkeleton = () => (
    <div className="w-full h-[300px] md:h-[450px] lg:h-[500px] rounded-3xl overflow-hidden bg-zinc-900/5 dark:bg-zinc-800/20 border border-zinc-200/20 shadow-2xl relative">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 lg:px-24 space-y-4 md:space-y-6">
            <div className="flex gap-2">
                <Skeleton className="h-5 md:h-6 w-24 md:w-32 rounded-full" />
                <Skeleton className="h-5 md:h-6 w-12 md:w-16 rounded-full" />
            </div>
            <Skeleton className="h-10 md:h-16 lg:h-20 w-3/4 md:w-2/3 rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-3 md:h-4 w-full md:w-1/2 rounded-md" />
                <Skeleton className="h-3 md:h-4 w-5/6 md:w-1/3 rounded-md" />
            </div>
            <div className="flex items-center gap-6 md:gap-8">
                <Skeleton className="h-8 md:h-12 w-20 md:w-32 rounded-md" />
                <Skeleton className="h-10 md:h-14 w-32 md:w-48 rounded-full" />
            </div>
        </div>
        <div className="absolute bottom-6 left-8 md:left-16 z-30 flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-1 w-6 md:w-8 rounded-full" />
            ))}
        </div>
    </div>
);

export function Home() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark" || false
    );
    const [user, setUser] = useState(null);
    const [openAdd, setOpenAdd] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [priceSort, setPriceSort] = useState("none"); // "none" | "low" | "high"
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("All");
    const [formData, setFormData] = useState({
        product_name: "",
        product_description: "",
        price: "",
        category: "",
        product_image: "",
    });
    const [wishlistItems, setWishlistItems] = useState([]);

    // Extract unique categories from products
    const categories = ["All", ...new Set(orders.map(p => p.category).filter(Boolean))];

    const activeFilterCount = (selectedCategory !== "All" ? 1 : 0) + (priceSort !== "none" ? 1 : 0);

    // Derive product labels
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const getProductLabels = (product) => {
        const labels = [];
        if (product.createdAt && new Date(product.createdAt) > sevenDaysAgo) labels.push("New");
        if (product.rating?.rate >= 4) labels.push("Hot");
        if (product.price < 50) labels.push("Sale");
        return labels;
    };

    const productTabs = [
        { key: "All", label: "All" },
        { key: "New", label: "New Arrivals" },
        { key: "Hot", label: "Hot" },
        { key: "Sale", label: "On Sale" },
    ];

    const resetFilters = () => {
        setSelectedCategory("All");
        setPriceSort("none");
        setActiveTab("All");
    };

    useEffect(() => {
        const checkUser = () => {
            verifySession().then(verified => setUser(verified));
        };
        checkUser();
        window.addEventListener("storage", checkUser);
        window.addEventListener("userChange", checkUser);
        return () => {
            window.removeEventListener("storage", checkUser);
            window.removeEventListener("userChange", checkUser);
        }
    }, []);

    const addToCart = async (product) => {
        const items = await cartService.addToCart(product, user);
        setCartItems(items);
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
        const updateCart = async () => {
            const items = await cartService.getCart(user);
            setCartItems(items);
        };
        const updateWishlist = async () => {
            const items = await wishlistService.getWishlist(user);
            setWishlistItems(items);
        };

        updateCart();
        updateWishlist();

        const cartHandler = () => updateCart();
        const wishlistHandler = () => updateWishlist();

        window.addEventListener("cartUpdate", cartHandler);
        window.addEventListener("wishlistUpdate", wishlistHandler);
        window.addEventListener("storage", cartHandler);
        window.addEventListener("storage", wishlistHandler);
        return () => {
            window.removeEventListener("cartUpdate", cartHandler);
            window.removeEventListener("wishlistUpdate", wishlistHandler);
            window.removeEventListener("storage", cartHandler);
            window.removeEventListener("storage", wishlistHandler);
        };
    }, [user]);

    const handleToggleWishlist = async (product) => {
        const isInWishlist = wishlistItems.some(item => (item._id || item.productId) === product._id);
        const updated = await wishlistService.toggleWishlist(product, user, isInWishlist);
        if (updated) setWishlistItems(updated);
    };

    const toggleDarkMode = () => setDarkMode(!darkMode);
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
                setIsLoading(false);
            });
    }, []);

    const filteredOrders = (() => {
        let result = orders.filter(order =>
            order.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Category filter
        if (selectedCategory !== "All") {
            result = result.filter(order => order.category === selectedCategory);
        }

        // Price sort
        if (priceSort === "low") {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (priceSort === "high") {
            result = [...result].sort((a, b) => b.price - a.price);
        }

        // Tab filter
        if (activeTab !== "All") {
            result = result.filter(order => getProductLabels(order).includes(activeTab));
        }

        return result;
    })();

    const handleUpdateQuantity = async (product, delta) => {
        // Find current item in cart to compute new quantity
        const currentItem = cartItems.find(item => item.product_name === product.product_name);
        const currentQty = currentItem ? (currentItem.quantity || 1) : 0;
        const newQty = currentQty + delta;

        if (currentItem) {
            const items = await cartService.updateQuantity(currentItem, newQty, user);
            setCartItems(items);
        } else if (delta > 0) {
            const items = await cartService.addToCart(product, user);
            setCartItems(items);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Product added successfully");
                setOrders([...orders, data]);
                setOpenAdd(false);
                setFormData({
                    product_name: "",
                    product_description: "",
                    price: "",
                    category: "",
                    product_image: "",
                });
            } else {
                toast.error(data.message || "Failed to add product");
            }
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    const handleDeleteProduct = async (productId, productName) => {
        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success(`${productName} deleted successfully`);
                setOrders(orders.filter((p) => p._id !== productId));
            } else {
                toast.error("Failed to delete product");
            }
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset className={cn(
                "flex flex-col min-h-screen transition-colors duration-300",
                darkMode ? "dark bg-slate-900" : "bg-white"
            )}>
                <Navbarwithsearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    resultCount={filteredOrders.length}
                    toggleDarkMode={toggleDarkMode}
                    darkMode={darkMode}
                />

                <main className="flex-1 p-4 md:p-6 lg:p-8 relative">
                    {/* Hero Slideshow Section */}
                    {isLoading ? (
                        <div className="mb-8 md:mb-12">
                            <HeroSkeleton />
                        </div>
                    ) : orders.length > 0 && (
                        <div className="mb-8 md:mb-12">
                            <HeroSlideshow products={[...orders]
                                .sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0))
                                .slice(0, 5)}
                            />
                        </div>
                    )}

                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2 mb-6">
                        <TooltipProvider>
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-1">
                                {productTabs.map(tab => (
                                    <Tooltip key={tab.key}>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => setActiveTab(tab.key)}
                                                className={cn(
                                                    "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200",
                                                    activeTab === tab.key
                                                        ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                                )}
                                            >
                                                {tab.label}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="text-[10px] font-bold">
                                            <p>
                                                {tab.key === "All" && "Browse our entire curated collection"}
                                                {tab.key === "New" && "Discover fresh drops from the last 7 days"}
                                                {tab.key === "Hot" && "Trending items with elite 4+ star ratings"}
                                                {tab.key === "Sale" && "Exclusive deals on premium picks under ₹50"}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                        {/* Filter Button */}
                        <div className="pb-2 flex-shrink-0">
                            <button
                                onClick={() => setFilterOpen(!filterOpen)}
                                className="relative bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 rounded-full p-2 transition-all duration-200 cursor-pointer"
                            >
                                <ListFilter size={20} />
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center -mx-2 md:-mx-3">
                        {isLoading ? (
                            Array.from({ length: 12 }).map((_, index) => (
                                <div key={index} className="w-1/2 md:w-1/3 lg:w-1/4 px-2 md:px-3 mb-4 md:mb-6 flex justify-center">
                                    <ProductSkeleton />
                                </div>
                            ))
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map((product, index) => {
                                const cartItem = cartItems.find(item => item.product_name === product.product_name);

                                return (
                                    <div key={index} className="w-1/2 md:w-1/3 lg:w-1/4 px-2 md:px-3 mb-4 md:mb-6 flex justify-center">
                                        <Cards
                                            item={cartItem || product}
                                            behaviour={user?.role === "admin" ? "home" : (cartItem ? "quantity" : "home")}
                                            onIncrease={() => handleUpdateQuantity(product, 1)}
                                            onDecrease={() => handleUpdateQuantity(product, -1)}
                                            variant="default"
                                            isAdmin={user?.role === "admin"}
                                            onDelete={() => handleDeleteProduct(product._id, product.product_name)}
                                            onToggleWishlist={handleToggleWishlist}
                                            isWishlisted={wishlistItems.some(item => (item._id || item.productId) === product._id)}
                                        />
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full flex flex-col items-center justify-center py-20 text-center">
                                <div className="bg-muted/30 rounded-full p-6 mb-4">
                                    <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No products found</h3>

                            </div>
                        )}
                    </div>

                </main>


                {/* Filter Panel */}
                {filterOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
                            onClick={() => setFilterOpen(false)}
                        />
                        {/* Panel */}
                        <div className="fixed top-16 right-4 z-[70] w-72 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden animate-in slide-in-from-right-2 fade-in duration-200">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h3>
                                <div className="flex items-center gap-2">
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={resetFilters}
                                            className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setFilterOpen(false)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Category Section */}
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Category</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                                                selectedCategory === cat
                                                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Sort Section */}
                            <div className="px-4 py-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Sort by Price</p>
                                <div className="flex gap-1.5">
                                    {[
                                        { value: "none", label: "Default" },
                                        { value: "low", label: "Low → High" },
                                        { value: "high", label: "High → Low" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setPriceSort(opt.value)}
                                            className={cn(
                                                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                                                priceSort === opt.value
                                                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                            )}
                                        >
                                            {opt.value !== "none" && <ArrowUpDown size={10} />}
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Results count */}
                            <div className="px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 text-center">
                                <p className="text-xs text-gray-500 dark:text-zinc-400">
                                    Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredOrders.length}</span> product{filteredOrders.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </>
                )}
                <AccountButton />
                {/* Admin Add Product Button */}
                {user?.role === "admin" && (
                    <div className="fixed bottom-4 right-2 z-[90]">
                        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                            <DialogTrigger asChild>
                                <Button size="icon" className="h-8 w-8 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg">
                                    <Plus className="h-6 w-6" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent
                                className="sm:max-w-[425px] bg-white text-black border-gray-200 max-h-[90vh] overflow-y-auto"
                                onInteractOutside={(e) => e.preventDefault()}
                            >
                                <DialogHeader className="relative">
                                    <DialogTitle>Add New Product</DialogTitle>
                                    <DialogDescription className="text-gray-500">
                                        Fill in the details for the new product.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddProduct} className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Product Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.product_name}
                                            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                                            required
                                            className="border-gray-300"
                                            pattern="^[a-zA-Z0-9\s\-_]+$"
                                            title="Product name should only contain letters, numbers, spaces, hyphens, and underscores."
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="price">Price</Label>
                                        <Input
                                            id="price"
                                            type="text"
                                            inputMode="decimal"
                                            pattern="^\d+(\.\d{1,2})?$"
                                            title="Price must be a valid number (e.g., 10 or 10.99)"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            className="border-gray-300"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Input
                                            id="category"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            required
                                            className="border-gray-300"
                                            pattern="^[a-zA-Z\s]+$"
                                            title="Category should only contain letters and spaces."
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="image">Product Image</Label>
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <Label htmlFor="image" className="mb-2 block text-xs font-medium text-gray-500">Product Image</Label>
                                                <Input
                                                    id="image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setFormData(prev => ({ ...prev, product_image: reader.result }));
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    className="border-gray-300"
                                                />

                                                {formData.product_image && (
                                                    <div className="relative w-full h-32 rounded-md overflow-hidden border border-gray-200 mt-2">
                                                        <img
                                                            src={formData.product_image}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="desc">Description</Label>
                                        <Textarea id="desc" value={formData.product_description} onChange={(e) => setFormData({ ...formData, product_description: e.target.value })} required className="border-gray-300" rows={3} />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpenAdd(false)}>Cancel</Button>
                                        <Button type="submit">Save Product</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
                {(!user || user.role !== "admin") && (
                    <Link to="/cart" className="fixed bottom-4 right-2 z-40">
                        <div className="relative">
                            <ShoppingCart
                                size={40}
                                className="bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 rounded-full p-2 transition-all duration-200 shadow-none"
                            />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white border-2 border-white dark:border-slate-900">
                                    {cartItems.length}
                                </span>
                            )}
                        </div>
                    </Link>
                )}
                <Footer />
            </SidebarInset>
        </SidebarProvider>
    );
}