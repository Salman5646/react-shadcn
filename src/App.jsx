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

export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
      <Toaster />
    </>
  )
}
