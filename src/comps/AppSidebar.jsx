import { Link, useNavigate, useLocation } from "react-router-dom";
import { CircleUser, LogOut } from "lucide-react";
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

    return (
        <Sidebar collapsible="offcanvas">
            <SidebarHeader className="border-b border-sidebar-border pb-4">
                <div className="flex items-center gap-3 px-2 pt-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold">
                        {user ? user.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="flex flex-col">
                        {user ? (
                            <>
                                <span className="font-semibold text-sm leading-none">{user.name}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                            </>
                        ) : (
                            <>
                                <span className="font-semibold text-sm leading-none">Guest</span>
                                <Link to="/login" className="text-xs text-blue-500 hover:underline">Sign in</Link>
                            </>
                        )}
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {/* Main Navigation Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive={location.pathname === "/"}>
                                    <span className="flex items-center gap-2"><Link to="/">🏠 {user?.role === "admin" ? "Dashboard" : "Home"}</Link></span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            {user?.role === "admin" ? (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton>
                                            <span className="flex items-center gap-2"><Link to="/admin/users">👥 Users</Link></span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                </>
                            ) : (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton tooltip="Check your orders">
                                            <span className="flex items-center gap-2">📦 My Orders</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={location.pathname === "/wishlist"}>
                                            <Link to="/wishlist" className="flex items-center gap-2">
                                                <span>❤️ Wishlist</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>


                <SidebarSeparator />

                {/* Account Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Account</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {user && (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton>
                                            <span className="text-xs text-muted-foreground">📍 {user.city}, {user.country}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton>
                                            <span className="text-xs text-muted-foreground">📞 {user.phone}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={location.pathname === "/account"}>
                                            <Link to="/account">⚙️ Account Settings</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            )}
                            <SidebarMenuItem>
                                {user ? (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <SidebarMenuButton className="text-red-500 hover:text-red-600">
                                                <LogOut className="h-4 w-4 mr-1" /> Logout
                                            </SidebarMenuButton>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    You will need to sign in again to access your account.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                ) : (
                                    <SidebarMenuButton asChild>
                                        <Link to="/login" className="text-blue-500 hover:text-blue-600">
                                            🔑 Sign In
                                        </Link>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-4">
                <div className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                    v1.0.4 - 2026 Build
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}

export function AccountButton() {
    const { toggleSidebar } = useSidebar();

    return (
        <button onClick={toggleSidebar} className="fixed bottom-4 left-2 z-50">
            <CircleUser
                size={40}
                className="bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 rounded-full p-2 transition-all duration-200 shadow-none"
            />
        </button>
    );
}
