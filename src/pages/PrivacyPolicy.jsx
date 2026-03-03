import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Footer } from "../comps/Footer"
import { Navbar } from "../comps/Navbar"
import { Shield, Eye, Lock, Database, UserCheck, Mail } from "lucide-react"

export function PrivacyPolicy() {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark" || false
    );
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    const sections = [
        {
            icon: Database,
            title: "Information We Collect",
            content: [
                "Account information such as your name, email address, phone number, and shipping address when you register.",
                "Order details including products purchased, payment method, and delivery preferences.",
                "Usage data like browsing history on our platform, search queries, and product interactions.",
                "Device information including browser type, IP address, and cookies for a personalized experience."
            ]
        },
        {
            icon: Eye,
            title: "How We Use Your Information",
            content: [
                "To process and fulfill your orders, including shipping and payment processing.",
                "To send order confirmations, shipping updates, and delivery notifications.",
                "To personalize your shopping experience with product recommendations and wishlist features.",
                "To improve our platform's performance, security, and user experience.",
                "To communicate promotional offers and new arrivals (only with your consent)."
            ]
        },
        {
            icon: Lock,
            title: "Data Security",
            content: [
                "We use industry-standard encryption (SSL/TLS) to protect your personal and payment information.",
                "Passwords are securely hashed and never stored in plain text.",
                "Session tokens are stored in secure, HTTP-only cookies to prevent unauthorized access.",
                "We conduct regular security audits to identify and address potential vulnerabilities."
            ]
        },
        {
            icon: UserCheck,
            title: "Your Rights",
            content: [
                "Access and download your personal data from your account settings at any time.",
                "Update or correct your personal information through your account dashboard.",
                "Request deletion of your account and associated data by contacting our support team.",
                "Opt out of promotional communications while still receiving essential order updates."
            ]
        },
        {
            icon: Shield,
            title: "Cookies & Tracking",
            content: [
                "We use essential cookies to maintain your login session and shopping cart.",
                "Analytics cookies help us understand how users interact with our platform.",
                "You can manage cookie preferences through your browser settings.",
                "We do not sell your data to third-party advertisers."
            ]
        }
    ];

    return (
        <>
            <Navbar />
            <div className="bg-white dark:bg-black text-black dark:text-white min-h-screen py-16 px-6 md:px-8 transition-colors duration-300">
                {/* Hero */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <Badge variant="outline" className="mb-4 dark:text-white dark:border-white">Legal</Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                        Privacy <span className="text-black dark:text-white">Policy</span>
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Your privacy matters to us. This policy explains how Shopr collects, uses, and protects your personal information.
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                        Last updated: March 2026
                    </p>
                </div>

                <Separator className="my-12 bg-gray-200 dark:bg-white/10 max-w-4xl mx-auto" />

                {/* Sections */}
                <div className="max-w-4xl mx-auto space-y-8">
                    {sections.map((section, idx) => {
                        const Icon = section.icon;
                        return (
                            <div
                                key={idx}
                                className="bg-gray-50 dark:bg-zinc-900/50 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-zinc-800"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-xl font-bold">{section.title}</h2>
                                </div>
                                <ul className="space-y-3">
                                    {section.content.map((item, i) => (
                                        <li key={i} className="flex gap-3 text-muted-foreground text-sm leading-relaxed">
                                            <span className="text-primary mt-1 shrink-0">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Contact */}
                <div className="max-w-4xl mx-auto mt-12 text-center">
                    <div className="bg-gray-50 dark:bg-zinc-900/50 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800">
                        <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                        <h3 className="text-lg font-bold mb-2">Questions about your privacy?</h3>
                        <p className="text-muted-foreground text-sm">
                            Contact us at <span className="text-primary font-medium">support@shopr.com</span> and we'll be happy to help.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}
