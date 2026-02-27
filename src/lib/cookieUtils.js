import Cookies from "js-cookie";

const USER_COOKIE_KEY = "user";

/** Save user object to a regular cookie for immediate UI use (7-day expiry).
 *  The tamper-proof httpOnly signature cookie (user_sig) is set by the server. */
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

/** Remove the client-side user cookie (server clears httpOnly sig via /api/logout) */
export function removeUser() {
    Cookies.remove(USER_COOKIE_KEY);
}

/** Call /api/me to verify the session against the httpOnly signature cookie.
 *  Returns the verified user object, or null if session is invalid/tampered. */
export async function verifySession() {
    try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (res.ok) {
            const data = await res.json();
            return data.user;
        }
        // Session invalid — clear the client-side cookie
        Cookies.remove(USER_COOKIE_KEY);
        return null;
    } catch {
        return null;
    }
}

/** Call /api/logout to clear httpOnly cookies on the server */
export async function serverLogout() {
    try {
        await fetch("/api/logout", { method: "POST", credentials: "include" });
    } catch {
        // ignore
    }
    Cookies.remove(USER_COOKIE_KEY);
}
