import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Code reccomended by Tailwind
 * Reccommended to use this function instead of clsx
 * to avoid class name conflicts with tailwind merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
