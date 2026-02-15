import { Link } from "react-router-dom";
import { CircleUser } from "lucide-react";
import { useSidebar, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from "@/components/ui/sidebar";

export function AppSidebar() {
    return (
        <Sidebar collapsible="offcanvas">
            <SidebarHeader className="border-b border-sidebar-border pb-4">
                <div className="flex items-center gap-3 px-2 pt-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold">
                        S
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm leading-none">Salman Shaikh</span>
                        <span className="text-xs text-muted-foreground">Premium Member</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {/* Main Navigation Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive>
                                    <span className="flex items-center gap-2"><Link to="/">🏠 Home</Link></span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Check your orders">
                                    <span className="flex items-center gap-2">📦 My Orders</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <span className="flex items-center gap-2">❤️ Wishlist</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                {/* Categories Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Categories</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton>✨ Electronics</SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>💎 Jewelry</SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>👕 Men's Clothing</SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>👗 Women's Clothing</SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                {/* Settings Group */}
                <SidebarGroup>
                    <SidebarGroupLabel>Settings</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton>⚙️ Account Settings</SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton className="text-red-500 hover:text-red-600">
                                    🚪 Logout
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-4">
                <div className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                    v1.0.4 - 2026 Build
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}

export function AccountButton() {
    const { toggleSidebar } = useSidebar();

    return (
        <button onClick={toggleSidebar} className="fixed bottom-4 left-2 z-50">
            <CircleUser
                size={40}
                className="dark:bg-white dark:text-black bg-black text-white rounded-full p-2 border-gray-200"
            />
        </button>
    );
}
