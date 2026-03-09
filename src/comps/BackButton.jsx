import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export const BackButton = ({ to, label = "Back", onClick, className }) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        if (onClick) {
            onClick(e);
        } else if (!to) {
            e.preventDefault();
            navigate(-1);
        }
    };

    const baseClasses = "inline-flex items-center text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group w-max";

    if (to) {
        return (
            <Link to={to} className={cn(baseClasses, className)} onClick={onClick}>
                <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
                {label}
            </Link>
        );
    }

    return (
        <button onClick={handleClick} className={cn(baseClasses, className)}>
            <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
            {label}
        </button>
    );
};
