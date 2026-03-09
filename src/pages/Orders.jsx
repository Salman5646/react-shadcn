import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Loader2, Calendar, CreditCard, ChevronRight, Coins } from "lucide-react";
import { toast } from "sonner";
import { verifySession } from "@/lib/cookieUtils";
import { BackButton } from "../comps/BackButton";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const userData = await verifySession();
            if (!userData) {
                toast.error("Please login to view your orders");
                navigate("/login");
                return;
            }
            setUser(userData);
            fetchOrders();
        };
        checkUser();
    }, [navigate]);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders", {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            } else {
                toast.error("Failed to load orders");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Processing": return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
            case "Shipped": return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20";
            case "Delivered": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
            case "Cancelled": return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20";
            default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700";
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] bg-zinc-50 dark:bg-zinc-950 px-4 py-8 md:px-8 lg:px-12">
            <BackButton to="/" label="Back to Dashboard" className="mb-6" />
            <div className="max-w-5xl mx-auto space-y-8 mt-2 md:mt-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">My Orders</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
                        <Package className="h-4 w-4" /> Keep track of your purchases
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm text-center px-4">
                        <div className="h-24 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                            <Package className="h-10 w-10 text-zinc-400" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">No orders yet</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
                            Looks like you haven't placed any orders using your Shopr Coins yet!
                        </p>
                        <Link
                            to="/"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full transition-all shadow-md shadow-indigo-500/20"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm overflow-hidden group hover:border-indigo-500/30 transition-colors">
                                {/* Order Header */}
                                <div className="p-6 sm:px-8 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Order ID</span>
                                            <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">#{order._id.slice(-8).toUpperCase()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(order.createdAt)}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 block mb-0.5">Total Amount</span>
                                            <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-1 justify-end">
                                                <Coins className="h-5 w-5 text-yellow-500" /> {order.totalAmount}
                                            </span>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="sm:hidden p-4 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                                    <span className="text-sm font-medium text-zinc-500">Total</span>
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1"><Coins className="h-4 w-4 text-yellow-500" /> {order.totalAmount}</span>
                                </div>

                                {/* Order Items */}
                                <div className="p-6 sm:px-8 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="py-4 flex items-center gap-4 first:pt-0 last:pb-0">
                                            <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                                                <img
                                                    src={item.product_image}
                                                    alt={item.product_name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = "https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=200&auto=format&fit=crop";
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link to={`/product/${item.productId}`} className="font-bold text-base text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors">
                                                    {item.product_name}
                                                </Link>
                                                <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-3">
                                                    <span>Qty: {item.quantity}</span>
                                                    <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                                                    <span className="flex items-center gap-1"><Coins className="h-3 w-3 text-yellow-500" /> {item.price} each</span>
                                                </div>
                                            </div>
                                            <div className="hidden sm:flex text-right shrink-0">
                                                <ChevronRight className="h-5 w-5 text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
