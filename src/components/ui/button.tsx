
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-electric-blue to-neon-purple hover:from-neon-blue hover:to-electric-purple text-white shadow-lg hover:shadow-xl transition-all duration-300",
        destructive:
          "bg-gradient-to-r from-electric-red to-neon-pink hover:from-neon-pink hover:to-electric-red text-white shadow-lg hover:shadow-xl transition-all duration-300",
        outline:
          "border-2 border-electric-blue bg-transparent hover:bg-electric-blue/10 hover:text-electric-blue text-electric-blue shadow-md hover:shadow-lg transition-all duration-300",
        secondary:
          "bg-gradient-to-r from-neon-yellow to-electric-orange hover:from-electric-orange hover:to-neon-pink text-black shadow-lg hover:shadow-xl transition-all duration-300",
        ghost: "hover:bg-electric-blue/10 hover:text-electric-blue transition-all duration-300",
        link: "text-electric-blue underline-offset-4 hover:underline hover:text-neon-blue transition-colors duration-300",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
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
