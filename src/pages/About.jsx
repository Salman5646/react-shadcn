import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Footer } from "../comps/Footer"
import { Navbar } from "../comps/Navbar"

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

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <>
      <Navbar />
      <div className="bg-black text-white min-h-screen py-16 px-8">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-4 text-white border-white">Our Journey</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Innovation Meets <span className="text-white">E-Commerce</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We started with a simple mission: to provide high-quality tech gear with
            unmatched delivery speed. Today, we serve thousands of happy customers.
          </p>
        </div>

        <Separator className="my-12 bg-white/10" />

        {/* Stats/Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle className="text-white text-3xl">10k+</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Products delivered to doorsteps across the country.</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle className="text-white text-3xl">24/7</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Dedicated support team to help you with every order.</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle className="text-white text-3xl">100%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Genuine products sourced directly from manufacturers.</p>
            </CardContent>
          </Card>
        </div>

        {/* Story Section */}
        <div className="mt-20 max-w-3xl mx-auto bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
          <h2 className="text-2xl font-bold mb-4">Our Core Values</h2>
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-white">✔</span>
              <strong>Quality First:</strong> We test every item before it leaves our warehouse.
            </li>
            <li className="flex gap-3">
              <span className="text-white">✔</span>
              <strong>Customer Obsession:</strong> Your satisfaction is our only metric for success.
            </li>
            <li className="flex gap-3">
              <span className="text-white">✔</span>
              <strong>Transparency:</strong> No hidden costs, just honest pricing.
            </li>
          </ul>
        </div>
      </div>
      <Footer />
    </>
  )
}