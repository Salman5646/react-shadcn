import {

    Avatar,

    AvatarFallback,

    AvatarImage,

} from "@/components/ui/avatar"

import { Link } from "react-router-dom"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import React from "react"
import logo from "../images/logo.png"
import { Menu } from "lucide-react" // Add this import
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet" // Ensure you have this component installed
import { Button } from "@/components/ui/button"

export function Navbar() {
    return (
        <div className="bg-gray-900 sticky top-0 z-50 flex w-full items-center justify-between py-4 px-4 md:px-8">
            <Avatar className="border-none">
                <AvatarImage src={logo} alt="Logo" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            {/* DESKTOP MENU (Hidden on mobile) */}
            <NavigationMenu className="hidden md:block">
                <NavigationMenuList>
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
                </NavigationMenuList>
            </NavigationMenu>

            {/* MOBILE MENU (Visible only on mobile) */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" className="text-white p-0 hover:bg-transparent">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="h-100 bg-gray-900 text-white border-gray-800">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SheetDescription className="sr-only">
                            Main navigation menu for mobile devices
                        </SheetDescription>
                        <div className="flex flex-col gap-4 mt-8">
                            <Link to="/" className="text-lg font-medium hover:text-gray-400">Home</Link>
                            <Link to="/about" className="text-lg font-medium hover:text-gray-400">About us</Link>
                            <Link to="/contact" className="text-lg font-medium hover:text-gray-400">Contact</Link>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    )
}