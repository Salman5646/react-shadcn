import { toast } from "sonner";
import { verifySession } from "@/lib/cookieUtils";

let isToggling = false;

/** Fetch user's wishlist from the server */
export async function getWishlist(user) {
    const verifiedUser = user || await verifySession();
    if (!verifiedUser) return [];
    try {
        const res = await fetch("/api/wishlist", { credentials: "include" });
        if (res.ok) {
            return await res.json();
        }
        // Silently return empty for auth errors (401/403/404) — guest users
        return [];
    } catch (err) {
        return [];
    }
}

/** Toggle product in wishlist (Add if not present, Remove if present) */
export async function toggleWishlist(product, user, isInWishlist) {
    if (isToggling) return null; // Prevent rapid double-clicks

    const verifiedUser = user || await verifySession();
    if (!verifiedUser) {
        toast.error("Please login to manage your wishlist");
        return null;
    }

    isToggling = true;

    try {
        const method = isInWishlist ? "DELETE" : "POST";
        const url = isInWishlist ? `/api/wishlist/${product._id}` : "/api/wishlist";
        const body = isInWishlist ? undefined : JSON.stringify({ productId: product._id });

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body,
            credentials: "include"
        });

        if (res.ok) {
            const updatedWishlist = await res.json();
            toast.success(isInWishlist
                ? `${product.product_name} removed from wishlist`
                : `${product.product_name} added to wishlist`
            );
            window.dispatchEvent(new Event("wishlistUpdate"));
            return updatedWishlist;
        } else {
            const data = await res.json().catch(() => ({}));
            // If item is already in wishlist, just refresh and don't show error
            if (data.message === "Item already in wishlist") {
                const refreshed = await getWishlist(verifiedUser);
                return refreshed;
            }
            toast.error(data.message || "Failed to update wishlist");
            return null;
        }
    } catch (err) {
        toast.error("An error occurred while updating wishlist");
        return null;
    } finally {
        isToggling = false;
    }
}

