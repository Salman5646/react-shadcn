import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function ProductDetails({ item, children }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="text-black w-[300px] md:w-[500px]">
                <DialogHeader>
                    <DialogTitle>{item.product_name}</DialogTitle>

                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-48 object-contain rounded-md bg-white p-2"
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-black capitalize">{item.category}</span>
                        <span className="text-xl text-black font-bold">${item.price}</span>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto pr-2">
                        <p className="text-sm leading-relaxed text-black dark:text-gray-300">
                            {item.product_description}
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
