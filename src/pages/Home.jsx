"use client"
import { Navbarwithsearch } from "../comps/Navbarwithsearch"
import { useState, useEffect } from "react";
import { Footer } from "../comps/Footer"
import { Cards } from "../comps/Cards"
import { removeBackground } from "@imgly/background-removal";
import { ProductSkeleton } from "@/comps/ProductSkeleton";
import { useSearchParams } from "react-router-dom"
import { ShoppingCart, Plus, Trash2, Loader2 } from "lucide-react";
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

export function Home() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark" || false
    );
    const [user, setUser] = useState(null);
    const [openAdd, setOpenAdd] = useState(false);
    const [formData, setFormData] = useState({
        product_name: "",
        product_description: "",
        price: "",
        category: "",
        product_image: "",
        product_image_transparent: "",
    });

    useEffect(() => {
        const checkUser = () => {
            const saved = JSON.parse(localStorage.getItem("user"));
            if (saved) setUser(saved);
            else setUser(null);
        };
        checkUser();
        window.addEventListener("storage", checkUser);
        window.addEventListener("userChange", checkUser);
        return () => {
            window.removeEventListener("storage", checkUser);
            window.removeEventListener("userChange", checkUser);
        }
    }, []);

    const addToCart = (product) => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItemIndex = savedCart.findIndex(item => item.product_name === product.product_name);

        if (existingItemIndex > -1) {
            savedCart[existingItemIndex].quantity = (savedCart[existingItemIndex].quantity || 1) + 1;
        } else {
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
    const [isProcessingBg, setIsProcessingBg] = useState(false);

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
            savedCart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(savedCart));
        setCartItems(savedCart);
        window.dispatchEvent(new Event("cartUpdate"));
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
                    product_image_transparent: "",
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
                                            behaviour={cartItem ? "quantity" : "home"}
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
                                <p className="text-muted-foreground max-w-sm">
                                    We couldn't find any products matching your search. Try different keywords or browse all items.
                                </p>
                            </div>
                        )}
                    </div>

                </main>

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
                                            {/* Standard Image & Auto-Generated Transparent Image */}
                                            <div>
                                                <Label htmlFor="image" className="mb-2 block text-xs font-medium text-gray-500">Product Image (Background will be auto-removed for description)</Label>
                                                <Input
                                                    id="image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            // 1. Set Standard Image Preview
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setFormData(prev => ({ ...prev, product_image: reader.result }));
                                                            };
                                                            reader.readAsDataURL(file);

                                                            // 2. Auto-Generate Transparent Image
                                                            setIsProcessingBg(true);
                                                            try {
                                                                // Configure for better reliability
                                                                const config = {
                                                                    publicPath: window.location.origin + "/imgly/", // Use local assets
                                                                    progress: (key, current, total) => {
                                                                        console.log(`Downloading ${key}: ${Math.round(current / total * 100)}%`);
                                                                    },
                                                                    debug: true, // Enable debug logs
                                                                    device: 'cpu' // Force CPU if GPU issues cause hangs
                                                                };

                                                                const blob = await removeBackground(file, config);
                                                                const transparentReader = new FileReader();
                                                                transparentReader.onloadend = () => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        product_image_transparent: transparentReader.result
                                                                    }));
                                                                    setIsProcessingBg(false);
                                                                };
                                                                transparentReader.readAsDataURL(blob);
                                                            } catch (error) {
                                                                console.error("Background removal failed:", error);
                                                                toast.error("Background Removal Failed", {
                                                                    description: "Could not auto-remove background. Please try another image or check your connection.",
                                                                });
                                                                setIsProcessingBg(false);
                                                            }
                                                        }
                                                    }}
                                                    className="border-gray-300"
                                                />

                                                <div className="grid grid-cols-2 gap-4 mt-2">
                                                    {/* Standard Preview */}
                                                    {formData.product_image && (
                                                        <div className="relative w-full h-32 rounded-md overflow-hidden border border-gray-200">
                                                            <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded">Original</div>
                                                            <img
                                                                src={formData.product_image}
                                                                alt="Original Preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Transparent Preview */}
                                                    {(formData.product_image || isProcessingBg) && (
                                                        <div className="relative w-full h-32 rounded-md overflow-hidden border border-gray-200 bg-checkerboard flex items-center justify-center">
                                                            <div className="absolute inset-0 bg-[url('https://t3.ftcdn.net/jpg/03/76/74/61/360_F_376746124_L3oq3g98i2bT4d31w2V8s887j4z76x60.jpg')] opacity-20 bg-repeat bg-center bg-contain"></div>
                                                            <div className="absolute top-1 left-1 bg-green-600/90 text-white text-[10px] px-1 rounded z-20">No Background</div>

                                                            {isProcessingBg ? (
                                                                <div className="z-20 flex flex-col items-center">
                                                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                                    <span className="text-xs text-muted-foreground mt-1">Processing...</span>
                                                                </div>
                                                            ) : formData.product_image_transparent ? (
                                                                <img
                                                                    src={formData.product_image_transparent}
                                                                    alt="Transparent Preview"
                                                                    className="relative z-10 w-full h-full object-contain"
                                                                />
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </div>
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
                                className="dark:bg-white dark:text-black bg-black text-white border-gray-200 rounded-full p-2 shadow-lg"
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