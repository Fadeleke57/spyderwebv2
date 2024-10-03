import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatText(text: string, maxChars: number) {
  if (text.length > maxChars) {
    return text.slice(0, maxChars) + "..."
  }
  return text
}