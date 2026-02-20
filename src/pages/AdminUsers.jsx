import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ChevronLeft, Trash2, ShieldCheck, ShieldOff, RefreshCw, Users } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Navbar } from "../comps/Navbar"

export function AdminUsers() {
    const navigate = useNavigate();
    const savedUser = JSON.parse(localStorage.getItem("user"));
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Guard: only admins
    useEffect(() => {
        if (!savedUser || savedUser.role !== "admin") {
            toast.error("Access denied. Admin only.");
            navigate("/");
            return;
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users", {
                headers: { "x-admin-id": savedUser.id },
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
            } else {
                toast.error(data.message || "Failed to fetch users");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId, userName) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: { "x-admin-id": savedUser.id },
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`${userName} deleted successfully`);
                setUsers(users.filter((u) => u._id !== userId));
            } else {
                toast.error(data.message || "Failed to delete user");
            }
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    const handleToggleRole = async (userId, currentRole) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        try {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-id": savedUser.id,
                },
                body: JSON.stringify({ role: newRole }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Role updated to ${newRole}`);
                setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
            } else {
                toast.error(data.message || "Failed to update role");
            }
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    if (!savedUser || savedUser.role !== "admin") return null;

    return (
        <>
            <Navbar />
            <div className="p-4 md:p-8 flex-1 bg-black min-h-screen">
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/" className="text-white hover:text-gray-300 transition-colors">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        Users
                    </h1>
                    <Button variant="outline" size="sm" onClick={fetchUsers} className="ml-auto">
                        <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                    </Button>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Users ({users.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-400 border-t-white"></div>
                                </div>
                            ) : users.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10">No users found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left">
                                                <th className="py-3 px-2 font-medium">#</th>
                                                <th className="py-3 px-2 font-medium">Name</th>
                                                <th className="py-3 px-2 font-medium">Email</th>
                                                <th className="py-3 px-2 font-medium">Phone</th>
                                                <th className="py-3 px-2 font-medium">City</th>
                                                <th className="py-3 px-2 font-medium">Country</th>
                                                <th className="py-3 px-2 font-medium">Role</th>
                                                <th className="py-3 px-2 font-medium">Auth</th>
                                                <th className="py-3 px-2 font-medium text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user, index) => (
                                                <tr key={user._id} className="border-b hover:bg-muted/50 transition-colors">
                                                    <td className="py-3 px-2 text-muted-foreground">{index + 1}</td>
                                                    <td className="py-3 px-2 font-medium">{user.name || "—"}</td>
                                                    <td className="py-3 px-2">{user.email}</td>
                                                    <td className="py-3 px-2">{user.phone || "—"}</td>
                                                    <td className="py-3 px-2">{user.city || "—"}</td>
                                                    <td className="py-3 px-2">{user.country || "—"}</td>
                                                    <td className="py-3 px-2">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.role === "admin"
                                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                                            }`}>
                                                            {user.role || "user"}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {user.googleId ? "Google" : "Email"}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {/* Toggle Role */}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                title={user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                                                                onClick={() => handleToggleRole(user._id, user.role || "user")}
                                                                disabled={user._id === savedUser.id}
                                                            >
                                                                {user.role === "admin" ? (
                                                                    <ShieldOff className="h-4 w-4 text-yellow-500" />
                                                                ) : (
                                                                    <ShieldCheck className="h-4 w-4 text-green-500" />
                                                                )}
                                                            </Button>
                                                            {/* Delete */}
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        disabled={user._id === savedUser.id}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete {user.name}?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will permanently delete this user account. This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDelete(user._id, user.name)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-400 border-t-white"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <p className="text-center text-gray-400 py-10">No users found.</p>
                    ) : (
                        users.map((user) => (
                            <Card key={user._id} className="bg-white text-black">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-lg">{user.name || "No Name"}</h3>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.role === "admin"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                            }`}>
                                            {user.role || "user"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                                        <div>
                                            <span className="block font-medium text-black">Phone</span>
                                            {user.phone || "—"}
                                        </div>
                                        <div>
                                            <span className="block font-medium text-black">Location</span>
                                            {user.city ? `${user.city}, ${user.country}` : "—"}
                                        </div>
                                        <div>
                                            <span className="block font-medium text-black">Auth</span>
                                            {user.googleId ? "Google" : "Email"}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggleRole(user._id, user.role || "user")}
                                            disabled={user._id === savedUser.id}
                                            className="text-xs text-black border-gray-200"
                                        >
                                            {user.role === "admin" ? (
                                                <>
                                                    <ShieldOff className="h-3 w-3 mr-1 text-yellow-600" /> Demote
                                                </>
                                            ) : (
                                                <>
                                                    <ShieldCheck className="h-3 w-3 mr-1 text-green-600" /> Promote
                                                </>
                                            )}
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={user._id === savedUser.id}
                                                    className="text-xs bg-red-600 hover:bg-red-700"
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-white text-black">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete {user.name}?</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-gray-500">
                                                        This will permanently delete this user account. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(user._id, user.name)}
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}
