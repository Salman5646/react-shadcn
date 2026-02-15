import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { ChevronLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
export function Signup() {
    return (
        /* --- Wrapper Container --- */
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
                                <TabsTrigger value="signup" className="flex-1" asChild><Link to="/signup">Sign Up</Link>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
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
                                <Input id="password" type="password" required />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="submit" className="w-full">
                        Sign up
                    </Button>
                    <Button variant="outline" className="w-full">
                        Sign up with Google
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}