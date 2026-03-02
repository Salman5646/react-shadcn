"use client"
import { Navbar } from "./comps/Navbar"
import { useState, useEffect } from "react";
import { Footer } from "./comps/Footer"
import { Cards } from "./comps/Cards"
import { MOCK_PRODUCTS } from "./data/mockProducts";
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Login } from "./comps/Login";
import { Toaster } from "sonner";
import Cart from "./comps/Cart";
import { Signup } from "./comps/Signup";
import { CompleteProfile } from "./comps/CompleteProfile";
import { AdminUsers } from "./pages/AdminUsers";
import { AccountSettings } from "./pages/AccountSettings";
import ProductPage from "./pages/ProductPage";
import { ForgotPassword } from "./pages/ForgotPassword";
import Wishlist from "./pages/Wishlist";
export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/account" element={<AccountSettings />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
      <Toaster
        richColors
        closeButton
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'inherit',
          },
          className: "dark:!bg-zinc-900/80 dark:!border-zinc-800 dark:!text-white",
          success: {
            style: {
              borderLeft: '4px solid #22c55e',
            }
          },
          error: {
            style: {
              borderLeft: '4px solid #ef4444',
            }
          },
          info: {
            style: {
              borderLeft: '4px solid #3b82f6',
            }
          }
        }}
      />
    </>
  )
}
