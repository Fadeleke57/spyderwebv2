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

// Detect Safari browser
export const isSafari = () => {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes("safari") && !userAgent.includes("chrome");
};

// Use tspans for Safari, foreignObject for others
export const shouldUseTspans = isSafari();

export const wrapText = {
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
