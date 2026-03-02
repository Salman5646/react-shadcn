import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { saveUser } from "@/lib/cookieUtils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { ChevronLeft, Eye, EyeOff, Mail, ShieldCheck, KeyRound } from "lucide-react"

// ── Step indicator ──────────────────────────────────────────────────────────
function StepIndicator({ current }) {
    const steps = [
        { icon: Mail, label: "Email" },
        { icon: ShieldCheck, label: "Verify OTP" },
        { icon: KeyRound, label: "New Password" },
    ]
    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {steps.map((s, i) => {
                const Icon = s.icon
                const num = i + 1
                const done = current > num
                const active = current === num
                return (
                    <div key={i} className="flex items-center">
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                                    ${done ? "bg-green-500 text-white" :
                                        active ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                                            "bg-muted text-muted-foreground"}`}
                            >
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-xs font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`h-0.5 w-14 mb-5 mx-1 transition-colors duration-300 ${done ? "bg-green-500" : "bg-muted"}`} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export function ForgotPassword() {
    const navigate = useNavigate()

    const [step, setStep] = useState(1) // 1 = email, 2 = otp, 3 = new password

    // Step 1
    const [email, setEmail] = useState("")
    // Step 2
    const [otp, setOtp] = useState("")
    // Step 3
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showNewPw, setShowNewPw] = useState(false)

    const [loading, setLoading] = useState(false)

    // ── Step 1: Send OTP ──────────────────────────────────────────────────
    async function handleSendOtp(e) {
        e.preventDefault()
        if (!email) return toast.error("Please enter your email")
        setLoading(true)
        try {
            const res = await fetch("/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("OTP sent! Check your inbox.")
                setStep(2)
            } else {
                toast.error(data.message || "Failed to send OTP")
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    // ── Step 2: Verify OTP ────────────────────────────────────────────────
    async function handleVerifyOtp(e) {
        e.preventDefault()
        if (!otp) return toast.error("Please enter the OTP")
        setLoading(true)
        try {
            const res = await fetch("/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("OTP verified!")
                setStep(3)
            } else {
                toast.error(data.message || "Invalid OTP")
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    // ── Step 3: Reset Password ────────────────────────────────────────────
    async function handleResetPassword(e) {
        e.preventDefault()
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/
        if (!passwordRegex.test(newPassword)) {
            return toast.error("Password must be at least 6 chars with uppercase, lowercase, number & special character")
        }
        if (newPassword !== confirmPassword) {
            return toast.error("Passwords do not match")
        }
        setLoading(true)
        try {
            const res = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, otp, newPassword }),
            })
            const data = await res.json()
            if (res.ok) {
                saveUser(data.user)
                toast.success("Password reset! You are now logged in.")
                navigate("/")
            } else {
                toast.error(data.message || "Failed to reset password")
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            {/* Back button */}
            <Link
                to="/login"
                className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
                <ChevronLeft className="h-5 w-5" />
                Back to Login
            </Link>

            <Card className="w-full max-w-md">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
                    <CardDescription>Follow the steps below to regain access to your account.</CardDescription>
                </CardHeader>

                <CardContent className="pt-4">
                    <StepIndicator current={step} />

                    {/* ── Step 1: Enter Email ── */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="fp-email">Registered Email</Label>
                                <Input
                                    id="fp-email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                                <p className="text-xs text-muted-foreground">
                                    We'll send a 6-digit OTP to this address. It expires in&nbsp;
                                    <strong>10 minutes</strong>.
                                </p>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Sending OTP…" : "Send OTP"}
                            </Button>
                        </form>
                    )}

                    {/* ── Step 2: Enter OTP ── */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="fp-otp">One-Time Password</Label>
                                <Input
                                    id="fp-otp"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="123456"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    required
                                    autoFocus
                                    className="text-center text-2xl tracking-widest font-mono"
                                />
                                <p className="text-xs text-muted-foreground text-center">
                                    OTP sent to <strong>{email}</strong>
                                </p>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Verifying…" : "Verify OTP"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => { setOtp(""); setStep(1) }}
                                className="text-sm text-muted-foreground hover:underline text-center"
                            >
                                Didn't receive it? Resend OTP
                            </button>
                        </form>
                    )}

                    {/* ── Step 3: New Password ── */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="fp-new-password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="fp-new-password"
                                        type={showNewPw ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPw(!showNewPw)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Min 6 chars · uppercase · lowercase · number · special character
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fp-confirm-password">Confirm Password</Label>
                                <Input
                                    id="fp-confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Resetting…" : "Reset Password"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
