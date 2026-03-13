import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Loader2, Calendar, CreditCard, ChevronRight, Coins, RefreshCcw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { verifySession } from "@/lib/cookieUtils";
import { BackButton } from "../comps/BackButton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [returnTopic, setReturnTopic] = useState("");
    const [returnDesc, setReturnDesc] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        let intervalId;
        const checkUser = async () => {
            const userData = await verifySession();
            if (!userData) {
                toast.error("Please login to view your orders");
                navigate("/login");
                return;
            }
            setUser(userData);
            fetchOrders();
            // Poll for dynamic status updates
            intervalId = setInterval(() => {
                fetchOrders(true);
            }, 10000);
        };
        checkUser();

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [navigate]);

    const fetchOrders = async (silent = false) => {
        try {
            const res = await fetch("/api/orders", {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            } else if (!silent) {
                toast.error("Failed to load orders");
            }
        } catch (error) {
            if (!silent) toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            const res = await fetch(`/api/orders/${orderId}/cancel`, {
                method: "PUT",
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                fetchOrders(true);
            } else {
                toast.error(data.message || "Failed to cancel order");
            }
        } catch (err) {
            toast.error("Network error");
        }
    };

    const handleReturnOrder = async (orderId) => {
        if (!returnTopic) {
            toast.error("Please select a return topic");
            return;
        }

        const combinedReason = `${returnTopic}${returnDesc ? ' - ' + returnDesc : ''}`;

        try {
            const res = await fetch(`/api/orders/${orderId}/return`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ returnReason: combinedReason }),
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setReturnTopic(""); // clear after submission
                setReturnDesc("");
                fetchOrders(true);
            } else {
                toast.error(data.message || "Failed to initiate return");
            }
        } catch (err) {
            toast.error("Network error");
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
                            <div key={order._id} className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm overflow-hidden group hover:border-indigo-500/30 transition-all">
                                {/* Order Header */}
                                <div className="p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center justify-between sm:justify-start gap-x-4 gap-y-2">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Order</span>
                                                <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">#{order._id.slice(-8).toUpperCase()}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {formatDate(order.createdAt)}
                                            </div>
                                        </div>

                                        <div className="sm:hidden">
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/50">
                                        <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-0.5">
                                            <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total</span>
                                            <span className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                                                <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" /> {order.totalAmount}
                                            </span>
                                        </div>
                                        <div className={`hidden sm:block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-4 sm:p-6 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="py-4 flex items-center gap-4 first:pt-0 last:pb-0">
                                            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
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
                                                <Link to={`/product/${item.productId}`} className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors">
                                                    {item.product_name}
                                                </Link>
                                                <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2 sm:gap-3">
                                                    <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium">Qty: {item.quantity}</span>
                                                    <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700 hidden sm:block"></span>
                                                    <span className="flex items-center gap-1 font-medium"><Coins className="h-3 w-3 text-yellow-500" /> {item.price}</span>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                <ChevronRight className="h-5 w-5 text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Actions Footer */}
                                <div className="p-4 sm:px-6 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-950/30 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                                    <Link
                                        to={`/order-tracking/${order._id}`}
                                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 rounded-xl sm:rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Package className="w-4 h-4" /> Track Order
                                    </Link>
                                    {order.status === "Processing" && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-xl sm:rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <XCircle className="w-4 h-4" /> Cancel Order
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to cancel this order? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleCancelOrder(order._id)} className="bg-red-600 hover:bg-red-700 text-white">
                                                        Yes, Cancel
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                    {order.status === "Delivered" && order.deliveredAt && (
                                        (() => {
                                            const deliveryDate = new Date(order.deliveredAt);
                                            // Validate date
                                            if (isNaN(deliveryDate.getTime())) return null;

                                            const ONE_DAY = 24 * 60 * 60 * 1000;
                                            const SEVEN_DAYS = 7 * ONE_DAY;
                                            const isReturnable = (Date.now() - deliveryDate.getTime()) <= SEVEN_DAYS;

                                            if (isReturnable) {
                                                return (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <button
                                                                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20 rounded-xl sm:rounded-lg transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <RefreshCcw className="w-4 h-4" /> Return Item
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Return Item</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to return this order? You have 7 days from delivery to initiate a return.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <div className="py-2 flex flex-col gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                                                        Topic
                                                                    </label>
                                                                    <select
                                                                        value={returnTopic}
                                                                        onChange={(e) => setReturnTopic(e.target.value)}
                                                                        className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                                                                    >
                                                                        <option value="" disabled>Select a reason</option>
                                                                        <option value="Defective or Damaged">Defective or Damaged</option>
                                                                        <option value="Wrong Item Shipped">Wrong Item Shipped</option>
                                                                        <option value="Item Not As Described">Item Not As Described</option>
                                                                        <option value="Changed My Mind">Changed My Mind</option>
                                                                        <option value="Other">Other</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                                                        Description (Optional)
                                                                    </label>
                                                                    <textarea
                                                                        value={returnDesc}
                                                                        onChange={(e) => setReturnDesc(e.target.value)}
                                                                        placeholder="Please provide more details..."
                                                                        rows={3}
                                                                        className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-100"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel onClick={() => { setReturnTopic(""); setReturnDesc(""); }}>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleReturnOrder(order._id)} className="bg-orange-600 hover:bg-orange-700 text-white">
                                                                    Confirm Return
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                );
                                            }
                                            return null;
                                        })()
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
