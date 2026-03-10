import { Link, useNavigate, useLocation } from "react-router-dom";
import { CircleUser, LogOut, Coins, Home, Package, Heart, Info, Phone, Settings, MapPin, Users, PanelLeftClose, X } from "lucide-react";
import { useState, useEffect } from "react";
import { verifySession, serverLogout } from "@/lib/cookieUtils";
import { useSidebar, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from "@/components/ui/sidebar";
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

export function AppSidebar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { open, setOpen, isMobile } = useSidebar();

    // Close the desktop offcanvas sidebar when clicking outside of it
    useEffect(() => {
        // Mobile uses Sheet which already has built-in backdrop click handling, so we skip it.
        // We also only care if the sidebar is currently open.
        if (isMobile || !open) return;

        const handleClickOutside = (e) => {
            // Check if the click happened outside the sidebar wrapper and trigger
            const clickedInsideSidebar = e.target.closest('[data-sidebar="sidebar"]');
            const clickedTrigger = e.target.closest('[data-sidebar="trigger"]') || e.target.closest('button[class*="z-50"]');

            if (!clickedInsideSidebar && !clickedTrigger) {
                setOpen(false);
            }
        };

        // Add small delay to prevent the trigger itself from instantly triggering an outside click event
        const timer = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 50);

        return () => {
            clearTimeout(timer);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open, isMobile, setOpen]);

    useEffect(() => {
        verifySession().then(verified => setUser(verified));

        const handleStorageChange = () => {
            verifySession().then(verified => setUser(verified));
        };
        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("userChange", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("userChange", handleStorageChange);
        };
    }, []);

    const handleLogout = async () => {
        await serverLogout();
        setUser(null);
        window.dispatchEvent(new Event("userChange"));
        navigate("/");
    };

    const [coins, setCoins] = useState(null);

    useEffect(() => {
        const loadCoins = async () => {
            if (!user || user.role === "admin") return;
            try {
                const res = await fetch("/api/coins", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setCoins(data.coins);
                }
            } catch (_) { }
        };
        loadCoins();

        const handler = () => loadCoins();
        window.addEventListener("coinsUpdate", handler);
        window.addEventListener("cartUpdate", handler);
        return () => {
            window.removeEventListener("coinsUpdate", handler);
            window.removeEventListener("cartUpdate", handler);
        };
    }, [user]);

    return (
        <Sidebar collapsible="offcanvas" className="border-r border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 transition-colors duration-300">
            <SidebarHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-6 pt-6 px-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-lg shadow-sm shadow-indigo-500/20">
                        {user ? user.name.charAt(0).toUpperCase() : "?"}
                        {user && user.role === "admin" && (
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 outline outline-2 outline-white dark:outline-zinc-950" title="Admin">
                                <span className="text-[10px]">👑</span>
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        {user ? (
                            <>
                                <span className="font-semibold text-[15px] leading-tight text-zinc-900 dark:text-zinc-100 truncate">{user.name}</span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{user.email}</span>
                            </>
                        ) : (
                            <>
                                <span className="font-semibold text-sm leading-none text-zinc-900 dark:text-zinc-100">Guest User</span>
                                <Link to="/login" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mt-1 hover:underline transition-colors w-max">
                                    Sign in to Shopr
                                </Link>
                            </>
                        )}
                    </div>
                    {user && user.role !== "admin" && coins !== null && (
                        <Link to="/coins" className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-500/20 transition-all text-xs font-bold shrink-0 cursor-pointer border border-yellow-100 dark:border-yellow-500/20 group">
                            <Coins className="h-4 w-4 mb-0.5 group-hover:scale-110 transition-transform text-yellow-500" />
                            <span className="font-semibold">{coins}</span>
                        </Link>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4 gap-6">
                {/* Main Navigation Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-3 pb-2">Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/"} className="rounded-lg h-10 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700 dark:data-[active=true]:bg-indigo-500/10 dark:data-[active=true]:text-indigo-400 transition-colors">
                                    <Link to="/" className="flex items-center gap-3">
                                        <Home className="h-4 w-4" />
                                        <span className="font-medium">{user?.role === "admin" ? "Dashboard" : "Home"}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            {user?.role === "admin" ? (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={location.pathname === "/admin/users"} className="rounded-lg h-10 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700 dark:data-[active=true]:bg-indigo-500/10 dark:data-[active=true]:text-indigo-400 transition-colors">
                                            <Link to="/admin/users" className="flex items-center gap-3">
                                                <Users className="h-4 w-4" />
                                                <span className="font-medium">Users Management</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={location.pathname === "/admin/orders"} className="rounded-lg h-10 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700 dark:data-[active=true]:bg-indigo-500/10 dark:data-[active=true]:text-indigo-400 transition-colors">
                                            <Link to="/admin/orders" className="flex items-center gap-3">
                                                <Package className="h-4 w-4" />
                                                <span className="font-medium">Manage Orders</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            ) : (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={location.pathname === "/orders"} tooltip="Check your orders" className="rounded-lg h-10 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700 dark:data-[active=true]:bg-indigo-500/10 dark:data-[active=true]:text-indigo-400 transition-colors cursor-pointer">
                                            <Link to="/orders" className="flex items-center gap-3 w-full">
                                                <Package className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                                                <span className="font-medium text-zinc-700 dark:text-zinc-200">My Orders</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={location.pathname === "/wishlist"} className="rounded-lg h-10 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 data-[active=true]:bg-rose-50 data-[active=true]:text-rose-600 dark:data-[active=true]:bg-rose-500/10 dark:data-[active=true]:text-rose-400 transition-colors">
                                            <Link to="/wishlist" className="flex items-center gap-3">
                                                <Heart className="h-4 w-4" />
                                                <span className="font-medium">Wishlist</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            onClick={() => {
                                                if (setOpen) setOpen(false);
                                                window.dispatchEvent(new CustomEvent('loginReward', { detail: { reward: 0, streak: user?.loginStreak || 0, isDay7: false, isViewing: true } }));
                                            }}
                                            className="rounded-lg h-10 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                <Coins className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                                                <span className="font-medium text-zinc-700 dark:text-zinc-200">Daily Rewards</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Explore Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-3 pb-2">Explore</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/about"} className="rounded-lg h-10 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
                                    <Link to="/about" className="flex items-center gap-3">
                                        <Info className="h-4 w-4 text-zinc-500" />
                                        <span className="font-medium text-zinc-700 dark:text-zinc-300">About Us</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/contact"} className="rounded-lg h-10 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
                                    <Link to="/contact" className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-zinc-500" />
                                        <span className="font-medium text-zinc-700 dark:text-zinc-300">Contact</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Account Group */}
                <SidebarGroup className="mt-auto pt-8">
                    <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-3 pb-2">Account</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {user && (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={location.pathname === "/account"} className="rounded-lg h-10 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
                                            <Link to="/account" className="flex items-center gap-3">
                                                <Settings className="h-4 w-4 text-zinc-500" />
                                                <span className="font-medium text-zinc-700 dark:text-zinc-300">Account Settings</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            )}
                            <SidebarMenuItem>
                                {user ? (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <SidebarMenuButton className="rounded-lg h-10 mt-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-colors cursor-pointer">
                                                <LogOut className="h-4 w-4 mr-1" />
                                                <span className="font-bold">Log Out</span>
                                            </SidebarMenuButton>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="border-none shadow-2xl bg-white dark:bg-zinc-950 sm:rounded-2xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-xl font-bold">Sign out of Shopr?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400">
                                                    You will need to sign in again to access your account, orders, and wishlist.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="mt-6">
                                                <AlertDialogCancel className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl">Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleLogout} className="bg-red-600 outline-none border-0 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20">Sign Out</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                ) : (
                                    <SidebarMenuButton asChild className="rounded-lg h-10 mt-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                                        <Link to="/login" className="flex justify-center w-full">
                                            <span className="font-bold">Sign In</span>
                                        </Link>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t border-zinc-100 dark:border-zinc-800/50">
                <button
                    onClick={() => isMobile ? setOpenMobile(false) : setOpen(false)}
                    className="flex items-center justify-center w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 hover:bg-rose-100 dark:hover:bg-rose-500/10 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors group"
                >
                    <X className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
            </SidebarFooter>
        </Sidebar >
    );
}

export function AccountButton() {
    const { toggleSidebar, state, isMobile, openMobile } = useSidebar();

    // Hide the button if the sidebar is visibly open
    const isOpen = isMobile ? openMobile : state === "expanded";
    if (isOpen) return null;

    return (
        <button onClick={toggleSidebar} className="fixed bottom-4 left-2 z-50 animate-in fade-in zoom-in duration-300">
            <CircleUser
                size={40}
                className="bg-white text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 rounded-full p-2.5 transition-all duration-300 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-100 dark:border-zinc-800"
            />
        </button>
    );
}
