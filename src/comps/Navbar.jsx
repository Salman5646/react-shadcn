import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import { Link, useNavigate } from "react-router-dom"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import React, { useState, useEffect } from "react"
import logo from "../images/logo.png"
import { Menu, Home, Users, Info, Phone, LogIn, LogOut } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/alert-dialog"

export function Navbar() {
    const [user, setUser] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem("user"));
        if (savedUser) setUser(savedUser);

        const handleStorageChange = () => {
            const current = JSON.parse(localStorage.getItem("user"));
            setUser(current);
        };
        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("userChange", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("userChange", handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        setLoggingOut(true);
        setTimeout(() => {
            localStorage.removeItem("user");
            setUser(null);
            window.dispatchEvent(new Event("userChange"));
            setLoggingOut(false);
            navigate("/");
        }, 1000);
    };

    return (
        <>
            {loggingOut && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-400 border-t-white"></div>
                    <p className="mt-3 text-white text-sm font-medium">Logging out...</p>
                </div>
            )}
            <div className="bg-gray-900 dark:bg-black sticky top-0 z-50 flex w-full items-center justify-between py-4 px-4 md:px-8">
                <Avatar className="border-none">
                    <Link to="/"><AvatarImage src={logo} alt="Logo" /></Link>
                    <AvatarFallback>Logo</AvatarFallback>
                </Avatar>

                {/* DESKTOP MENU */}
                <NavigationMenu className="hidden md:block">
                    <NavigationMenuList>
                        {user?.role === "admin" ? (
                            <>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link to="/">Dashboard</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link to="/admin/users">Users</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>

                            </>
                        ) : (
                            <>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link to="/">Home</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link to="/about">About us</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link to="/contact">Contact</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            </>
                        )}
                        {user ? (
                            <NavigationMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                            <button>Log Out</button>
                                        </NavigationMenuLink>
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
                            </NavigationMenuItem>
                        ) : (
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                    <Link to="/login">Sign In</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        )}
                    </NavigationMenuList>
                </NavigationMenu>

                {/* MOBILE MENU */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="text-white p-0 hover:bg-white/10 rounded-full h-9 w-9 transition-colors">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[260px] border-l border-white/10 bg-gray-950/95 backdrop-blur-xl text-white p-0"
                            style={{ height: 'auto', bottom: 'auto' }}
                        >
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <SheetDescription className="sr-only">
                                Main navigation menu for mobile devices
                            </SheetDescription>
                            <nav className="flex flex-col px-3 pt-14 pb-4">
                                {user?.role === "admin" ? (
                                    <>
                                        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white transition-colors">
                                            <Home className="h-4 w-4 text-gray-400" /> Dashboard
                                        </Link>
                                        <Link to="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white transition-colors">
                                            <Users className="h-4 w-4 text-gray-400" /> Users
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white transition-colors">
                                            <Home className="h-4 w-4 text-gray-400" /> Home
                                        </Link>
                                        <Link to="/about" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white transition-colors">
                                            <Info className="h-4 w-4 text-gray-400" /> About us
                                        </Link>
                                        <Link to="/contact" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white transition-colors">
                                            <Phone className="h-4 w-4 text-gray-400" /> Contact
                                        </Link>
                                    </>
                                )}
                                <div className="my-2 h-px bg-white/10" />
                                {user ? (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left w-full">
                                                <LogOut className="h-4 w-4" /> Log Out
                                            </button>
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
                                    <Link to="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-colors">
                                        <LogIn className="h-4 w-4" /> Sign In
                                    </Link>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </>
    )
}