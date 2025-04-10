import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { D3Selection } from "@/types/graph";
import * as d3 from "d3";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatText(text: string, maxChars: number) {
  if (text.length > maxChars) {
    return text.slice(0, maxChars) + "...";
  }
  return text;
}

/**
 * Extract the video id from a given YouTube url.
 *
 * @param {string} url
 * @returns {string | null}
 */
export function extractVideoId(url: string | undefined) {
  if (!url) return;
  const regex =
    /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Maps a given theme to its corresponding base node color.
 *
 * @param {string | undefined} theme - The theme for which to get the base node color.
 * @returns {string} - The hex color code representing the base node color for the given theme.
 *
 * @example
 * mapThemeToBaseNodeColor("light") // "#5ea4ff"
 * mapThemeToBaseNodeColor("dark") // "#b8b8b8"
 * mapThemeToBaseNodeColor(undefined) // "#b8b8b8"
 */
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

/**
 * Maps a given theme to its corresponding node hover color.
 *
 * @param {string | undefined} theme - The theme for which to get the node hover color.
 * @returns {string} - The hex color code representing the node hover color for the given theme.
 *
 * @example
 * mapThemetoHoverNodeColor("light") // "#c084fc"
 * mapThemetoHoverNodeColor("dark") // "#a78bfa"
 * mapThemetoHoverNodeColor(undefined) // "#a78bfa"
 */
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

/**
 * Maps a given theme to its corresponding text color.
 *
 * @param {string | undefined} theme - The theme for which to get the text color.
 * @returns {string} - The hex color code representing the text color for the given theme.
 *
 * @example
 * mapThemeToTextColor("light") // "#374151"
 * mapThemeToTextColor("dark") // "#b8b8b8"
 * mapThemeToTextColor(undefined) // "#b8b8b8"
 */

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

/**
 * Detects if the user is on a mobile device and using the LinkedIn app,
 * and if so, redirects them to the same URL but with a special prefix that
 * allows the app to open the URL in the external browser.
 *
 * This is a workaround for a bug in the LinkedIn app where it doesn't allow
 * the user to open external links in the app's built-in browser.
 *
 * @returns {boolean} Whether the redirect was successful.
 */
export const handleLinkedInWebView = () => {
  if (typeof window === "undefined") return;

  const userAgent = window.navigator.userAgent;
  const url = window.location.href;

  if (
    userAgent.includes("Mobile") &&
    (userAgent.includes("iPhone") || userAgent.includes("iPad")) &&
    userAgent.includes("LinkedInApp")
  ) {
    window.location.href = "x-safari-" + url;
    return true;
  }
  return false;
};

/**
 * Checks if the current browser is Safari.
 *
 * This function determines whether the user's browser is Safari by checking
 * the user agent string. It excludes cases where the browser is Chrome,
 * despite potentially identifying as Safari.
 *
 * @returns {boolean} True if the browser is Safari, false otherwise.
 */

export const isSafari = () => {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes("safari") && !userAgent.includes("chrome");
};

// Use tspans for Safari, foreignObject for others
export const shouldUseTspans = isSafari();

export const wrapText = {
  /**
   * Appends a foreignObject to the selection for each text element, so that text can be wrapped.
   * @param selection The selection to append the foreignObject to.
   * @param width The width of the foreignObject.
   * @param theme The theme to use for the text color.
   * @param getColor A function that takes a theme and returns a color.
   */
  foreignObject: (
    selection: D3Selection,
    width: number,
    theme: string,
    getColor: (theme: string) => string
  ) => {
    selection.each(function () {
      const text = d3.select(this);
      const x = text.attr("x");
      const y = text.attr("y");

      const fo = text
        .append("foreignObject")
        .attr("x", parseFloat(x) - width / 2)
        .attr("y", y)
        .attr("width", width)
        .attr("height", 100);

      fo.append("xhtml:div")
        .style("font-size", "14px")
        .style("color", getColor(theme))
        .style("text-align", "center")
        .style("font-weight", "bold")
        .style("white-space", "normal")
        .style("line-height", "1.1em")
        .text(text.text());
    });
  },

  /**
   * Wraps text selection to tspans to enable line wrapping.
   * @param {D3Selection} selection The D3 selection to wrap.
   * @param {number} width The width of the text area.
   */
  tspans: (selection: D3Selection, width: number) => {
    selection.each(function () {
      const textNode = d3.select(this);
      const originalText = textNode.text();
      if (!originalText) return;

      const words = originalText.split(/\s+/).reverse();
      const y = textNode.attr("y");
      const x = textNode.attr("x");
      const dy = parseFloat(textNode.attr("dy")) || 0;
      const lineHeight = 1.1;

      // Clear existing content
      textNode.text(null);

      let currentLine: string[] = [];
      let lineNumber = 0;

      // Create initial tspan
      let tspan = textNode
        .append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", dy + "em");

      // Process words
      while (words.length > 0) {
        const word = words.pop()!;
        currentLine.push(word);
        const lineText = currentLine.join(" ");
        tspan.text(lineText);

        // Check if line needs wrapping
        if (
          (tspan.node()?.getComputedTextLength() as any) > width &&
          currentLine.length > 1
        ) {
          currentLine.pop();
          tspan.text(currentLine.join(" "));

          // Start new line
          currentLine = [word];
          tspan = textNode
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  },
};

/**
 * Updates the text elements of a D3 selection given an array of nodes.
 * @param {d3.Selection} g The D3 selection to update.
 * @param {any[]} nodes The array of nodes to update with.
 * @param {string} theme The current theme.
 * @param {function} getColor A function that takes the theme and returns the color.
 * @param {function} getSizeScale A function that takes the size and returns the scaled size.
 * @param {function} formatText A function that takes the text and a limit, and returns the formatted text.
 * @returns The updated D3 selection.
 */
export const updateTextElements = (
  g: D3Selection,
  nodes: any[],
  theme: string,
  getColor: (theme: string) => string,
  getSizeScale: (size: number) => number,
  formatText: (text: string, limit: number) => string
) => {
  const textElements = g
    .selectAll("text")
    .data(nodes || [])
    .join("text")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y + getSizeScale(d.size || 4) + 20)
    .attr("text-anchor", "middle")
    .attr("fill", getColor(theme))
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .text((d) => formatText(d.name, 50) || "");

  if (shouldUseTspans) {
    textElements.call(wrapText.tspans, 300);
  } else {
    textElements.call((selection) =>
      wrapText.foreignObject(selection, 300, theme, getColor)
    );
  }

  return textElements;
};

/**
 * Format a date string according to the given options.
 *
 * If no dateString is given, an empty string is returned.
 *
 * If onlyTime is true, only the time is formatted.
 * If onlyDate is true, only the date is formatted.
 * Otherwise, the full date and time is formatted.
 *
 * @param dateString string to be formatted
 * @param options formatting options
 * @returns formatted string
 */
export const formatDate = (
  dateString?: string,
  options: { onlyTime?: boolean; onlyDate?: boolean } = {}
) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (options.onlyTime) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }

  if (options.onlyDate) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

/**
 * Returns a greeting message based on the time of day in the user's timezone
 * @param timezone - A valid IANA timezone string (e.g., "America/New_York", "Europe/London")
 * @param time - Optional Date object. If not provided, current time will be used
 * @returns A greeting message appropriate for the time of day
 */
export function getTimeBasedGreeting(timezone: string): string {
  // Use provided time or current time
  const currentTime = new Date();

  // Create date with user's timezone
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  };

  // Get hour in 24-hour format for the specified timezone
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const formattedTime = formatter.format(currentTime);
  const hour = parseInt(formattedTime, 10);

  // Determine appropriate greeting based on hour
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if (hour >= 17 && hour < 22) {
    return "Good evening";
  } else {
    return "Good night";
  }
}

// Example usage:
// const greeting = getTimeBasedGreeting("America/Los_Angeles");
// console.log(greeting); // Will output greeting based on current time in LA

// For testing with a specific time:
// const testTime = new Date("2025-03-21T08:30:00Z");
// const greeting = getTimeBasedGreeting("Asia/Tokyo", testTime);
// console.log(greeting);

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_GIF_TYPES = ["image/gif"];

export const mapToolNameToBreadcrumb = (toolName: string) => {
  switch (toolName) {
    case "get_current_weather":
      return "Taking a look outside...";
    case "get_graph_context":
      return "Crawling your web...";
    default:
      return "Thinking...";
  }
};
