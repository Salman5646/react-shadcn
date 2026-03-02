import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { Search } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

export function Searchbar({ searchTerm, setSearchTerm, resultCount }) {
    const { open } = useSidebar();

    return (
        <InputGroup className={`max-w-56 ${open ? "md:max-w-md" : "md:max-w-xl"} bg-muted/40 border-border dark:border-white/20`}>
            <InputGroupInput
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <InputGroupAddon>
                <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">{resultCount} results</InputGroupAddon>
        </InputGroup>
    )
}
