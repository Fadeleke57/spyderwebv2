import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import "../styles/globals.css";
import { NavigationMenuDemo } from "@/components/nav";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "SpyderWeb",
  description: "A new way to view the news.",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <NavigationMenuDemo />
        {children}
      </body>
    </html>
  );
}
