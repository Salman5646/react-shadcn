import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { Search } from "lucide-react"

export function Searchbar({ searchTerm, setSearchTerm, resultCount }) {
    return (
        <InputGroup className="max-w-64 md:max-w-xl bg-white dark:border-white">
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
