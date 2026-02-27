import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Save, User, MapPin } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { countryCityData } from "@/data/countryCities"
import { saveUser, getUser } from "@/lib/cookieUtils"
import { verifySession } from "@/lib/cookieUtils"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, AccountButton } from "../comps/AppSidebar"

export function AccountSettings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        country: "India",
    });

    useEffect(() => {
        verifySession().then(verified => {
            if (!verified) {
                toast.error("Please log in to access settings");
                navigate("/login");
                return;
            }
            setUser(verified);
            setForm({
                name: verified.name || "",
                phone: verified.phone || "",
                address: verified.address || "",
                city: verified.city || "",
                country: verified.country || "India",
            });
        });
    }, [navigate]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === "country") {
            setForm({ ...form, country: value, city: "" });
        } else {
            setForm({ ...form, [id]: value });
        }
    };

    const cities = countryCityData[form.country] || [];

    const handleSubmit = async (e) => {
        e.preventDefault();

        const nameRegex = /^[a-zA-Z\s]{2,}$/;
        const phoneRegex = /^\+?\d{10}$/;
        const addressRegex = /^[a-zA-Z0-9\s,.\-/#]{5,}$/;

        if (!nameRegex.test(form.name.trim())) {
            return toast.error("Name must be at least 2 characters (letters only)");
        }
        if (!phoneRegex.test(form.phone.replace(/[\s-]/g, ""))) {
            return toast.error("Please enter a valid phone number (10 digits)");
        }
        if (!addressRegex.test(form.address.trim())) {
            return toast.error("Please enter a valid address (at least 5 characters)");
        }
        if (!form.city) {
            return toast.error("Please select your city");
        }

        setLoading(true);

        try {
            const res = await fetch("/api/update-profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    userId: user.id,
                    ...form,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                saveUser(data.user);
                window.dispatchEvent(new Event("userChange"));
                toast.success("Profile updated successfully!");
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-6 transition-colors duration-300">
                    <Link to="/" className="inline-flex items-center gap-2 mb-8 text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                        <span>Home</span>
                    </Link>
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Account Settings</h1>
                            <p className="text-gray-500 dark:text-zinc-400 mt-1">Manage your personal details and delivery address</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Info Card */}
                            <Card className="border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 shadow-sm">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/10 dark:bg-white/10">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Personal Information</CardTitle>
                                            <CardDescription className="text-gray-500 dark:text-zinc-400">Your name and contact details</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="name" className="text-gray-700 dark:text-zinc-300">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            required
                                            className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="phone" className="text-gray-700 dark:text-zinc-300">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="+91 9801234567"
                                            required
                                            className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label className="text-gray-400 dark:text-zinc-500 text-xs">Email</Label>
                                        <Input
                                            value={user.email}
                                            disabled
                                            className="bg-gray-100 dark:bg-zinc-800/50 border-gray-300 dark:border-zinc-700 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-400 dark:text-zinc-500">Email cannot be changed</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Address Card */}
                            <Card className="border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 shadow-sm">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/10 dark:bg-white/10">
                                            <MapPin className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">Delivery Address</CardTitle>
                                            <CardDescription className="text-gray-500 dark:text-zinc-400">Where your orders will be delivered</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="address" className="text-gray-700 dark:text-zinc-300">Street Address</Label>
                                        <textarea
                                            id="address"
                                            placeholder="House #, Street, Area"
                                            value={form.address}
                                            onChange={handleChange}
                                            required
                                            rows={3}
                                            className="flex w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="country" className="text-gray-700 dark:text-zinc-300">Country</Label>
                                            <select
                                                id="country"
                                                value={form.country}
                                                onChange={handleChange}
                                                required
                                                className="flex h-9 w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            >
                                                {Object.keys(countryCityData).map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="city" className="text-gray-700 dark:text-zinc-300">City</Label>
                                            <select
                                                id="city"
                                                value={form.city}
                                                onChange={handleChange}
                                                required
                                                className="flex h-9 w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            >
                                                <option value="">Select City</option>
                                                {cities.map((city) => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Save Button */}
                            <div className="flex justify-end">
                                <Button type="submit" disabled={loading} className="min-w-[140px] bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-zinc-200">
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
                <AccountButton />
            </SidebarInset>
        </SidebarProvider>
    )
}
