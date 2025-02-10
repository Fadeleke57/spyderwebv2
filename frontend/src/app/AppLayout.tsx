import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { AppSidebar } from "@/components/utility/AppSideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@/components/ui/sidebar";
import useMediaQuery from "@/hooks/general";
import { ChartNoAxesGantt, CirclePlus, Home, LayoutGrid } from "lucide-react";
import { NewBucketModal } from "@/components/buckets/NewBucketModal";
import { useRouter } from "next/router";
import slogo from "@/assets/s_logo.jpg";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useUser } from "@/context/UserContext";
import { usePathname } from "next/navigation";
import NotionStyleSearch from "@/components/utility/Assistant";
const fontSans = FontSans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isSidebarOpen = localStorage.getItem(SIDEBAR_COOKIE_NAME) === "true";
  const pathname = usePathname();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useUser();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const router = useRouter();

  const handleButtonClick = (route: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    router.push(route);
  };

  const isActivePage = (path: string) => {
    if (path === "/explore") {
      return pathname === "/explore";
    }
    if (path === "/buckets") {
      return pathname?.startsWith("/buckets") && pathname !== "/buckets/new";
    }
    if (path === "/home") {
      return pathname === "/home";
    }
    return false;
  };

  if (isMobile) {
    return (
      <div
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col relative pt-20"
        )}
      >
        <div className="fixed top-0 z-50 h-16 w-[101vw] border-b bg-background dark:bg-background flex flex-row items-center justify-between px-5">
          <Link href="/explore">
            <Image
              src={slogo}
              alt="logo"
              width={36}
              height={36}
              className="rounded-full"
              priority
            />
          </Link>
          <div className="flex flex-row gap-4 items-center">
            <div onClick={() => router.push("/explore")}>
              <div className="flex flex-col gap-2 items-center justify-center rounded-lg bg-none">
                <LayoutGrid
                  className={cn(
                    "size-5",
                    isActivePage("/explore")
                      ? "text-primary"
                      : "text-slate-500 dark:text-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isActivePage("/explore")
                      ? "text-primary"
                      : "text-slate-500 dark:text-foreground"
                  )}
                >
                  Explore
                </span>
                <div
                  className={cn(
                    "h-1 w-6 rounded-full transition-all duration-200",
                    isActivePage("/explore") ? "bg-primary" : "bg-transparent"
                  )}
                />
              </div>
            </div>

            <div onClick={() => handleButtonClick("/buckets")}>
              <div className="flex flex-col gap-2 items-center justify-center rounded-lg bg-none">
                <ChartNoAxesGantt
                  className={cn(
                    "size-5",
                    isActivePage("/buckets")
                      ? "text-primary"
                      : "text-slate-500 dark:text-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isActivePage("/buckets")
                      ? "text-primary"
                      : "text-slate-500 dark:text-foreground"
                  )}
                >
                  Buckets
                </span>
                <div
                  className={cn(
                    "h-1 w-6 rounded-full transition-all duration-200",
                    isActivePage("/buckets") ? "bg-primary" : "bg-transparent"
                  )}
                />
              </div>
            </div>
            <div onClick={() => handleButtonClick("/home")}>
              <div className="flex flex-col gap-2 items-center justify-center rounded-lg bg-none">
                <Home
                  className={cn(
                    "size-5",
                    isActivePage("/home")
                      ? "text-primary"
                      : "text-slate-500 dark:text-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isActivePage("/home")
                      ? "text-primary"
                      : "text-slate-500 dark:text-foreground"
                  )}
                >
                  Home
                </span>
                <div
                  className={cn(
                    "h-1 w-6 rounded-full transition-all duration-200",
                    isActivePage("/home") ? "bg-primary" : "bg-transparent"
                  )}
                />
              </div>
            </div>
            <div>
              {user ? (
                <NewBucketModal>
                  <div className="flex flex-col gap-2 items-center justify-center rounded-lg bg-none text-slate-500 dark:text-foreground">
                    <CirclePlus className="size-5" />
                    <span className="text-xs font-semibold">Create</span>
                    <div className={cn("h-1 w-6")} />
                  </div>
                </NewBucketModal>
              ) : (
                <div
                  onClick={() => handleButtonClick("/buckets/new")}
                  className="flex flex-col gap-2 items-center justify-center rounded-lg bg-none text-slate-500 dark:text-foreground"
                >
                  <CirclePlus className="size-5" />
                  <span className="text-xs font-semibold">Create</span>
                  <div className={cn("h-1 w-6")} />
                </div>
              )}
            </div>
          </div>
        </div>
        {children}
        {isAuthModalOpen && (
          <AuthModal
            type="login"
            referrer="app"
            open={isAuthModalOpen}
            setOpen={setAuthModalOpen}
          />
        )}
      </div>
    );
  }

  return (
    <SidebarProvider
      className={cn("min-h-screen bg-background font-sans antialiased")}
      defaultOpen={isSidebarOpen}
    >
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">{children}</SidebarInset>
    </SidebarProvider>
  );
}
