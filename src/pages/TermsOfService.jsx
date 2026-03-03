import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Footer } from "../comps/Footer"
import { Navbar } from "../comps/Navbar"
import { ScrollText, ShoppingBag, CreditCard, Truck, RotateCcw, AlertTriangle, Scale } from "lucide-react"

export function TermsOfService() {
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
            icon: ShoppingBag,
            title: "Account & Eligibility",
            content: [
                "You must be at least 18 years old to create an account and make purchases on Shopr.",
                "You are responsible for maintaining the confidentiality of your account credentials.",
                "Each user may only create one account. Duplicate accounts may be suspended.",
                "You agree to provide accurate and up-to-date information when registering and placing orders."
            ]
        },
        {
            icon: CreditCard,
            title: "Orders & Payments",
            content: [
                "All prices are displayed in Indian Rupees (₹) and include applicable taxes unless stated otherwise.",
                "We reserve the right to refuse or cancel any order due to pricing errors, stock unavailability, or suspected fraud.",
                "Payment is processed securely at the time of order placement. We accept major credit/debit cards and UPI.",
                "Order confirmation is sent via email once payment has been successfully processed."
            ]
        },
        {
            icon: Truck,
            title: "Shipping & Delivery",
            content: [
                "We aim to process and ship orders within 1–3 business days.",
                "Delivery times vary based on your location and are estimated, not guaranteed.",
                "Shipping charges, if applicable, are displayed at checkout before payment.",
                "Risk of loss passes to you upon delivery of the product to the carrier."
            ]
        },
        {
            icon: RotateCcw,
            title: "Returns & Refunds",
            content: [
                "Products may be returned within 7 days of delivery if they are unused and in original packaging.",
                "Refunds are processed within 5–7 business days after we receive and inspect the returned item.",
                "Certain products such as personalized items, perishables, or opened software are non-returnable.",
                "Shipping costs for returns are borne by the customer unless the item was damaged or defective."
            ]
        },
        {
            icon: AlertTriangle,
            title: "Prohibited Activities",
            content: [
                "Using the platform for any illegal, fraudulent, or unauthorized purpose.",
                "Attempting to gain unauthorized access to other accounts or our systems.",
                "Submitting false reviews, misleading product information, or spam content.",
                "Reselling products purchased on Shopr without prior written consent."
            ]
        },
        {
            icon: Scale,
            title: "Limitation of Liability",
            content: [
                "Shopr is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.",
                "Product images are for illustration purposes and actual products may vary slightly in color or appearance.",
                "We do not guarantee uninterrupted or error-free access to the platform at all times.",
                "These terms are governed by the laws of India, and disputes shall be resolved in Mumbai jurisdiction."
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
                        Terms of <span className="text-black dark:text-white">Service</span>
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Please read these terms carefully before using Shopr. By accessing our platform, you agree to be bound by these terms.
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                        Effective: March 2026
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

                {/* Agreement Note */}
                <div className="max-w-4xl mx-auto mt-12 text-center">
                    <div className="bg-gray-50 dark:bg-zinc-900/50 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800">
                        <ScrollText className="h-8 w-8 mx-auto mb-3 text-primary" />
                        <h3 className="text-lg font-bold mb-2">By using Shopr, you agree to these terms</h3>
                        <p className="text-muted-foreground text-sm">
                            If you have any questions, reach out to us at <span className="text-primary font-medium">support@shopr.com</span>.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}
