import React, { useState, useEffect, useCallback } from "react"
import { Bell, Check, CheckCheck, Trash2, Info, PartyPopper, AlertTriangle, Package } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "@/lib/notificationService"

const TYPE_ICONS = {
    info: Info,
    success: PartyPopper,
    warning: AlertTriangle,
    order: Package,
}

const TYPE_COLORS = {
    info: "text-blue-500",
    success: "text-emerald-500",
    warning: "text-amber-500",
    order: "text-violet-500",
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState([])
    const [open, setOpen] = useState(false)

    const load = useCallback(async () => {
        const data = await fetchNotifications()
        setNotifications(data)
    }, [])

    useEffect(() => {
        load()
        const interval = setInterval(load, 60000)
        return () => clearInterval(interval)
    }, [load])

    const unreadCount = notifications.filter((n) => !n.read).length

    const handleMarkRead = async (id) => {
        await markAsRead(id)
        setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        )
    }

    const handleMarkAllRead = async () => {
        const updated = await markAllAsRead()
        setNotifications(updated)
    }

    const handleDelete = async (id) => {
        await deleteNotification(id)
        setNotifications((prev) => prev.filter((n) => n._id !== id))
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer text-muted-foreground hover:bg-accent hover:text-foreground transition-colors outline-none"
                    title="Notifications"
                >
                    <Bell className="h-4 w-4" />
                    Notifications
                    {unreadCount > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-80 sm:w-96 p-0 rounded-xl shadow-xl border border-border"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            <CheckCheck className="h-3 w-3" /> Mark all read
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-30" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((n) => {
                            const Icon = TYPE_ICONS[n.type] || Info
                            const color = TYPE_COLORS[n.type] || "text-blue-500"
                            return (
                                <div
                                    key={n._id}
                                    className={`group flex gap-3 px-4 py-3 border-b border-border/50 last:border-0 transition-colors ${n.read
                                        ? "opacity-60 bg-transparent"
                                        : "bg-primary/5"
                                        }`}
                                >
                                    <div className={`mt-0.5 flex-shrink-0 ${color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium leading-tight truncate">
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                                            {timeAgo(n.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        {!n.read && (
                                            <button
                                                onClick={() => handleMarkRead(n._id)}
                                                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check className="h-3 w-3" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(n._id)}
                                            className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export function NotificationCount() {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const load = async () => {
            const data = await fetchNotifications()
            setCount(data.filter((n) => !n.read).length)
        }
        load()
        const interval = setInterval(load, 60000)
        return () => clearInterval(interval)
    }, [])

    if (count === 0) return null

    return (
        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
        </span>
    )
}
