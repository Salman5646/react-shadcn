import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Trash2, Edit, Plus, RefreshCw, Box } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Navbar } from "../comps/Navbar"

export function AdminProducts() {
    const navigate = useNavigate();
    const savedUser = JSON.parse(localStorage.getItem("user"));
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openAdd, setOpenAdd] = useState(false);

    // Form state for adding/editing
    const [formData, setFormData] = useState({
        product_name: "",
        product_description: "",
        price: "",
        category: "",
        product_image: "",
    });

    // Guard: only admins
    useEffect(() => {
        if (!savedUser || savedUser.role !== "admin") {
            toast.error("Access denied. Admin only.");
            navigate("/");
            return;
        }
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            if (res.ok) {
                setProducts(data);
            } else {
                toast.error("Failed to fetch products");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId, productName) => {
        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success(`${productName} deleted successfully`);
                setProducts(products.filter((p) => p._id !== productId));
            } else {
                toast.error("Failed to delete product");
            }
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Product added successfully");
                setProducts([...products, data]);
                setOpenAdd(false);
                setFormData({
                    product_name: "",
                    product_description: "",
                    price: "",
                    category: "",
                    product_image: "",
                });
            } else {
                toast.error(data.message || "Failed to add product");
            }
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    if (!savedUser || savedUser.role !== "admin") return null;

    return (<>

        <Navbar />
        <div className="p-4 md:p-8 flex-1 bg-black min-h-screen">
            <div className="flex items-center gap-4 mb-6 text-white">
                <Link to="/" className="text-white hover:text-gray-300 transition-colors">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Box className="h-6 w-6" /> Admin — Products Management
                </h1>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" size="sm" className="text-black" onClick={fetchProducts}>
                        <RefreshCw className="h-4 w-4 mr-1 text-black" /> Refresh
                    </Button>
                    <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white border-none">
                                <Plus className="h-4 w-4 mr-1" /> Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-white text-black border-gray-200">
                            <DialogHeader>
                                <DialogTitle>Add New Product</DialogTitle>
                                <DialogDescription className="text-gray-500">
                                    Fill in the details for the new product.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddProduct} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input id="name" value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} required className="border-gray-300" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required className="border-gray-300" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="border-gray-300" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="image">Image URL</Label>
                                    <Input id="image" value={formData.product_image} onChange={(e) => setFormData({ ...formData, product_image: e.target.value })} required className="border-gray-300" placeholder="https://..." />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Textarea id="desc" value={formData.product_description} onChange={(e) => setFormData({ ...formData, product_description: e.target.value })} required className="border-gray-300" rows={3} />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="w-full">Save Product</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="bg-white border-gray-800 text-black">
                <CardHeader>
                    <CardTitle>All Products ({products.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-400 border-t-white"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <p className="text-center text-muted-foreground py-10">No products found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-black">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left text-gray-900 font-semibold">
                                        <th className="py-3 px-2 font-medium">Image</th>
                                        <th className="py-3 px-2 font-medium">Name</th>
                                        <th className="py-3 px-2 font-medium">Category</th>
                                        <th className="py-3 px-2 font-medium">Price</th>
                                        <th className="py-3 px-2 font-medium text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                                            <td className="py-3 px-2">
                                                <img src={product.product_image} alt={product.product_name} className="h-10 w-10 object-cover rounded" />
                                            </td>
                                            <td className="py-3 px-2 font-medium text-black">{product.product_name}</td>
                                            <td className="py-3 px-2 text-gray-600">{product.category}</td>
                                            <td className="py-3 px-2 text-black">${product.price}</td>
                                            <td className="py-3 px-2">
                                                <div className="flex items-center justify-center gap-1">
                                                    {/* Delete */}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="hover:bg-red-900/20 hover:text-red-500"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete {product.product_name}?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-gray-400">
                                                                    This will permanently delete this product. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(product._id, product.product_name)}
                                                                    className="bg-red-600 hover:bg-red-700 text-white"
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
    </>
    )
}
