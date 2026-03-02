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
import { saveUser } from "@/lib/cookieUtils"
import { mergeGuestCart } from "@/lib/cartService"
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/;

        if (!emailRegex.test(email)) {
            return toast.error("Please enter a valid email address");
        }
        if (!passwordRegex.test(password)) {
            return toast.error("Password must cotain atleast 6 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character");
        }

        setLoading(true);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                saveUser(data.user);
                await mergeGuestCart();
                toast.success("Login successful!");
                navigate("/");
            } else {
                toast.error(data.message || "Login failed");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Link to="/" className="absolute top-4 left-4 md:top-8 md:left-8 text-foreground hover:text-muted-foreground transition-colors">
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Back to Home</span>
            </Link>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center text-2xl m-2">Login to your account</CardTitle>
                    <div className="flex justify-center">
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="w-full">
                                <TabsTrigger value="login" className="flex-1">Log In</TabsTrigger>
                                <TabsTrigger value="signup" className="flex-1" onClick={() => navigate("/signup")}>Sign Up</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <Link
                                        to="/forgot-password"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-muted-foreground hover:text-foreground"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Button type="submit" className="w-full mt-6" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
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
                                        saveUser(data.user);
                                        await mergeGuestCart();
                                        window.dispatchEvent(new Event("userChange"));
                                        if (!data.user.phone) {
                                            toast.success("Please complete your profile");
                                            navigate("/complete-profile");
                                        } else {
                                            toast.success("Login successful!");
                                            navigate("/");
                                        }
                                    } else {
                                        toast.error(data.message || "Google login failed");
                                    }
                                } catch (err) {
                                    toast.error("Something went wrong with Google login");
                                }
                            }}
                            onError={() => toast.error('Google login failed')}
                            width={320}
                        />
                    </GoogleOAuthProvider>
                </CardFooter>
            </Card>

        </div >
    )
}