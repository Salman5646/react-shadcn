"use client"
import { Navbarwithsearch } from "../comps/Navbarwithsearch"
import { useState, useEffect } from "react";
import { Footer } from "../comps/Footer"
import { Cards } from "../comps/Cards"
import { ProductSkeleton } from "../comps/ProductSkeleton" // Import your new skeleton
import { useSearchParams } from "react-router-dom"

export function Home() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // 1. Add loading state
    const [searchParams] = useSearchParams();
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
    // Initialize search term from URL safely
    const initialSearch = searchParams ? searchParams.get("q") : "";
    const [searchTerm, setSearchTerm] = useState(initialSearch || "");

    useEffect(() => {
        setIsLoading(true); // Ensure loading starts as true
        fetch("https://fakestoreapi.com/products")
            .then((res) => res.json())
            .then((data) => {
                const formattedData = data.map(item => ({
                    product_name: item.title,
                    product_description: item.description,
                    product_image: item.image,
                    category: item.category,
                    price: item.price,
                }));
                setOrders(formattedData);
                setIsLoading(false); // 2. Turn off loading when data arrives
            })
            .catch((err) => {
                console.error("API Error:", err);
                setIsLoading(false);
            });
    }, []);

    const filteredOrders = orders.filter(order =>
        order.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={darkMode ? "dark" : ""}>
            {/* Main wrapper with background transition */}
            <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">

                <Navbarwithsearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    resultCount={filteredOrders.length}
                    toggleDarkMode={toggleDarkMode}
                    darkMode={darkMode}
                />




                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                    {isLoading ? (
                        Array.from({ length: 12 }).map((_, index) => (
                            <ProductSkeleton key={index} />
                        ))
                    ) : filteredOrders.length > 0 ? (
                        filteredOrders.map((product, index) => (
                            <Cards
                                key={index}
                                item={product}
                                variant="default"
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">
                                No products found matching "{searchTerm}"
                            </p>
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </div>
    );
}