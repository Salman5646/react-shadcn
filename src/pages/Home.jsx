"use client"
import { Navbarwithsearch } from "../comps/Navbarwithsearch"
import { useState, useEffect } from "react";
import { Footer } from "../comps/Footer"
import { Cards } from "../comps/Cards"
import { ListFilter, X, ArrowUpDown } from "lucide-react";
import { ProductSkeleton } from "@/comps/ProductSkeleton";
import { useSearchParams } from "react-router-dom"
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
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

        updateCart();
        const handler = () => updateCart();
        window.addEventListener("cartUpdate", handler);
        window.addEventListener("storage", handler);
        return () => {
            window.removeEventListener("cartUpdate", handler);
            window.removeEventListener("storage", handler);
        };
    }, [user]);

    const toggleDarkMode = () => setDarkMode(!darkMode);
    const initialSearch = searchParams ? searchParams.get("q") : "";
    const [searchTerm, setSearchTerm] = useState(initialSearch || "");

    useEffect(() => {
        setIsLoading(true);
        fetch("/api/products")
            .then((res) => res.json())
            .then((data) => {
                // Shuffle products randomly
                for (let i = data.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [data[i], data[j]] = [data[j], data[i]];
                }
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
                                                {tab.key === "Sale" && "Exclusive deals on premium picks under $50"}
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