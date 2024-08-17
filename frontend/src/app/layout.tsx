import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "../styles/globals.css";
import { Navbar } from "@/components/utility/Nav";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
