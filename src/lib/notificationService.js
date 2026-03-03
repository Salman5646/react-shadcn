const API_BASE = "/api/notifications";

export async function fetchNotifications() {
    const res = await fetch(API_BASE, { credentials: "include" });
    if (!res.ok) return [];
    return res.json();
}

export async function markAsRead(id) {
    const res = await fetch(`${API_BASE}/${id}/read`, {
        method: "PUT",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to mark notification as read");
    return res.json();
}

export async function markAllAsRead() {
    const res = await fetch(`${API_BASE}/read-all`, {
        method: "PUT",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to mark all as read");
    return res.json();
}

export async function deleteNotification(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete notification");
    return res.json();
}
