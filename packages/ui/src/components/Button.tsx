import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Use the Slot component to render a different element */
    asChild?: boolean;
    /** Button variant */
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    /** Button size */
    size?: "default" | "sm" | "lg" | "icon";
}

const buttonVariants = {
    base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variant: {
        default:
            "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500",
        destructive:
            "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500",
        outline:
            "border border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-gray-400",
        secondary:
            "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:ring-gray-400",
        ghost:
            "hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400",
        link: "text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500",
    },
    size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
    },
};

/**
 * Button component with multiple variants and sizes
 * Built on Radix UI Slot for composition
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(
                    buttonVariants.base,
                    buttonVariants.variant[variant],
                    buttonVariants.size[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
