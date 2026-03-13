import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, AccountButton } from "../comps/AppSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, ArrowUpRight, ArrowDownLeft, Gift, ShoppingBag, RotateCcw, ShieldCheck, Loader2, Calendar, Search } from "lucide-react";
import { BackButton } from "../comps/BackButton";
import { verifySession } from "@/lib/cookieUtils";

export default function CoinHistory() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const verified = await verifySession();
                setUser(verified);

                const res = await fetch("/api/coins/history", {
                    credentials: "include"
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log("Fetched coin transactions:", data);
                    setTransactions(data);
                } else {
                    console.error("Failed to fetch history:", res.status);
                }
            } catch (error) {
                console.error("Error fetching coin history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Unknown Date";
            return date.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }).replace(",", " •");
        } catch (e) {
            return "Invalid Date";
        }
    };

    const renderDescription = (desc) => {
        if (!desc) return null;
        // Regex to find Order IDs like #05AC5C0D
        const orderIdRegex = /(#([0-9A-Z]{8}))/g;
        const parts = desc.split(orderIdRegex);

        return parts.map((part, i) => {
            if (part && part.startsWith("#") && part.length === 9) {
                const orderIdFull = part.replace("#", "");
                // Assuming we can find the full order ID if we only have the short version?
                // Actually, our orders page uses the DB ID, and we store the slice(-8) in the description.
                // We'll link to a search/tracking page if possible, or just the tracking page with the truncated ID.
                // For now, let's link to /orders since tracking requires the full ID.
                return (
                    <Link
                        key={i}
                        to="/orders"
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline decoration-2 underline-offset-2"
                    >
                        {part}
                    </Link>
                );
            }
            // Skip the capture group matches (the second element in parentheses)
            if (part && part.length === 8 && !part.startsWith("#")) return null;
            return part;
        });
    };

    const getIcon = (type, amount) => {
        if (type === "welcome") return <Gift className="w-6 h-6 md:w-8 md:h-8" />;
        if (type === "reward") return <Sparkles className="w-6 h-6 md:w-8 md:h-8" />;
        if (type === "purchase") return <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />;
        if (type === "refund") return <RotateCcw className="w-6 h-6 md:w-8 md:h-8" />;
        if (type === "admin_adjustment") return <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />;
        return amount > 0 ? <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8" /> : <ArrowDownLeft className="w-6 h-6 md:w-8 md:h-8" />;
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case "welcome": return "Welcome Bonus";
            case "reward": return "Daily Reward";
            case "purchase": return "Purchase";
            case "refund": return "Refund";
            case "admin_adjustment": return "Admin Credit";
            default: return "Transaction";
        }
    };

    const filteredTransactions = transactions.filter(t => {
        if (filter === "all") return true;
        if (filter === "earn") return t.amount > 0;
        if (filter === "spend") return t.amount < 0;
        return true;
    });

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-3 md:p-8 transition-all duration-300">
                    <BackButton to="/" label="Back to Shop" className="mb-4 md:mb-6" />

                    <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2 md:pt-4">
                            <div className="space-y-3 md:space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] border border-yellow-400/20">
                                    <Coins className="w-3 h-3" />
                                    Wealth Ledger
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">Coin History</h1>
                                <p className="text-slate-500 dark:text-zinc-400 font-medium text-base md:text-lg">Detailed log of your earnings and spends.</p>
                            </div>

                            <div className="flex bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-1.5 rounded-2xl md:rounded-[1.25rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                {["all", "earn", "spend"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFilter(type)}
                                        className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-[1rem] text-xs md:text-sm font-bold transition-all duration-500 capitalize ${filter === type ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/40 ring-1 ring-indigo-400 scale-[1.02] md:scale-105' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Transactions List */}
                        <div className="grid gap-3 md:gap-4">
                            {filteredTransactions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center bg-white/40 dark:bg-zinc-900/40 rounded-[2rem] md:rounded-[2.5rem] border border-dashed border-zinc-300 dark:border-zinc-800">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                        <Search className="w-8 h-8 md:w-10 md:h-10 text-zinc-400" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-100">Empty Ledger</h3>
                                    <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-xs mt-2 font-medium px-4">
                                        {filter === "all" ? "Start earning coins by logging in daily!" : `No ${filter} transactions found in your history.`}
                                    </p>
                                </div>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <div
                                        key={tx._id}
                                        className="group relative bg-white dark:bg-zinc-900 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-7 border border-zinc-200 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500"
                                    >
                                        <div className="flex items-center gap-4 md:gap-6">
                                            {/* Icon Section */}
                                            <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center border-2 transition-all duration-500 ${tx.amount > 0 ? 'bg-green-50/50 dark:bg-green-500/5 border-green-100/50 dark:border-green-500/10 text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-500/20' : 'bg-rose-50/50 dark:bg-rose-500/5 border-rose-100/50 dark:border-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20'}`}>
                                                {getIcon(tx.type, tx.amount)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1 md:mb-2">
                                                    <div className="min-w-0">
                                                        <h3 className="font-black text-zinc-900 dark:text-zinc-100 text-lg md:text-2xl tracking-tight truncate">
                                                            {getTypeLabel(tx.type)}
                                                        </h3>
                                                        <p className="text-[10px] md:text-xs font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-0.5">
                                                            Balance: {tx.balanceAfter}
                                                        </p>
                                                    </div>
                                                    <div className={`text-xl md:text-3xl font-black tracking-tighter whitespace-nowrap ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-500'}`}>
                                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 mt-1">
                                                    <p className="text-xs md:text-base font-bold text-zinc-500/80 dark:text-zinc-400/70 truncate md:max-w-sm">
                                                        {renderDescription(tx.description)}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[9px] md:text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] whitespace-nowrap">
                                                        <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                                        {formatDate(tx.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Motivational Footer Card */}
                        <div className="bg-indigo-600 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/40 group hover:scale-[1.01] transition-all duration-700">
                            {/* Decorative Blobs */}
                            <div className="absolute top-0 right-0 w-64 md:w-80 h-64 md:h-80 bg-white/10 rounded-full blur-[60px] md:blur-[80px] -mr-32 md:-mr-40 -mt-32 md:-mt-40 animate-pulse" />
                            <div className="absolute bottom-0 left-0 w-48 md:w-60 h-48 md:h-60 bg-indigo-400/20 rounded-full blur-[40px] md:blur-[60px] -ml-24 md:-ml-30 -mb-24 md:-mb-30" />

                            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-12">
                                <div className="space-y-4 md:space-y-6 text-center lg:text-left order-2 lg:order-1">
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Multiply Your <br /><span className="text-yellow-400">Wealth</span> Easily.</h2>
                                    <p className="text-indigo-100 text-sm md:text-xl font-medium max-w-md opacity-90 mx-auto lg:mx-0">
                                        Log in every day to keep your streak! A 7-day milestone unlocks a massive 100 coin windfall.
                                    </p>
                                    <Link
                                        to="/coins-info"
                                        className="inline-block bg-white text-indigo-700 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-base hover:shadow-2xl hover:bg-yellow-400 hover:text-yellow-900 transition-all duration-500 active:scale-95"
                                    >
                                        View Rewards Guide
                                    </Link>
                                </div>
                                <div className="shrink-0 relative order-1 lg:order-2">
                                    <div className="w-32 h-32 md:w-56 md:h-56 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(250,204,21,0.4)] ring-[12px] md:ring-[16px] ring-white/10 animate-float">
                                        <Coins className="w-16 h-16 md:w-32 md:h-32 text-yellow-800 animate-spin-slow" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center shadow-lg animate-bounce duration-1000 hidden md:flex">
                                        <Coins className="w-5 h-5 text-yellow-700" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <AccountButton />
            </SidebarInset>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-float { animation: float 5s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 15s linear infinite; }
                
                @media (max-width: 768px) {
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-10px) rotate(3deg); }
                    }
                }
            `}} />
        </SidebarProvider>
    );
}

function Sparkles({ className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M3 5h4" />
            <path d="M21 17v4" />
            <path d="M19 19h4" />
        </svg>
    )
}
