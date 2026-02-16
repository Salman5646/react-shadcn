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

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("user", JSON.stringify(data.user));
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
        <div className="relative flex min-h-screen w-full items-center justify-center p-4 bg-gray-950">
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
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
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
                    <Button variant="outline" className="w-full">
                        Login with Google
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}