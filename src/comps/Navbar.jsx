import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import { Link, useNavigate, useLocation } from "react-router-dom"
import React, { useState, useEffect } from "react"
import logo from "../images/logo.png"
import { Menu, Home, Users, Info, Phone, LogIn, LogOut, Settings, ShoppingCart, Sun, Moon, Heart } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { verifySession, serverLogout } from "@/lib/cookieUtils"
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

function NavLink({ to, icon: Icon, children }) {
    const { pathname } = useLocation()
    const isActive = pathname === to

    return (
        <Link
            to={to}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
        >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {children}
        </Link>
    )
}

export function Navbar() {
    const [user, setUser] = useState(null)
    const [loggingOut, setLoggingOut] = useState(false)
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark" || false
    );
    const navigate = useNavigate()

    useEffect(() => {
        verifySession().then(verified => setUser(verified))

        // Sync theme with document
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        const handleAuthChange = () => {
            verifySession().then(verified => setUser(verified))
        }

        window.addEventListener("userChange", handleAuthChange)
        window.addEventListener("storage", handleAuthChange)

        return () => {
            window.removeEventListener("userChange", handleAuthChange)
            window.removeEventListener("storage", handleAuthChange)
        }
    }, [darkMode])

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("theme", newMode ? "dark" : "light");
    };

    const handleLogout = async () => {
        setLoggingOut(true)
        const success = await serverLogout()
        if (success) {
            setUser(null)
            toast.success("Logged out successfully")
            navigate("/login")
        } else {
            toast.error("Logout failed")
        }
        setLoggingOut(false)
    }

    const initials = user?.name
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "?"

    return (
        <>
            {loggingOut && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-400 border-t-white" />
                    <p className="mt-3 text-white text-sm font-medium">Logging out...</p>
                </div>
            )}

            <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg transition-colors duration-300">
                <div className="flex items-center justify-between py-3 px-4 md:px-8 max-w-screen-2xl mx-auto">

                    {/* Logo — left */}
                    <Link to="/" className="flex-shrink-0">
                        <Avatar className="border-none h-9 w-9">
                            <AvatarImage src={logo} alt="Shopr" />
                            <AvatarFallback>S</AvatarFallback>
                        </Avatar>
                    </Link>

                    {/* Right side — nav links + controls */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        {/* Desktop nav links */}
                        <nav className="hidden md:flex items-center gap-1">
                            {user?.role === "admin" ? (
                                <>
                                    <NavLink to="/" icon={Home}>Dashboard</NavLink>
                                    <NavLink to="/admin/users" icon={Users}>Users</NavLink>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/" icon={Home}>Home</NavLink>
                                    <NavLink to="/wishlist" icon={Heart}>Wishlist</NavLink>
                                    <NavLink to="/about" icon={Info}>About</NavLink>
                                    <NavLink to="/contact" icon={Phone}>Contact</NavLink>
                                </>
                            )}
                        </nav>

                        {/* Dark mode toggle — always visible, before menu/dropdown */}
                        <button
                            onClick={toggleDarkMode}
                            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {darkMode ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                        </button>

                        {/* User dropdown — desktop */}
                        <div className="hidden md:flex">
                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border border-border hover:bg-accent transition-colors duration-200 outline-none">
                                            <Avatar className="h-7 w-7 text-xs">
                                                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium leading-none">
                                                {user.name?.split(" ")[0]}
                                            </span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal truncate">
                                            {user.email}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link to="/account" className="flex items-center gap-2 cursor-pointer">
                                                <Settings className="h-3.5 w-3.5" /> Account Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/cart" className="flex items-center gap-2 cursor-pointer">
                                                <ShoppingCart className="h-3.5 w-3.5" /> My Cart
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem
                                                    className="text-red-500 focus:text-red-500 flex items-center gap-2 cursor-pointer"
                                                    onSelect={(e) => e.preventDefault()}
                                                >
                                                    <LogOut className="h-3.5 w-3.5" /> Log Out
                                                </DropdownMenuItem>
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
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link to="/login">
                                    <Button size="sm" className="rounded-full px-5 gap-1.5">
                                        <LogIn className="h-3.5 w-3.5" /> Sign In
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* MOBILE HAMBURGER */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" className="p-0 h-9 w-9 rounded-full hover:bg-accent transition-colors">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="right"
                                    className="w-[260px] border-l border-border bg-background/95 backdrop-blur-xl p-0"
                                    style={{ height: "auto", bottom: "auto" }}
                                >
                                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                    <SheetDescription className="sr-only">Main navigation menu for mobile devices</SheetDescription>

                                    {/* User info banner */}
                                    {user && (
                                        <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b border-border">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate">{user.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    <nav className="flex flex-col gap-0.5 px-3 pt-3 pb-4">
                                        {user?.role === "admin" ? (
                                            <>
                                                <MobileLink to="/" icon={Home} onClick={() => setOpen(false)}>Dashboard</MobileLink>
                                                <MobileLink to="/admin/users" icon={Users} onClick={() => setOpen(false)}>Users</MobileLink>
                                            </>
                                        ) : (
                                            <>
                                                <MobileLink to="/" icon={Home} onClick={() => setOpen(false)}>Home</MobileLink>
                                                <MobileLink to="/wishlist" icon={Heart} onClick={() => setOpen(false)}>Wishlist</MobileLink>
                                                <MobileLink to="/about" icon={Info} onClick={() => setOpen(false)}>About</MobileLink>
                                                <MobileLink to="/contact" icon={Phone} onClick={() => setOpen(false)}>Contact</MobileLink>
                                            </>
                                        )}

                                        {user && (
                                            <>
                                                <div className="my-2 h-px bg-border" />
                                                <MobileLink to="/account" icon={Settings}>Account Settings</MobileLink>
                                                <MobileLink to="/cart" icon={ShoppingCart}>My Cart</MobileLink>
                                            </>
                                        )}

                                        <div className="my-2 h-px bg-border" />

                                        {user ? (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors text-left w-full">
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
                                            <Link to="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                                                <LogIn className="h-4 w-4" /> Sign In
                                            </Link>
                                        )}
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div> {/* mobile hamburger */}

                    </div> {/* right-side wrapper */}
                </div> {/* outer container */}
            </header>
        </>
    )
}

function MobileLink({ to, icon: Icon, children }) {
    const { pathname } = useLocation()
    const isActive = pathname === to

    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
        >
            {Icon && <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />}
            {children}
        </Link>
    )
}