import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

    const toggleDarkMode = () => setDarkMode(!darkMode);
    const form = useForm({
        defaultValues: {
            username: "",
            email: "",
            message: ""
        }
    })

    function onSubmit(values) {
        console.log("Form Data:", values)
        alert("Message sent! (Check console for data)")
    }

    return (
        <>
            <Navbar />
            <div className="bg-black text-white min-h-screen py-16 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Left Side: Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
                            <p className="text-muted-foreground text-lg">
                                Have a question about a product or an order? Fill out the form and our team will get back to you within 24 hours.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/20 p-3 rounded-full text-primary">📍</div>
                                <div>
                                    <p className="font-semibold">Our Office</p>
                                    <p className="text-muted-foreground">407, Sion West, Mumbai, Maharashtra</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/20 p-3 rounded-full text-primary">📞</div>
                                <div>
                                    <p className="font-semibold">Phone</p>
                                    <p className="text-muted-foreground">+91 91674 21XXX</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Contact Form Card */}
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader>
                            <CardTitle>Send us a Message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" className="bg-zinc-800 border-zinc-700" {...field} />
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
                                                    <Input placeholder="john@example.com" className="bg-zinc-800 border-zinc-700" {...field} />
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
                                                        className="bg-zinc-800 border-zinc-700 min-h-[120px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" variant="outline" className="bg-green-500 hover:bg-green-600 hover:text-white w-full">Send Message</Button>
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