import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { AppSidebar } from "@/components/utility/AppSideBar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@/components/ui/sidebar";

const fontSans = FontSans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isSidebarOpen = localStorage.getItem(SIDEBAR_COOKIE_NAME) === "true";
  return (
    <SidebarProvider
      className={cn(
        "min-h-screen bg-background font-sans antialiased"
      )}
      defaultOpen={isSidebarOpen}
    >
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden"> {children}</SidebarInset>
    </SidebarProvider>
  );
}
