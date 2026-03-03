"use client"
import { Facebook, Instagram, Linkedin, Twitter, Send, ShoppingBag, MapPin, Mail } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function Footer() {
    return (
        <footer className="w-full border-t bg-gray-50 dark:bg-black text-black dark:text-white transition-colors duration-300 relative z-[100]">
            <div className="container px-4 md:px-6 py-10 mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="h-6 w-6 text-primary" />
                            <span className="font-bold text-2xl tracking-tight">Shopr.</span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Your premium destination for curated products. Shop smart, live better.
                        </p>
                        <div className="flex space-x-1">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:text-primary">
                                <Facebook className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:text-primary">
                                <Twitter className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:text-primary">
                                <Instagram className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:text-primary">
                                <Linkedin className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Shop */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider">Shop</h3>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                            <li><Link to="/" className="hover:text-primary transition-colors">All Products</Link></li>
                            <li><Link to="/wishlist" className="hover:text-primary transition-colors">Wishlist</Link></li>
                            <li><Link to="/cart" className="hover:text-primary transition-colors">My Cart</Link></li>
                            <li><Link to="/account" className="hover:text-primary transition-colors">My Account</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider">Company</h3>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider">Stay Updated</h3>
                        <p className="text-sm text-muted-foreground">
                            Get notified about new arrivals and exclusive deals.
                        </p>
                        <div className="flex space-x-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:text-white"
                            />
                            <Button size="icon" className="rounded-lg shrink-0">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> support@shopr.com</span>
                            <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> India</span>
                        </div>
                    </div>
                </div>

                <div className="mt-10 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Shopr. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
                        <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

