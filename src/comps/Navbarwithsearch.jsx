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
import { Searchbar } from "./Searchbar"
import logo from "../images/logo.png"
import { Menu } from "lucide-react"
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

export function Navbarwithsearch({ searchTerm, setSearchTerm, resultCount, toggleDarkMode, darkMode }) {
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
            {/* Navbar Container */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center w-full px-4 md:px-8 justify-between">
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={logo} alt="Logo" />
                        <AvatarFallback>Logo</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 px-4 lg:px-8 max-w-2xl">
                        <Searchbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} resultCount={resultCount} />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleDarkMode}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 md:hidden"
                        >
                            {darkMode ? "🌙" : "☀️"}
                        </button>

                        {/* DESKTOP MENU */}
                        <NavigationMenu className="hidden md:flex">
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
                                                <NavigationMenuLink asChild className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 cursor-pointer">
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
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 cursor-pointer">
                                        <button
                                            onClick={toggleDarkMode}
                                            className="h-full w-full"
                                        >
                                            {darkMode ? "🌙" : "☀️"}
                                        </button>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>

                        {/* MOBILE MENU */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" className="h-9 w-9 p-0">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                    <SheetDescription className="sr-only">
                                        Main navigation menu for mobile devices
                                    </SheetDescription>
                                    <div className="flex flex-col gap-6 mt-8">
                                        {user?.role === "admin" ? (
                                            <>
                                                <Link to="/" className="text-lg font-medium hover:text-primary transition-colors">Dashboard</Link>
                                                <Link to="/admin/users" className="text-lg font-medium hover:text-primary transition-colors">Users</Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link to="/" className="text-lg font-medium hover:text-primary transition-colors">Home</Link>
                                                <Link to="/about" className="text-lg font-medium hover:text-primary transition-colors">About us</Link>
                                                <Link to="/contact" className="text-lg font-medium hover:text-primary transition-colors">Contact</Link>
                                            </>
                                        )}
                                        {user ? (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button className="text-lg font-medium hover:text-destructive text-left transition-colors text-muted-foreground">Log Out</button>
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
                                            <Link to="/login" className="text-lg font-medium hover:text-primary transition-colors">Sign In</Link>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}