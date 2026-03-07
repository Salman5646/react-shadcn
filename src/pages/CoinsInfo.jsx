import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, AccountButton } from "../comps/AppSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Coins, Flame, Gift, ShoppingCart, Info, ChevronLeft } from "lucide-react"
import { Link } from "react-router-dom"

export function CoinsInfo() {
    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-8 transition-colors duration-300">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Navigation */}
                        <Link to="/" className="inline-flex items-center gap-2 mb-4 text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                            <span>Keep Shopping</span>
                        </Link>

                        {/* Header Section */}
                        <div className="text-center space-y-4 py-8">
                            <div className="inline-flex items-center justify-center p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4 ring-8 ring-yellow-50 dark:ring-yellow-900/10">
                                <Coins className="w-12 h-12 text-yellow-500" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                Shopr Coins
                            </h1>
                            <p className="text-lg text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">
                                Earn coins every day and use them to pay for your favorite products.
                            </p>
                        </div>

                        {/* How it Works Grid */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <Card className="border-none shadow-lg dark:bg-zinc-900/50 hover:-translate-y-1 transition-transform duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                        <Gift className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <CardTitle>Welcome Bonus</CardTitle>
                                    <CardDescription>Get started instantly</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 dark:text-zinc-300">
                                        Every new user automatically receives <strong className="text-blue-600 dark:text-blue-400">100 coins</strong> just for signing up. No strings attached!
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-lg dark:bg-zinc-900/50 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                                        <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <CardTitle>Daily Login Streak</CardTitle>
                                    <CardDescription>Consistency pays off</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 dark:text-zinc-300">
                                        Log in every day to earn <strong className="text-orange-600 dark:text-orange-400">50 coins</strong> daily. Hit a 7-day log in streak to unlock a <strong className="text-orange-600 dark:text-orange-400">100 coin bonus</strong>!
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-lg dark:bg-zinc-900/50 hover:-translate-y-1 transition-transform duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                        <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <CardTitle>Pay with Coins</CardTitle>
                                    <CardDescription>Save real money</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 dark:text-zinc-300">
                                        During checkout, you can use your coin balance to pay for your cart entirely. 1 coin equals $1 towards your purchase amount.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* FAQ / Rules */}
                        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-zinc-800 mt-12">
                            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                                <Info className="text-blue-500" /> Need to know
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-lg mb-2">What happens if I miss a day?</h3>
                                    <p className="text-slate-500 dark:text-zinc-400">
                                        If you break your consecutive daily login streak, your streak counter resets back to Day 1. Don't worry, you'll still earn the base 50 coins the next time you log in!
                                    </p>
                                </div>
                                <Separator className="dark:bg-zinc-800" />
                                <div>
                                    <h3 className="font-bold text-lg mb-2">Can I split payments between coins and card?</h3>
                                    <p className="text-slate-500 dark:text-zinc-400">
                                        Currently, coin payments must cover the full amount of your cart. If your cart total is $120, you must have at least 120 coins to checkout using coins.
                                    </p>
                                </div>
                                <Separator className="dark:bg-zinc-800" />
                                <div>
                                    <h3 className="font-bold text-lg mb-2">Do coins expire?</h3>
                                    <p className="text-slate-500 dark:text-zinc-400">
                                        Nope! Coins are yours forever until you spend them. Build up your balance to purchase big-ticket items completely free.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <AccountButton />
            </SidebarInset>
        </SidebarProvider>
    )
}
