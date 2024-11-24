import { Roboto as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import Sidebar from "@/components/utility/Sidebar";
import { AppSidebar } from "@/components/utility/AppSideBar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const fontSans = FontSans({
  weight: "400",
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
    <SidebarProvider
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}
    >
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden"> {children}</SidebarInset>
    </SidebarProvider>
  );
}
