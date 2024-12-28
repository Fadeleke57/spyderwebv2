import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatText(text: string, maxChars: number) {
  if (text.length > maxChars) {
    return text.slice(0, maxChars) + "...";
  }
  return text;
}

export function extractVideoId(url: string | undefined) {
  if (!url) return;
  const regex =
    /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/*graph stuff*/

export const mapThemeToBaseNodeColor = (theme: string | undefined) => {
  switch (theme) {
    case "light":
      return "#5ea4ff";
    case "dark":
      return "#b8b8b8";
    default:
      return "#b8b8b8";
  }
};

export const mapThemetoHoverNodeColor = (theme: string | undefined) => {
  switch (theme) {
    case "light":
      return "#c084fc";
    case "dark":
      return "#a78bfa";
    default:
      return "#a78bfa";
  }
};

export const mapThemeToTextColor = (theme: string | undefined) => {
  switch (theme) {
    case "light":
      return "#374151";
    case "dark":
      return "#b8b8b8";
    default:
      return "#b8b8b8";
  }
};