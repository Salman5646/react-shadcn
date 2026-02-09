"use client"
import { Navbar } from "../comps/Navbar"
import { useState, useEffect } from "react";
import { Footer } from "../comps/Footer"
import { Cards } from "../comps/Cards"
import { ProductSkeleton } from "../comps/ProductSkeleton" // Import your new skeleton

export function Home() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // 1. Add loading state

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
                }));
                setOrders(formattedData);
                setIsLoading(false); // 2. Turn off loading when data arrives
            })
            .catch((err) => {
                console.error("API Error:", err);
                setIsLoading(false);
            });
    }, []);

    return (
        <>
            <Navbar />
            <div className="min-h-screen">
                {/* 3. Updated Grid: 3 columns on mobile (grid-cols-3), 6 on desktop (lg:grid-cols-6) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                    {isLoading
                        ? // 4. Show 12 Skeletons while loading
                        Array.from({ length: 12 }).map((_, index) => (
                            <ProductSkeleton key={index} />
                        ))
                        : // 5. Show real Cards once loaded
                        orders.map((product, index) => (
                            <Cards
                                key={index}
                                title={product.product_name}
                                desc={product.product_description}
                                img={product.product_image}
                                badge={product.category}
                                variant="default"
                            />
                        ))
                    }
                </div>
            </div>
            <Footer />
        </>
    )
}