import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Footer } from "../comps/Footer"
import { Navbar } from "../comps/Navbar"
import { ShoppingBag, Truck, Shield, HeadphonesIcon, Star, Users, Package } from "lucide-react"

export function About() {
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

  const stats = [
    { icon: Package, value: "10k+", label: "Products delivered across India" },
    { icon: Users, value: "5k+", label: "Happy customers and counting" },
    { icon: Star, value: "4.8★", label: "Average customer rating" },
  ];

  const features = [
    {
      icon: ShoppingBag,
      title: "Curated Products",
      description: "Every product on Shopr is handpicked and quality-tested before it reaches our catalog. We only sell what we'd buy ourselves."
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "We process orders within 24 hours and partner with premium logistics providers to deliver your products safely and on time."
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Your data and payments are protected with industry-standard encryption. Shop with confidence knowing your information is safe."
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Support",
      description: "Our dedicated support team is available around the clock to help with orders, returns, or any questions you might have."
    },
  ];

  return (
    <>
      <Navbar />
      <div className="bg-white dark:bg-black text-black dark:text-white min-h-screen py-16 px-6 md:px-8 transition-colors duration-300">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-4 dark:text-white dark:border-white">About Shopr</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Your Premium <span className="text-primary">Shopping</span> Destination
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Shopr was built with a simple mission — to make online shopping effortless, secure, and enjoyable.
            We bring you curated products with fast delivery and unbeatable customer service.
          </p>
        </div>

        <Separator className="my-12 bg-gray-200 dark:bg-white/10 max-w-4xl mx-auto" />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-center">
                <CardHeader className="pb-2">
                  <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <CardTitle className="text-3xl font-extrabold">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Shopr?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Values */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold mb-4">Our Core Values</h2>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex gap-3 text-sm">
                <span className="text-primary mt-0.5 shrink-0">✦</span>
                <span><strong className="text-foreground">Quality First:</strong> We test every item before it reaches our warehouse. No exceptions.</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-primary mt-0.5 shrink-0">✦</span>
                <span><strong className="text-foreground">Customer Obsession:</strong> Your satisfaction is our only metric for success.</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-primary mt-0.5 shrink-0">✦</span>
                <span><strong className="text-foreground">Transparency:</strong> No hidden costs, no surprises — just honest pricing and real reviews.</span>
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-primary mt-0.5 shrink-0">✦</span>
                <span><strong className="text-foreground">Community:</strong> We build Shopr for real people. Your feedback shapes every feature we build.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}