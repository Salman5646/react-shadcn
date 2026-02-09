import {
    AlertDialog as UIAlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

// Add 'title' to your props destructuring
export function AlertDialog({ trigger, title }) {
    
    const handleAddToCart = () => {
        // Get current time in a readable format (e.g., 10:30 PM)
        const currentTime = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        toast(`${title} added successfully`, {
            description: `Added on ${new Date().toLocaleDateString()} at ${currentTime}`,
            action: {
                label: "Close", // Changed 'Done' to 'Close' as requested
                onClick: () => console.log("Toast closed"),
            },
        });
    };

    return (
        <UIAlertDialog>
            <AlertDialogTrigger asChild>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-950 text-white border-zinc-800">
                <AlertDialogHeader>
                    <AlertDialogTitle>Add to Cart?</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                        Do you want to add **{title}** to your shopping session?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-zinc-800 border-none">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleAddToCart}>
                        Confirm
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </UIAlertDialog>
    );
}
