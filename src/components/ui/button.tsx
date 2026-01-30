import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-black uppercase tracking-wider transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-accent text-white hover:bg-white hover:text-black focus-visible:ring-accent",
                secondary:
                    "bg-white text-black hover:bg-accent hover:text-white focus-visible:ring-white",
                ghost:
                    "text-text-main hover:text-accent bg-transparent",
                danger:
                    "bg-danger text-white hover:bg-red-700 focus-visible:ring-danger",
                outline:
                    "border-2 border-accent text-accent bg-transparent hover:bg-accent hover:text-white",
            },
            size: {
                default: "px-8 py-4 text-sm",
                sm: "px-4 py-2 text-xs",
                lg: "px-12 py-6 text-lg",
                xl: "px-16 py-8 text-xl",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
