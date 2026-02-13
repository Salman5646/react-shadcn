"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva } from "class-variance-authority"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { PanelLeftIcon } from "lucide-react"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

const SidebarContext = React.createContext(null)

function useSidebar() {
    const context = React.useContext(SidebarContext)
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.")
    }

    return context
}

const SidebarProvider = React.forwardRef(({
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
}, ref) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
        (value) => {
            const openState = typeof value === "function" ? value(open) : value
            if (setOpenProp) {
                setOpenProp(openState)
            } else {
                _setOpen(openState)
            }

            document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        },
        [setOpenProp, open]
    )

    const toggleSidebar = React.useCallback(() => {
        return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (
                event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
                (event.metaKey || event.ctrlKey)
            ) {
                event.preventDefault()
                toggleSidebar()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo(
        () => ({
            state,
            open,
            setOpen,
            isMobile,
            openMobile,
            setOpenMobile,
            toggleSidebar,
        }),
        [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
        <SidebarContext.Provider value={contextValue}>
            <div
                data-slot="sidebar-wrapper"
                ref={ref}
                style={
                    {
                        "--sidebar-width": SIDEBAR_WIDTH,
                        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                        ...style,
                    }
                }
                className={cn(
                    "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </SidebarContext.Provider>
    )
})
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef(({
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    className,
    children,
    dir,
    ...props
}, ref) => {
    const sidebarContext = useSidebar()
    console.log("Sidebar context (comps):", sidebarContext) // Debugging context
    const { isMobile, state, setOpenMobile } = sidebarContext
    const openMobileState = sidebarContext.openMobile
    let sidebarWidth = "var(--sidebar-width)"

    if (state === "collapsed") {
        if (collapsible === "offcanvas") {
            sidebarWidth = "0"
        } else if (collapsible === "icon") {
            if (variant === "floating" || variant === "inset") {
                sidebarWidth = "calc(var(--sidebar-width-icon) + 1rem)"
            } else {
                sidebarWidth = "var(--sidebar-width-icon)"
            }
        }
    }


    if (collapsible === "none") {
        return (
            <div
                data-slot="sidebar"
                ref={ref}
                className={cn(
                    "bg-sidebar text-sidebar-foreground flex h-full flex-col",
                    className
                )}
                style={{
                    width: "var(--sidebar-width)",
                    "--sidebar-width": "16rem",
                }}
                {...props}
            >
                {children}
            </div>
        )
    }

    if (isMobile) {
        return (
            <Sheet open={openMobileState} onOpenChange={setOpenMobile} {...props}>
                <SheetContent
                    dir={dir}
                    data-sidebar="sidebar"
                    data-slot="sidebar"
                    data-mobile="true"
                    className="bg-sidebar text-sidebar-foreground w-[var(--sidebar-width)] p-0 [&>button]:hidden"
                    style={
                        {
                            "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
                        }
                    }
                    side={side}
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Sidebar</SheetTitle>
                        <SheetDescription>Displays the mobile sidebar.</SheetDescription>
                    </SheetHeader>
                    <div className="flex h-full w-full flex-col">{children}</div>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <div
            ref={ref}
            className="group peer text-sidebar-foreground hidden md:block"
            data-state={state}
            data-collapsible={state === "collapsed" ? collapsible : ""}
            data-variant={variant}
            data-side={side}
            data-slot="sidebar"
        >
            <div
                data-slot="sidebar-gap"
                className={cn(
                    "transition-[width] duration-200 ease-linear relative bg-transparent",
                    "group-data-[side=right]:rotate-180",
                    className
                )}
                style={{ width: sidebarWidth }}
            />
            <div
                data-slot="sidebar-container"
                data-side={side}
                className={cn(
                    "fixed inset-y-0 z-10 hidden h-svh transition-[left,right,width] duration-200 ease-linear md:flex",
                    side === "left"
                        ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
                        : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
                    // Adjust the padding for floating and inset variants.
                    variant === "floating" || variant === "inset"
                        ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
                        : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l",
                    className
                )}
                style={{ width: sidebarWidth }}
                {...props}
            >
                <div
                    data-sidebar="sidebar"
                    data-slot="sidebar-inner"
                    className="bg-sidebar group-data-[variant=floating]:ring-sidebar-border group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 flex size-full flex-col"
                >
                    {children}
                </div>
            </div>
        </div>
    )
})
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef(({
    className,
    onClick,
    ...props
}, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
        <Button
            data-sidebar="trigger"
            data-slot="sidebar-trigger"
            ref={ref}
            variant="ghost"
            size="icon-sm"
            className={cn(className)}
            onClick={(event) => {
                onClick?.(event)
                toggleSidebar()
            }}
            {...props}
        >
            <PanelLeftIcon className="cn-rtl-flip" />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef(({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
        <button
            data-sidebar="rail"
            data-slot="sidebar-rail"
            ref={ref}
            aria-label="Toggle Sidebar"
            tabIndex={-1}
            onClick={toggleSidebar}
            title="Toggle Sidebar"
            className={cn(
                "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2",
                "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
                "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
                "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
                "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
                "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
                className
            )}
            {...props}
        />
    )
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <main
            data-slot="sidebar-inset"
            ref={ref}
            className={cn(
                "bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 relative flex w-full flex-1 flex-col",
                className
            )}
            {...props}
        />
    )
})
SidebarInset.displayName = "SidebarInset"

const SidebarInput = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <Input
            data-slot="sidebar-input"
            data-sidebar="input"
            ref={ref}
            className={cn("bg-background h-8 w-full shadow-none", className)}
            {...props}
        />
    )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <div
            data-slot="sidebar-header"
            data-sidebar="header"
            ref={ref}
            className={cn("gap-2 p-2 flex flex-col", className)}
            {...props}
        />
    )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <div
            data-slot="sidebar-footer"
            data-sidebar="footer"
            ref={ref}
            className={cn("gap-2 p-2 flex flex-col", className)}
            {...props}
        />
    )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <Separator
            data-slot="sidebar-separator"
            data-sidebar="separator"
            ref={ref}
            className={cn("bg-sidebar-border mx-2 w-auto", className)}
            {...props}
        />
    )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <div
            data-slot="sidebar-content"
            data-sidebar="content"
            ref={ref}
            className={cn(
                "no-scrollbar gap-0 flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden",
                className
            )}
            {...props}
        />
    )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <div
            data-slot="sidebar-group"
            data-sidebar="group"
            ref={ref}
            className={cn(
                "p-2 relative flex w-full min-w-0 flex-col",
                className
            )}
            {...props}
        />
    )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef(({ className, render, ...props }, ref) => {
    return useRender({
        defaultTagName: "div",
        props: mergeProps(
            {
                className: cn(
                    "text-sidebar-foreground/70 ring-sidebar-ring h-8 rounded-md px-2 text-xs font-medium transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 flex shrink-0 items-center outline-hidden [&>svg]:shrink-0",
                    className
                ),
                ref,
            },
            props
        ),
        render,
        state: {
            slot: "sidebar-group-label",
            sidebar: "group-label",
        },
    })
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef(({ className, render, ...props }, ref) => {
    return useRender({
        defaultTagName: "button",
        props: mergeProps(
            {
                className: cn(
                    "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 w-5 rounded-md p-0 focus-visible:ring-2 [&>svg]:size-4 flex aspect-square items-center justify-center outline-hidden transition-transform [&>svg]:shrink-0 after:absolute after:-inset-2 md:after:hidden group-data-[collapsible=icon]:hidden",
                    className
                ),
                ref,
            },
            props
        ),
        render,
        state: {
            slot: "sidebar-group-action",
            sidebar: "group-action",
        },
    })
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <div
            data-slot="sidebar-group-content"
            data-sidebar="group-content"
            ref={ref}
            className={cn("text-sm w-full", className)}
            {...props}
        />
    )
})
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <ul
            data-slot="sidebar-menu"
            data-sidebar="menu"
            ref={ref}
            className={cn("gap-0 flex w-full min-w-0 flex-col", className)}
            {...props}
        />
    )
})
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <li
            data-slot="sidebar-menu-item"
            data-sidebar="menu-item"
            ref={ref}
            className={cn("group/menu-item relative", className)}
            {...props}
        />
    )
})
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
    "ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground gap-2 rounded-md p-2 text-left text-sm transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 data-active:font-medium peer/menu-button flex w-full items-center overflow-hidden outline-hidden group/menu-button disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                outline: "bg-background hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
            },
            size: {
                default: "h-8 text-sm",
                sm: "h-7 text-xs",
                lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const SidebarMenuButton = React.forwardRef(({
    render,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
}, ref) => {
    const { isMobile, state } = useSidebar()
    const comp = useRender({
        defaultTagName: "button",
        props: mergeProps(
            {
                className: cn(sidebarMenuButtonVariants({ variant, size }), className),
                ref,
            },
            props
        ),
        render: !tooltip ? render : TooltipTrigger,
        state: {
            slot: "sidebar-menu-button",
            sidebar: "menu-button",
            size,
            active: isActive,
        },
    })

    if (!tooltip) {
        return comp
    }

    if (typeof tooltip === "string") {
        tooltip = {
            children: tooltip,
        }
    }

    return (
        <Tooltip>
            {comp}
            <TooltipContent
                side="right"
                align="center"
                hidden={state !== "collapsed" || isMobile}
                {...tooltip}
            />
        </Tooltip>
    )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef(({
    className,
    render,
    showOnHover = false,
    ...props
}, ref) => {
    return useRender({
        defaultTagName: "button",
        props: mergeProps(
            {
                className: cn(
                    "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 aspect-square w-5 rounded-md p-0 peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 focus-visible:ring-2 [&>svg]:size-4 flex items-center justify-center outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden [&>svg]:shrink-0",
                    showOnHover &&
                    "peer-data-active/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 aria-expanded:opacity-100 md:opacity-0",
                    className
                ),
                ref,
            },
            props
        ),
        render,
        state: {
            slot: "sidebar-menu-action",
            sidebar: "menu-action",
        },
    })
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <div
            data-slot="sidebar-menu-badge"
            data-sidebar="menu-badge"
            ref={ref}
            className={cn(
                "text-sidebar-foreground peer-hover/menu-button:text-sidebar-accent-foreground peer-data-active/menu-button:text-sidebar-accent-foreground pointer-events-none absolute right-1 h-5 min-w-5 rounded-md px-1 text-xs font-medium peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 flex items-center justify-center tabular-nums select-none group-data-[collapsible=icon]:hidden",
                className
            )}
            {...props}
        />
    )
})
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeleton = React.forwardRef(({
    className,
    showIcon = false,
    ...props
}, ref) => {
    const [width] = React.useState(() => {
        return `${Math.floor(Math.random() * 40) + 50}%`
    })

    return (
        <div
            data-slot="sidebar-menu-skeleton"
            data-sidebar="menu-skeleton"
            ref={ref}
            className={cn("h-8 gap-2 rounded-md px-2 flex items-center", className)}
            {...props}
        >
            {showIcon && (
                <Skeleton
                    className="size-4 rounded-md"
                    data-sidebar="menu-skeleton-icon"
                />
            )}
            <Skeleton
                className="h-4 max-w-[var(--skeleton-width)] flex-1"
                data-sidebar="menu-skeleton-text"
                style={
                    {
                        "--skeleton-width": width,
                    }
                }
            />
        </div>
    )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

const SidebarMenuSub = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <ul
            data-slot="sidebar-menu-sub"
            data-sidebar="menu-sub"
            ref={ref}
            className={cn("border-sidebar-border mx-3.5 translate-x-px gap-1 border-l px-2.5 py-0.5 group-data-[collapsible=icon]:hidden flex min-w-0 flex-col", className)}
            {...props}
        />
    )
})
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <li
            data-slot="sidebar-menu-sub-item"
            data-sidebar="menu-sub-item"
            ref={ref}
            className={cn("group/menu-sub-item relative", className)}
            {...props}
        />
    )
})
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef(({
    render,
    size = "md",
    isActive = false,
    className,
    ...props
}, ref) => {
    return useRender({
        defaultTagName: "a",
        props: mergeProps(
            {
                className: cn(
                    "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground h-7 gap-2 rounded-md px-2 focus-visible:ring-2 data-[size=md]:text-sm data-[size=sm]:text-xs [&>svg]:size-4 flex min-w-0 -translate-x-px items-center overflow-hidden outline-hidden group-data-[collapsible=icon]:hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:shrink-0",
                    className
                ),
                ref,
            },
            props
        ),
        render,
        state: {
            slot: "sidebar-menu-sub-button",
            sidebar: "menu-sub-button",
            size,
            active: isActive,
        },
    })
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
}