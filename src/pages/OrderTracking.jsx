import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, Package, CheckCircle2, Truck, Box, Clock, Calendar, MapPin, Coins, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "../comps/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function OrderTracking() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [returnTopic, setReturnTopic] = useState("");
    const [returnDesc, setReturnDesc] = useState("");

    const fetchOrderDetails = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await fetch(`/api/orders/${id}`, {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else if (!silent) {
                toast.error("Failed to load order details");
            }
        } catch (err) {
            if (!silent) toast.error("Network error fetching order details");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const handleCancelOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}/cancel`, {
                method: "PUT",
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                fetchOrderDetails(true);
            } else {
                toast.error(data.message || "Failed to cancel order");
            }
        } catch (err) {
            toast.error("Network error");
        }
    };

    const handleReturnOrder = async () => {
        if (!returnTopic) {
            toast.error("Please select a return topic");
            return;
        }

        const combinedReason = `${returnTopic}${returnDesc ? ' - ' + returnDesc : ''}`;

        try {
            const res = await fetch(`/api/orders/${id}/return`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ returnReason: combinedReason }),
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setReturnTopic("");
                setReturnDesc("");
                fetchOrderDetails(true);
            } else {
                toast.error(data.message || "Failed to initiate return");
            }
        } catch (err) {
            toast.error("Network error");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Pending";
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] px-4 text-center">
                <Package className="h-16 w-16 text-zinc-300 mb-4" />
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Order Not Found</h2>
                <p className="text-zinc-500 max-w-sm mt-2 mb-6">We couldn't find tracking details for this order. It might have been deleted or doesn't exist.</p>
                <Link to="/orders" className="text-indigo-600 font-medium hover:underline">Return to Orders</Link>
            </div>
        );
    }

    const { trackingDates, status, items, deliveryAddress, totalAmount } = order;

    // Build dynamic timeline based on order path
    const buildSteps = () => {
        const baseSteps = [
            {
                id: "Processing",
                label: "Order Placed",
                icon: Clock,
                date: trackingDates?.processing,
                description: "We are preparing your items for shipment.",
            }
        ];

        if (status === "Cancelled" || trackingDates?.cancelled) {
            baseSteps.push({
                id: "Cancelled",
                label: "Cancelled",
                icon: XCircle,
                date: trackingDates?.cancelled,
                description: "This order has been cancelled.",
                isTerminal: true,
                bgColor: "bg-red-500"
            });
            return baseSteps;
        }

        // Forward path
        baseSteps.push(
            {
                id: "Shipped",
                label: "Shipped",
                icon: Box,
                date: trackingDates?.shipped,
                description: "Your order has left our facility.",
            },
            {
                id: "Out for Delivery",
                label: "Out for Delivery",
                icon: Truck,
                date: trackingDates?.outForDelivery,
                description: "Your package is with the local courier.",
            },
            {
                id: "Delivered",
                label: "Delivered",
                icon: CheckCircle2,
                date: trackingDates?.delivered,
                description: "Your order has been delivered.",
            }
        );

        if (status === "Returned" || trackingDates?.returned || status === "Refunded" || trackingDates?.refunded) {
            const returnedDate = trackingDates?.returned ? new Date(trackingDates.returned) : null;
            const expectedRefundDate = returnedDate
                ? new Date(returnedDate.getTime() + (24 * 60 * 60 * 1000))
                : null;

            baseSteps.push({
                id: "Returned",
                label: "Returned",
                icon: RefreshCw,
                date: trackingDates?.returned,
                description: status === "Returned" && expectedRefundDate
                    ? `This order has been returned. Expected refund: ${formatDate(expectedRefundDate)}.`
                    : "This order has been returned.",
                bgColor: "bg-orange-500"
            });

            baseSteps.push({
                id: "Refunded",
                label: "Refunded",
                icon: Coins,
                date: trackingDates?.refunded,
                description: "Your refund has been processed.",
                isTerminal: true,
                bgColor: "bg-zinc-500"
            });
        }

        return baseSteps;
    };

    const steps = buildSteps();
    const currentStepIndex = steps.findIndex(s => s.id === status);
    const isErrorState = status === "Cancelled" || status === "Refunded" || status === "Returned";

    return (
        <div className="min-h-[80vh] bg-zinc-50 dark:bg-zinc-950 px-4 py-8 md:px-8 lg:px-12">
            <BackButton to="/orders" label="Back to Orders" className="mb-6" />
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Track Order</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-mono">#{order._id.toUpperCase()}</p>
                    </div>
                    {isErrorState && (
                        <div className="px-4 py-2 rounded-lg bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 font-bold tracking-wide">
                            {status.toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left side: Timeline */}
                    <div className="md:col-span-2">
                        <Card className="border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm h-full">
                            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-indigo-500" />
                                    Delivery Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8 pb-6 px-6 sm:px-10">
                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">
                                    {steps.map((step, index) => {
                                        const StepIcon = step.icon;
                                        const isCompleted = currentStepIndex >= index;
                                        const isCurrent = currentStepIndex === index;
                                        const isTerminalStep = step.isTerminal;

                                        return (
                                            <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                {/* Icon Node */}
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 
                                                    ${isCompleted ? (step.bgColor || 'bg-indigo-500') + ' border-indigo-100 dark:border-indigo-900 text-white' : 'bg-zinc-100 border-white dark:border-zinc-900 dark:bg-zinc-800 text-zinc-400'} 
                                                    ${isCurrent ? 'ring-4 ring-indigo-500/20 shadow-indigo-500/50' : ''}
                                                    transition-all duration-300 relative z-10`}
                                                >
                                                    <StepIcon className="w-4 h-4" />
                                                </div>

                                                {/* Card */}
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-all">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`font-bold ${isCompleted ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                                                            {step.label}
                                                        </span>
                                                        <span className={`text-xs flex items-center gap-1 ${isCompleted ? 'text-zinc-500' : 'text-zinc-300 dark:text-zinc-600'}`}>
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(step.date)}
                                                        </span>
                                                        <p className={`text-sm mt-2 ${isCompleted ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right side: Details */}
                    <div className="space-y-6">
                        <Card className="border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm sticky top-6">
                            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <CardTitle className="text-lg">Order Details</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-6">
                                {/* Address */}
                                <div>
                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 text-zinc-400" /> Delivery Address
                                    </h4>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-5">
                                        {deliveryAddress?.address}<br />
                                        {deliveryAddress?.city}, {deliveryAddress?.country}
                                    </p>
                                </div>

                                {/* Items List */}
                                <div>
                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-1.5">
                                        <Package className="h-4 w-4 text-zinc-400" /> Items Subtotal
                                    </h4>
                                    <div className="space-y-3 pl-5 max-h-48 overflow-y-auto pr-2">
                                        {items.map((item, index) => (
                                            <div key={index} className="flex gap-3 text-sm">
                                                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
                                                    <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.product_name}</p>
                                                    <p className="text-zinc-500 text-xs">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                                    <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg font-medium">
                                        <span className="text-sm text-zinc-600 dark:text-zinc-300">Total Paid</span>
                                        <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                                            <Coins className="h-4 w-4 text-yellow-500" /> {totalAmount}
                                        </span>
                                    </div>

                                    {status === "Processing" && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-all border border-red-100 dark:border-red-500/20">
                                                    <XCircle className="h-4 w-4" /> Cancel Order
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
                                                    <AlertDialogAction onClick={handleCancelOrder} className="bg-red-600 hover:bg-red-700 text-white">
                                                        Yes, Cancel
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}

                                    {status === "Delivered" && order.deliveredAt && (() => {
                                        const deliveryDate = new Date(order.deliveredAt);
                                        if (isNaN(deliveryDate.getTime())) return null;
                                        const ONE_DAY = 24 * 60 * 60 * 1000;
                                        const SEVEN_DAYS = 7 * ONE_DAY;
                                        const isReturnable = (Date.now() - deliveryDate.getTime()) <= SEVEN_DAYS;

                                        if (isReturnable) {
                                            return (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold text-sm hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all border border-orange-100 dark:border-orange-500/20">
                                                            <RefreshCw className="h-4 w-4" /> Return Items
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Return Items</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to return this order? You have 7 days from delivery.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <div className="py-2 flex flex-col gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Topic</label>
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
                                                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Description (Optional)</label>
                                                                <textarea
                                                                    value={returnDesc}
                                                                    onChange={(e) => setReturnDesc(e.target.value)}
                                                                    placeholder="Please provide more details..."
                                                                    rows={3}
                                                                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 dark:text-zinc-100"
                                                                />
                                                            </div>
                                                        </div>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel onClick={() => { setReturnTopic(""); setReturnDesc(""); }}>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={handleReturnOrder} className="bg-orange-600 hover:bg-orange-700 text-white">Confirm Return</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
