import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import "../styles/globals.css";
import { Navbar } from "@/components/utility/Nav";
import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { wrapper } from '@/store'

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {

  return (
      <div
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Navbar />
        {children}
      </div>
  );
}
