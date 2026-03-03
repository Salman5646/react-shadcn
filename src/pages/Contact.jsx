import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Footer } from "../comps/Footer"
import { Navbar } from "../comps/Navbar"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"
import { toast } from "sonner"

export function Contact() {
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

    const form = useForm({
        defaultValues: {
            username: "",
            email: "",
            message: ""
        }
    })

    function onSubmit(values) {
        toast.success("Message sent! We'll get back to you within 24 hours.");
        form.reset();
    }

    const contactInfo = [
        {
            icon: MapPin,
            title: "Our Office",
            detail: "407, Sion West, Mumbai, Maharashtra",
        },
        {
            icon: Phone,
            title: "Phone",
            detail: "+91 91674 21XXX",
        },
        {
            icon: Mail,
            title: "Email",
            detail: "support@shopr.com",
        },
        {
            icon: Clock,
            title: "Working Hours",
            detail: "Mon - Sat, 9:00 AM - 6:00 PM IST",
        },
    ];

    return (
        <>
            <Navbar />
            <div className="bg-white dark:bg-black text-black dark:text-white min-h-screen py-16 px-6 md:px-8 transition-colors duration-300">

                {/* Hero */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <Badge variant="outline" className="mb-4 dark:text-white dark:border-white">Support</Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                        Get in <span className="text-primary">Touch</span>
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Have a question about a product, an order, or anything else? Our team is here to help you.
                    </p>
                </div>

                <Separator className="my-12 bg-gray-200 dark:bg-white/10 max-w-4xl mx-auto" />

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Left — Contact Info Cards */}
                    <div className="space-y-5">
                        <h2 className="text-xl font-bold mb-2">Contact Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {contactInfo.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={idx}
                                        className="bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <p className="font-semibold text-sm">{item.title}</p>
                                        </div>
                                        <p className="text-muted-foreground text-sm pl-12">{item.detail}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* FAQ teaser */}
                        <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 mt-4">
                            <h3 className="font-bold text-sm mb-3">Frequently Asked</h3>
                            <ul className="space-y-2.5 text-sm text-muted-foreground">
                                <li className="flex gap-2">
                                    <span className="text-primary shrink-0">→</span>
                                    Orders usually ship within 1–3 business days.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-primary shrink-0">→</span>
                                    Returns are accepted within 7 days of delivery.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-primary shrink-0">→</span>
                                    Refunds are processed in 5–7 business days.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right — Contact Form */}
                    <Card className="bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-4 w-4 text-primary" />
                                Send us a Message
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">We'll respond within 24 hours.</p>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 rounded-xl" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="you@example.com" className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 rounded-xl" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Message</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="How can we help you?"
                                                        className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 min-h-[120px] rounded-xl"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full rounded-xl h-11 font-semibold">
                                        Send Message
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </>
    )
}