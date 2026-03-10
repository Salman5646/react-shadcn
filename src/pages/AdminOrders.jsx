import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Package, Search, Calendar, ChevronRight, Edit, Check, X, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { verifySession } from "@/lib/cookieUtils";
import { BackButton } from "../comps/BackButton";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updating, setUpdating] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            const userData = await verifySession();
            if (!userData || userData.role !== "admin") {
                toast.error("Unauthorized access");
                navigate("/");
                return;
            }
            fetchOrders();
        };
        checkAdmin();
    }, [navigate]);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/admin/orders", {
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

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
                credentials: "include"
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders(orders.map(order =>
                    order._id === orderId ? updatedOrder.order : order
                ));
                toast.success(`Order status updated to ${newStatus}`);
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to update status");
            }
        } catch (error) {
            toast.error("Network error while updating status");
        } finally {
            setUpdating(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Processing": return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
            case "Shipped": return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20";
            case "Delivered": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
            case "Cancelled": return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20";
            case "Returned": return "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20";
            case "Refunded": return "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 border-zinc-200 dark:border-zinc-500/20";
            default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700";
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const filteredOrders = orders.filter(order => {
        const searchStr = searchTerm.toLowerCase();
        return (
            order._id.toLowerCase().includes(searchStr) ||
            order.userId?.name?.toLowerCase().includes(searchStr) ||
            order.userId?.email?.toLowerCase().includes(searchStr) ||
            order.status.toLowerCase().includes(searchStr)
        );
    });

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] bg-zinc-50 dark:bg-zinc-950 px-4 py-8 md:px-8 lg:px-12">
            <BackButton to="/admin/users" label="Back to Admin" className="mb-6" />
            <div className="max-w-6xl mx-auto space-y-8 mt-2 md:mt-4">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Manage Orders</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
                            <Package className="h-4 w-4" /> View and update all customer orders
                        </p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-zinc-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search orders, users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-full leading-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                        />
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Order ID / Date</th>
                                    <th className="px-6 py-4 font-medium">Customer</th>
                                    <th className="px-6 py-4 font-medium">Total</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                                            No orders found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </div>
                                                <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                                                    <Calendar className="h-3 w-3" /> {formatDate(order.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                                    {order.userId?.name || "Deleted User"}
                                                </div>
                                                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                    {order.userId?.email || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                                                ${order.totalAmount}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {updating === order._id ? (
                                                        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                                                    ) : (
                                                        <select
                                                            className="text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                                                            value={order.status}
                                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                        >
                                                            <option value="Processing">Processing</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                            <option value="Returned">Returned</option>
                                                            <option value="Refunded">Refunded</option>
                                                        </select>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
