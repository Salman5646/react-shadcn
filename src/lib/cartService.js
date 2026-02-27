import { verifySession } from "@/lib/cookieUtils";

// ── Helper: check if user is logged in ──
let _cachedUser = undefined; // undefined = not checked yet
export async function getLoggedInUser() {
    _cachedUser = await verifySession();
    return _cachedUser;
}

export function getCachedUser() {
    return _cachedUser;
}

export function setCachedUser(user) {
    _cachedUser = user;
}

// ── localStorage helpers (for guests) ──

function getLocalCart() {
    try {
        return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
        return [];
    }
}

function setLocalCart(items) {
    localStorage.setItem("cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cartUpdate"));
}

// ── Unified cart service ──

export async function getCart(user) {
    if (user) {
        try {
            const res = await fetch("/api/cart", { credentials: "include" });
            if (res.ok) return await res.json();
        } catch { /* fall through */ }
        return [];
    }
    return getLocalCart();
}

export async function addToCart(product, user) {
    if (user) {
        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    productId: product._id,
                    quantity: 1,
                }),
            });
            if (res.ok) {
                const items = await res.json();
                window.dispatchEvent(new Event("cartUpdate"));
                return items;
            }
        } catch { /* fall through */ }
        return [];
    }

    // Guest: localStorage
    const cart = getLocalCart();
    const existingIndex = cart.findIndex(item => item.product_name === product.product_name);
    if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    setLocalCart(cart);
    return cart;
}

export async function updateQuantity(product, quantity, user) {
    if (user) {
        try {
            const productId = product._id || product.productId;
            const res = await fetch(`/api/cart/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ quantity }),
            });
            if (res.ok) {
                const items = await res.json();
                window.dispatchEvent(new Event("cartUpdate"));
                return items;
            }
        } catch { /* fall through */ }
        return [];
    }

    // Guest: localStorage
    const cart = getLocalCart();
    const idx = cart.findIndex(item => item.product_name === product.product_name);
    if (idx > -1) {
        if (quantity < 1) {
            cart.splice(idx, 1);
        } else {
            cart[idx].quantity = quantity;
        }
    }
    setLocalCart(cart);
    return cart;
}

export async function removeFromCart(product, index, user) {
    if (user) {
        try {
            const productId = product._id || product.productId;
            const res = await fetch(`/api/cart/${productId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                const items = await res.json();
                window.dispatchEvent(new Event("cartUpdate"));
                return items;
            }
        } catch { /* fall through */ }
        return [];
    }

    // Guest: localStorage
    const cart = getLocalCart();
    const updatedCart = cart.filter((_, i) => i !== index);
    setLocalCart(updatedCart);
    return updatedCart;
}

export async function clearCart(user) {
    if (user) {
        try {
            await fetch("/api/cart", {
                method: "DELETE",
                credentials: "include",
            });
            window.dispatchEvent(new Event("cartUpdate"));
        } catch { /* ignore */ }
        return;
    }

    // Guest: localStorage
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdate"));
}

// Merge guest cart into DB cart on login
export async function mergeGuestCart() {
    const guestCart = getLocalCart();
    if (guestCart.length === 0) return;

    try {
        const res = await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ items: guestCart }),
        });
        if (res.ok) {
            // Clear guest cart after successful merge
            localStorage.removeItem("cart");
            window.dispatchEvent(new Event("cartUpdate"));
        }
    } catch { /* ignore */ }
}
