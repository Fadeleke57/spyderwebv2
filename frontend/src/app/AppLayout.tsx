import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import Sidebar from "@/components/utility/Sidebar";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "spydr - Collaborative Research Platform",
  description: "Spydr is working to democratize research.",
};

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}
    >
      <main
        className={`flex min-h-screen flex-col items-center justify-center sm:pl-14`}
      >
        <Sidebar />
        {children}
      </main>
    </div>
  );
}
