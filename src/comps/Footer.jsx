"use client"
import { Facebook, Instagram, Linkedin, Twitter, Send } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function Footer() {
    return (
        <footer className="w-full bg-background border-t bg-black text-white">
            <div className="container px-4 md:px-6 py-10 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-2xl">Shopr.</span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Building better digital experiences for everyone.
                        </p>
                        <div className="flex space-x-4">
                            <Button variant="ghost" size="icon" className="hover:text-primary">
                                <Facebook className="h-5 w-5" />
                                <span className="sr-only">Facebook</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:text-primary">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:text-primary">
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:text-primary">
                                <Linkedin className="h-5 w-5" />
                                <span className="sr-only">LinkedIn</span>
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Subscribe</h3>
                        <p className="text-sm text-muted-foreground">
                            Join our newsletter to stay up to date on features and releases.
                        </p>
                        <div className="flex space-x-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <Button size="icon">
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Subscribe</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Shopr. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
