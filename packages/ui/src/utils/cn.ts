import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * This prevents class conflicts and allows for conditional classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
