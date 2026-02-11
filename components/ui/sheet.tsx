import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const SheetContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({ open: false, onOpenChange: () => {} })

function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(open)
  const isOpen = open !== undefined ? open : internalOpen
  const handleOpenChange = onOpenChange || setInternalOpen

  return (
    <SheetContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </SheetContext.Provider>
  )
}

interface SheetTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    const { onOpenChange } = React.useContext(SheetContext)
    
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        ref,
        onClick: () => onOpenChange(true),
      } as any)
    }

    return (
      <button ref={ref} onClick={() => onOpenChange(true)} {...props}>
        {children}
      </button>
    )
  }
)
SheetTrigger.displayName = "SheetTrigger"

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right" | "top" | "bottom"
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, children, side = "right", ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(SheetContext)

    const sideClasses = {
      left: "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm data-[state=closed]:-translate-x-full",
      right: "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm data-[state=closed]:translate-x-full",
      top: "inset-x-0 top-0 h-auto data-[state=closed]:-translate-y-full",
      bottom: "inset-x-0 bottom-0 h-auto data-[state=closed]:translate-y-full",
    }

    if (!open) return null

    return (
      <>
        <div
          className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={() => onOpenChange(false)}
        />
        <div
          ref={ref}
          data-state={open ? "open" : "closed"}
          className={cn(
            "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
            sideClasses[side],
            className
          )}
          {...props}
        >
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
          </button>
          {children}
        </div>
      </>
    )
  }
)
SheetContent.displayName = "SheetContent"

export { Sheet, SheetTrigger, SheetContent }
