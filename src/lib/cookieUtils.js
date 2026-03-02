import Cookies from "js-cookie";

const USER_COOKIE_KEY = "user";

/** Save user object to a readable cookie for UI use (7-day expiry).
 *  The server issues a separate httpOnly `token` JWT cookie for auth. */
export function saveUser(userObj) {
    Cookies.set(USER_COOKIE_KEY, JSON.stringify(userObj), { expires: 7, sameSite: "Lax" });
}

/** Read and parse user object from cookie. Returns null if absent or invalid. */
export function getUser() {
    try {
        const raw = Cookies.get(USER_COOKIE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/** Remove the client-side user cookie (server clears httpOnly JWT via /api/logout) */
export function removeUser() {
    Cookies.remove(USER_COOKIE_KEY);
}

/** Call /api/me to verify the JWT token cookie on the server.
 *  Returns the verified user object, or null if session is invalid/expired. */
export async function verifySession() {
    try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json();

        if (data.user) {
            return data.user;
        }

        // Session explicitly null or guest — clear the client-side cookie if it exists
        Cookies.remove(USER_COOKIE_KEY);
        return null;
    } catch {
        return null;
    }
}

/** Call /api/logout to clear the httpOnly JWT token cookie on the server */
export async function serverLogout() {
    try {
        await fetch("/api/logout", { method: "POST", credentials: "include" });
    } catch {
        // ignore
    }
    Cookies.remove(USER_COOKIE_KEY);
}
