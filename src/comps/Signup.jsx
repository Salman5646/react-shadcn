import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Eye, EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { toast } from "sonner"
import { countryCityData } from "@/data/countryCities"
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export function Signup() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        city: "",
        country: "India",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === "country") {
            setForm({ ...form, country: value, city: "" });
        } else {
            setForm({ ...form, [id]: value });
        }
    };

    const cities = countryCityData[form.country] || [];

    const handleSignup = async (e) => {
        e.preventDefault();

        // Regex validations
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/;
        const phoneRegex = /^\+?\d{10}$/;
        const nameRegex = /^[a-zA-Z\s]{2,}$/;

        if (!nameRegex.test(form.name)) {
            return toast.error("Name must contain only letters and be at least 2 characters");
        }
        if (!emailRegex.test(form.email)) {
            return toast.error("Please enter a valid email address");
        }
        if (!passwordRegex.test(form.password)) {
            return toast.error("Password must cotain atleast 6 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character");
        }
        if (!phoneRegex.test(form.phone.replace(/[\s-]/g, ""))) {
            return toast.error("Please enter a valid phone number (10 digits)");
        }
        const addressRegex = /^[a-zA-Z0-9\s,.\-/#]{5,}$/;
        if (!addressRegex.test(form.address.trim())) {
            return toast.error("Please enter a valid delivery address (at least 5 characters)");
        }
        setLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("user", JSON.stringify(data.user));
                toast.success("Account created successfully!");
                navigate("/");
            } else {
                toast.error(data.message || "Signup failed");
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
                    <CardTitle className="text-center text-2xl m-2">Create your new account</CardTitle>
                    <div className="flex justify-center">
                        <Tabs defaultValue="signup" className="w-full">
                            <TabsList className="w-full">
                                <TabsTrigger value="login" className="flex-1"><Link to="/login">Log In</Link></TabsTrigger>
                                <TabsTrigger value="signup" className="flex-1" asChild><Link to="/signup">Sign Up</Link></TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup}>
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="m@example.com" value={form.email} onChange={handleChange} required />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Minimum 6 characters" value={form.password} onChange={handleChange} required />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
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
                            {loading ? "Creating account..." : "Sign up"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                try {
                                    const res = await fetch('/api/google-auth', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ token: credentialResponse.credential }),
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                        localStorage.setItem("user", JSON.stringify(data.user));
                                        window.dispatchEvent(new Event("userChange"));
                                        if (!data.user.phone) {
                                            toast.success("Please complete your profile");
                                            navigate("/complete-profile");
                                        } else {
                                            toast.success("Account created successfully!");
                                            navigate("/");
                                        }
                                    } else {
                                        toast.error(data.message || "Google sign up failed");
                                    }
                                } catch (err) {
                                    toast.error("Something went wrong with Google sign up");
                                }
                            }}
                            onError={() => toast.error('Google sign up failed')}
                            width={350}
                            text="signup_with"
                        />
                    </GoogleOAuthProvider>
                </CardFooter>
            </Card>
        </div >
    )
}