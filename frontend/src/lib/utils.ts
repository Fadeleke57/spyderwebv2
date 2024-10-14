import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ArticleAsNode } from "@/types/article"
import * as d3 from "d3";
import { svg } from "d3";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatText(text: string, maxChars: number) {
  if (text.length > maxChars) {
    return text.slice(0, maxChars) + "..."
  }
  return text
}