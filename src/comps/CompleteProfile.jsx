import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { toast } from "sonner"
import { countryCityData } from "@/data/countryCities"

export function CompleteProfile() {
    const navigate = useNavigate();
    const savedUser = JSON.parse(localStorage.getItem("user"));

    const [form, setForm] = useState({
        phone: savedUser?.phone || "",
        address: savedUser?.address || "",
        city: savedUser?.city || "",
        country: savedUser?.country || "India",
    });
    const [loading, setLoading] = useState(false);

    if (!savedUser) {
        navigate("/login");
        return null;
    }

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

        const phoneRegex = /^\+?\d{10}$/;
        const addressRegex = /^[a-zA-Z0-9\s,.\-/#]{5,}$/;

        if (!phoneRegex.test(form.phone.replace(/[\s-]/g, ""))) {
            return toast.error("Please enter a valid phone number (10 digits)");
        }
        if (!addressRegex.test(form.address.trim())) {
            return toast.error("Please enter a valid delivery address (at least 5 characters)");
        }
        if (!form.city) {
            return toast.error("Please select your city");
        }

        setLoading(true);

        try {
            const res = await fetch("/api/update-profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: savedUser.id,
                    ...form,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("user", JSON.stringify(data.user));
                window.dispatchEvent(new Event("userChange"));
                toast.success("Profile completed successfully!");
                navigate("/");
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-gray-950">
            <Link to="/" className="absolute top-4 left-4 md:top-8 md:left-8 text-white hover:text-gray-300 transition-colors">
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Back to Home</span>
            </Link>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center text-2xl m-2">Complete your profile</CardTitle>
                    <p className="text-center text-sm text-muted-foreground">
                        Welcome, {savedUser.name}! Please fill in the remaining details.
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" placeholder="+91 9801234567" value={form.phone} onChange={handleChange} required />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="address">Delivery Address</Label>
                                <textarea id="address" placeholder="House #, Street, Area" value={form.address} onChange={handleChange} required rows={3}
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="country">Country</Label>
                                <select id="country" value={form.country} onChange={handleChange} required
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                    {Object.keys(countryCityData).map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="city">City</Label>
                                <select id="city" value={form.city} onChange={handleChange} required
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                    <option value="">Select City</option>
                                    {cities.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Button type="submit" className="w-full mt-6" disabled={loading}>
                            {loading ? "Saving..." : "Complete Profile"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
