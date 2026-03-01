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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // ── Forgot Password state ──
    const [fpOpen, setFpOpen] = useState(false);
    const [fpStep, setFpStep] = useState(1); // 1=email, 2=otp, 3=new password
    const [fpEmail, setFpEmail] = useState("");
    const [fpOtp, setFpOtp] = useState("");
    const [fpNewPassword, setFpNewPassword] = useState("");
    const [fpConfirmPassword, setFpConfirmPassword] = useState("");
    const [fpLoading, setFpLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

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

    // ── Forgot Password Handlers ──

    function openForgotPassword() {
        setFpStep(1);
        setFpEmail("");
        setFpOtp("");
        setFpNewPassword("");
        setFpConfirmPassword("");
        setFpOpen(true);
    }

    async function handleSendOtp(e) {
        e.preventDefault();
        if (!fpEmail) return toast.error("Please enter your email");
        setFpLoading(true);
        try {
            const res = await fetch("/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: fpEmail }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("OTP sent! Check your email.");
                setFpStep(2);
            } else {
                toast.error(data.message || "Failed to send OTP");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setFpLoading(false);
        }
    }

    async function handleVerifyOtp(e) {
        e.preventDefault();
        if (!fpOtp) return toast.error("Please enter the OTP");
        setFpLoading(true);
        try {
            const res = await fetch("/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: fpEmail, otp: fpOtp }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("OTP verified!");
                setFpStep(3);
            } else {
                toast.error(data.message || "Invalid OTP");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setFpLoading(false);
        }
    }

    async function handleResetPassword(e) {
        e.preventDefault();
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/;
        if (!passwordRegex.test(fpNewPassword)) {
            return toast.error("Password must be at least 6 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character");
        }
        if (fpNewPassword !== fpConfirmPassword) {
            return toast.error("Passwords do not match");
        }
        setFpLoading(true);
        try {
            const res = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email: fpEmail, otp: fpOtp, newPassword: fpNewPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                saveUser(data.user);
                toast.success("Password reset! You are now logged in.");
                setFpOpen(false);
                navigate("/");
            } else {
                toast.error(data.message || "Failed to reset password");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setFpLoading(false);
        }
    }

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Link to="/" className="absolute top-4 left-4 md:top-8 md:left-8 text-white hover:text-gray-300 transition-colors">
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
                                <TabsTrigger value="signup" className="flex-1" asChild>
                                    <Link to="/signup">Sign Up</Link>
                                </TabsTrigger>
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
                                    <button
                                        type="button"
                                        onClick={openForgotPassword}
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-muted-foreground hover:text-foreground"
                                    >
                                        Forgot your password?
                                    </button>
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

            {/* ── Forgot Password Dialog ── */}
            <Dialog open={fpOpen} onOpenChange={setFpOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            {fpStep === 1 && "Forgot Password"}
                            {fpStep === 2 && "Enter OTP"}
                            {fpStep === 3 && "Set New Password"}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Step 1 — Email */}
                    {fpStep === 1 && (
                        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Enter your registered email and we'll send you a 6-digit OTP.
                            </p>
                            <div className="grid gap-2">
                                <Label htmlFor="fp-email">Email</Label>
                                <Input
                                    id="fp-email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={fpEmail}
                                    onChange={(e) => setFpEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={fpLoading}>
                                {fpLoading ? "Sending..." : "Send OTP"}
                            </Button>
                        </form>
                    )}

                    {/* Step 2 — OTP */}
                    {fpStep === 2 && (
                        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Enter the 6-digit OTP sent to <strong>{fpEmail}</strong>. It expires in 10 minutes.
                            </p>
                            <div className="grid gap-2">
                                <Label htmlFor="fp-otp">OTP</Label>
                                <Input
                                    id="fp-otp"
                                    type="text"
                                    placeholder="123456"
                                    maxLength={6}
                                    value={fpOtp}
                                    onChange={(e) => setFpOtp(e.target.value.replace(/\D/, ""))}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={fpLoading}>
                                {fpLoading ? "Verifying..." : "Verify OTP"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => setFpStep(1)}
                                className="text-sm text-muted-foreground hover:underline text-center"
                            >
                                Resend OTP
                            </button>
                        </form>
                    )}

                    {/* Step 3 — New Password */}
                    {fpStep === 3 && (
                        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Choose a strong new password.
                            </p>
                            <div className="grid gap-2">
                                <Label htmlFor="fp-new-password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="fp-new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        value={fpNewPassword}
                                        onChange={(e) => setFpNewPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fp-confirm-password">Confirm Password</Label>
                                <Input
                                    id="fp-confirm-password"
                                    type="password"
                                    value={fpConfirmPassword}
                                    onChange={(e) => setFpConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={fpLoading}>
                                {fpLoading ? "Resetting..." : "Reset Password"}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}