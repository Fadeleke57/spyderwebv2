import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { AppSidebar } from "@/components/utility/AppSideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@/components/ui/sidebar";
import useMediaQuery from "@/hooks/general";
import { ChartNoAxesGantt, CirclePlus, Home, LayoutGrid } from "lucide-react";
import { NewBucketModal } from "@/components/buckets/NewBucketModal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import slogo from "@/assets/s_logo.jpg";
import Image from "next/image";
import Link from "next/link";
const fontSans = FontSans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isSidebarOpen = localStorage.getItem(SIDEBAR_COOKIE_NAME) === "true";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const router = useRouter();

  if (isMobile) {
    return (
      <div
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col relative pt-20"
        )}
      >
        <div className="fixed top-0 z-50 h-16 w-[101vw] bg-slate-100 flex flex-row items-center justify-between px-5">
          <Link href="/explore">
            <Image
              src={slogo}
              alt="logo"
              width={36}
              height={36}
              className="rounded-full"
            ></Image>
          </Link>
          <div className="flex flex-row gap-4 items-center">
            <div
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              onClick={() => router.push("/explore")}
            >
              <div className="flex flex-col gap-2 items-center justify-center rounded-lg bg-none text-slate-500 text-sidebar-primary-foreground">
                <LayoutGrid className="size-5" />
                <span className="text-xs font-semibold">Explore</span>
              </div>
            </div>
            <div
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              onClick={() => router.push("/buckets")}
            >
              <div className="flex flex-col gap-2 items-center justify-center rounded-lg bg-none text-slate-500 text-sidebar-primary-foreground">
                <ChartNoAxesGantt className="size-5" />
                <span className="text-xs font-semibold">Buckets</span>
              </div>
            </div>
            <div>
              <NewBucketModal>
                <Button className="w-full bg-transparent hover:bg-transparent p-0 flex flex-row gap-2">
                  <div className="flex flex-col gap-2 items-center justify-center rounded-lg bg-none text-slate-500 text-sidebar-primary-foreground">
                    <CirclePlus className="size-5" />
                    <span className="text-xs font-semibold">Create</span>
                  </div>
                </Button>
              </NewBucketModal>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider
      className={cn("min-h-screen bg-background font-sans antialiased")}
      defaultOpen={isSidebarOpen}
    >
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden"> {children}</SidebarInset>
    </SidebarProvider>
  );
}
