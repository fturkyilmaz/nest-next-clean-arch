import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Error message to display */
    error?: string;
    /** Label for the input */
    label?: string;
}

/**
 * Input component with optional label and error states
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, label, id, ...props }, ref) => {
        const inputId = id || React.useId();

        return (
            <div className="w-full">
                {label && (
                    <LabelPrimitive.Root
                        htmlFor={inputId}
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        {label}
                    </LabelPrimitive.Root>
                )}
                <input
                    type={type}
                    id={inputId}
                    className={cn(
                        "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors",
                        "placeholder:text-gray-400",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        error
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-gray-300 focus-visible:ring-blue-500",
                        className
                    )}
                    ref={ref}
                    aria-invalid={error ? "true" : undefined}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...props}
                />
                {error && (
                    <p
                        id={`${inputId}-error`}
                        className="mt-1.5 text-sm text-red-600"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
