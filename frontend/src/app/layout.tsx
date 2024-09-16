import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "../styles/globals.css";
import { Navbar } from "@/components/utility/Nav";
import Footer from "@/components/utility/Footer";

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
      <div className="relative max-w-[1440px] mx-auto">
        <Navbar />
        {children}
        <Footer />
      </div>
    </div>
  );
}
