import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../comps/Navbar";
import { Footer } from "../comps/Footer";
import { Button } from "@/components/ui/button";
import { Star, StarHalf, ShoppingCart, ArrowLeft, Trash2, ShieldCheck, Truck, RefreshCw, MessageSquarePlus, Heart } from "lucide-react";
import * as cartService from "@/lib/cartService";
import * as wishlistService from "@/lib/wishlistService";
import { verifySession } from "@/lib/cookieUtils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ratingValue, setRatingValue] = useState(5);
    const [commentValue, setCommentValue] = useState("");
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);

    useEffect(() => {
        const loadUserAndCart = async () => {
            const verifiedUser = await verifySession();
            setUser(verifiedUser);
            const items = await cartService.getCart(verifiedUser);
            setCartItems(items);
            const wItems = await wishlistService.getWishlist(verifiedUser);
            setWishlistItems(wItems);
        };
        loadUserAndCart();

        const handleAuthChange = () => {
            verifySession().then(verified => setUser(verified));
        };
        const handleCartChange = async () => {
            const items = await cartService.getCart(user || await verifySession());
            setCartItems(items);
        };
        const handleWishlistChange = async () => {
            const items = await wishlistService.getWishlist(user || await verifySession());
            setWishlistItems(items);
        };

        window.addEventListener("storage", handleAuthChange);
        window.addEventListener("userChange", handleAuthChange);
        window.addEventListener("cartUpdate", handleCartChange);
        window.addEventListener("wishlistUpdate", handleWishlistChange);
        return () => {
            window.removeEventListener("storage", handleAuthChange);
            window.removeEventListener("userChange", handleAuthChange);
            window.removeEventListener("cartUpdate", handleCartChange);
            window.removeEventListener("wishlistUpdate", handleWishlistChange);
        };
    }, [user]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setProduct(data);
                } else {
                    toast.error(data.message || "Failed to load product");
                    navigate("/");
                }
            } catch (err) {
                toast.error("An error occurred");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id, navigate]);

    useEffect(() => {
        if (user && product?.reviews) {
            const userReview = product.reviews.find(
                (r) => r.userId?.toString() === user.id?.toString()
            );
            if (userReview) {
                setRatingValue(userReview.rating);
                setCommentValue(userReview.comment);
            } else {
                setRatingValue(5);
                setCommentValue("");
            }
        }
    }, [user, product?.reviews]);

    const handleAddToCart = async () => {
        if (!product) return;

        const verifiedUser = await verifySession();
        await cartService.addToCart(product, verifiedUser);

        // Trigger updates
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("cartUpdate"));

        const currentTime = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        toast.success(`${product.product_name} added successfully`, {
            description: `Added on ${new Date().toLocaleDateString()} at ${currentTime}`,
            action: {
                label: "Close",
                onClick: () => { },
            },
        });
    };

    const handleToggleWishlist = async () => {
        if (!product) return;
        const isInWishlist = wishlistItems.some(item => (item._id || item.productId) === product._id);
        const updated = await wishlistService.toggleWishlist(product, user, isInWishlist);
        if (updated) setWishlistItems(updated);
    };

    const handleUpdateQuantity = async (delta) => {
        const cartItem = cartItems.find(item => (item.productId || item._id) === product._id);
        if (!cartItem) return;

        const newQuantity = (cartItem.quantity || 1) + delta;
        const verifiedUser = await verifySession();

        if (newQuantity < 1) {
            // Find index for removeFromCart (though removeFromCart in cartService uses product._id if available)
            const index = cartItems.findIndex(item => (item.productId || item._id) === product._id);
            await cartService.removeFromCart(product, index, verifiedUser);
            toast.info(`${product.product_name} removed from cart`);
        } else {
            await cartService.updateQuantity(product, newQuantity, verifiedUser);
        }
        window.dispatchEvent(new Event("cartUpdate"));
        window.dispatchEvent(new Event("storage"));
    };

    const getProductLabels = (product) => {
        if (!product) return [];
        const labels = [];
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (product.createdAt && new Date(product.createdAt) > sevenDaysAgo) labels.push("New");
        if (product.rating?.rate >= 4) labels.push("Hot");
        if (product.price < 50) labels.push("Sale");
        return labels;
    };


    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) return toast.error("Please login to leave a review");

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/products/${id}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating: ratingValue, comment: commentValue }),
            });
            const data = await res.json();
            if (res.ok) {
                setProduct(data.product);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!confirm("Are you sure you want to delete your review?")) return;

        try {
            const res = await fetch(`/api/products/${id}/reviews`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
                setProduct(data.product);
                setCommentValue("");
                setRatingValue(5);
                toast.success("Review deleted successfully");
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Failed to delete review");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Loading amazing things...</p>
            </div>
        </div>
    );

    if (!product) return null;

    const rating = product.rating?.rate || 0;
    const stockCount = product.rating?.count || 0;
    const reviews = product.reviews || [];

    const userReview = user && reviews.find(r => r.userId?.toString() === user.id?.toString());

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-blue-100 dark:selection:bg-blue-900/40">
            <Navbar />

            <main className="container mx-auto px-4 md:px-8 pt-12 pb-20">
                {/* Navigation Header */}
                <div className="flex items-center gap-4 mb-10 overflow-hidden">
                    <Button
                        variant="ghost"
                        className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Shop
                    </Button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                    <div className="text-sm text-slate-400 font-medium truncate">
                        Home / {product.category} / <span className="text-slate-600 dark:text-slate-200">{product.product_name}</span>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-stretch">
                    {/* Left: Product Showcase */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative aspect-square md:aspect-[4/3] rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-12 md:p-20 group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <img
                                src={product.product_image}
                                alt={product.product_name}
                                className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                        </div>
                    </div>

                    {/* Right: Interaction Panel */}
                    <div className="lg:col-span-5 flex flex-col pt-4">
                        <div className="space-y-8">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-blue-200 dark:ring-blue-800/50">
                                    {product.category}
                                </span>
                                {stockCount > 100 && (
                                    <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-orange-200 dark:ring-orange-800/50 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span> Best Seller
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-tight text-slate-900 dark:text-white">
                                {product.product_name}
                            </h1>

                            <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/50">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn(
                                                "w-4 h-4",
                                                i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" :
                                                    i < rating ? "fill-yellow-400 text-yellow-400 opacity-50" : "text-slate-300 dark:text-slate-700"
                                            )} />
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-200 ml-1">{rating}</span>
                                </div>
                                <div className="text-sm font-medium text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-6">
                                    <span className="text-slate-900 dark:text-slate-200">{stockCount}</span> Customer Ratings
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-end gap-3">
                                <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">${product.price}</span>
                                <span className="text-slate-400 text-sm mb-2 line-through font-medium">${(product.price * 1.2).toFixed(2)}</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg">
                                {product.product_description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-8 border-y border-slate-100 dark:border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="text-[11px] font-bold uppercase tracking-wider leading-none">
                                    <p className="text-slate-400 mb-1">Authentic</p>
                                    <p className="text-slate-900 dark:text-white">100% Genuine</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div className="text-[11px] font-bold uppercase tracking-wider leading-none">
                                    <p className="text-slate-400 mb-1">Shipping</p>
                                    <p className="text-slate-900 dark:text-white">Fast & Free</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            {cartItems.some(item => (item.productId || item._id) === product._id) ? (
                                <div className="flex items-center justify-between w-full h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-500/30 px-6">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 bg-white dark:bg-slate-800 shadow-md hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-all active:scale-90"
                                        onClick={() => handleUpdateQuantity(-1)}
                                    >
                                        <span className="text-xl font-bold">-</span>
                                    </Button>

                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                            {cartItems.find(item => (item.productId || item._id) === product._id)?.quantity || 1}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400/70">In Collection</span>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 bg-white dark:bg-slate-800 shadow-md hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-all active:scale-90"
                                        onClick={() => handleUpdateQuantity(1)}
                                    >
                                        <span className="text-xl font-bold">+</span>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-4">
                                    <Button
                                        onClick={handleAddToCart}
                                        className="flex-grow h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-black shadow-2xl shadow-blue-500/30 transform active:scale-95 transition-all flex items-center justify-center gap-3 group"
                                    >
                                        <ShoppingCart className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                        Add to Collection
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleToggleWishlist}
                                        className={cn(
                                            "h-16 w-16 rounded-2xl border-2 transition-all transform active:scale-90",
                                            wishlistItems.some(item => (item._id || item.productId) === product._id)
                                                ? "bg-red-50 dark:bg-red-900/20 border-red-500/30 text-red-500"
                                                : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                                        )}
                                    >
                                        <Heart className={cn("w-7 h-7", wishlistItems.some(item => (item._id || item.productId) === product._id) && "fill-current")} />
                                    </Button>
                                </div>
                            )}
                            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <RefreshCw className="w-3 h-3" /> 30-Day Easy Returns Guarantee
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Section: Reviews */}
                <section className="mt-40 border-t border-slate-100 dark:border-slate-800 pt-24">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                            <div>
                                <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 text-slate-900 dark:text-white italic uppercase">
                                    Customer <span className="text-blue-600">Voices</span>
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                                    Experience real stories from our community. We value every feedback to keep our standards legendary.
                                </p>
                            </div>

                            <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                                <div className="text-center md:text-left pr-6 border-r border-slate-200 dark:border-slate-800">
                                    <div className="text-4xl font-black text-slate-900 dark:text-white leading-none mb-1">{rating}</div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Score</p>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("w-4 h-4", i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-700')} />
                                        ))}
                                    </div>
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{reviews.length} Verified Reviews</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                            {/* Review Form Sidebar */}
                            <div className="lg:col-span-4 space-y-10">
                                {user ? (
                                    <div className="p-8 rounded-[2rem] bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <MessageSquarePlus className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                {userReview ? "Update Review" : "Submit Review"}
                                            </h3>
                                        </div>

                                        <form onSubmit={handleReviewSubmit} className="space-y-8">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">Select Experience</label>
                                                <div className="grid grid-cols-5 gap-3">
                                                    {[1, 2, 3, 4, 5].map((val) => (
                                                        <button
                                                            key={val}
                                                            type="button"
                                                            onClick={() => setRatingValue(val)}
                                                            className={cn(
                                                                "h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-9 hover:-translate-y-1",
                                                                ratingValue >= val
                                                                    ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-400/30'
                                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                                                            )}
                                                        >
                                                            <Star className={cn("w-5 h-5", ratingValue >= val && "fill-current")} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 block">Your Story</label>
                                                <textarea
                                                    value={commentValue}
                                                    onChange={(e) => setCommentValue(e.target.value)}
                                                    className="w-full p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[160px] text-slate-600 dark:text-slate-300 font-medium resize-none shadow-inner"
                                                    placeholder="Tell the community about your experience..."
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-3 pt-2">
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg"
                                                >
                                                    {isSubmitting ? "Processing..." : (userReview ? "Confirm Update" : "Post Review")}
                                                </Button>
                                                {userReview && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={handleDeleteReview}
                                                        className="w-full h-14 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete permanently
                                                    </Button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="p-10 rounded-[2rem] bg-slate-50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                                            <Star className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Join the conversation</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 px-4 leading-relaxed">Login to share your feedback and help others make the best choice.</p>
                                        <Button
                                            onClick={() => navigate("/login")}
                                            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                        >
                                            Login Now
                                        </Button>
                                    </div>
                                )}

                                <div className="p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Review Policy</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">All reviews are verified to be from genuine buyers. We maintain a non-toxic community standard for everyone.</p>
                                </div>
                            </div>

                            {/* Reviews List */}
                            <div className="lg:col-span-8 space-y-6">
                                {reviews.length > 0 ? (
                                    reviews.map((rev, idx) => (
                                        <div key={idx} className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                                                        {rev.userName?.charAt(0) || "U"}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{rev.userName}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex gap-0.5">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} className={cn("w-3 h-3", i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-800')} />
                                                                ))}
                                                            </div>
                                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest pl-2 border-l border-slate-200 dark:border-slate-800">Verified Buyer</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                                    {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="relative pt-6 border-t border-slate-100 dark:border-slate-800">
                                                <MessageSquarePlus className="absolute -top-3.5 left-4 w-7 h-7 text-slate-100 dark:text-slate-800/50 -z-10" />
                                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-lg italic">
                                                    "{rev.comment}"
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-32 rounded-[3.5rem] border-4 border-dashed border-slate-50 dark:border-slate-900 flex flex-col items-center">
                                        <div className="relative mb-8">
                                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center">
                                                <Star className="w-12 h-12 text-slate-200 dark:text-slate-800 animate-pulse" />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                                <ShoppingCart className="w-5 h-5 text-blue-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Pristine State</h3>
                                        <p className="text-slate-400 font-medium max-w-xs mx-auto">This masterpiece hasn't been reviewed yet. Set the benchmark for others!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main >

            <Footer />
        </div >
    );
};

export default ProductPage;
