import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { AppSidebar } from "@/components/utility/AppSideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SIDEBAR_COOKIE_NAME } from "@/components/ui/sidebar";
import useMediaQuery from "@/hooks/general";
import { CirclePlus, Home, LayoutGrid, User } from "lucide-react";
import { NewWebModal } from "@/components/webs/NewWebModal";
import { useRouter } from "next/router";
import slogo from "@/assets/s_logo.jpg";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useUser } from "@/context/UserContext";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isSidebarOpen = localStorage.getItem(SIDEBAR_COOKIE_NAME) === "true";
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
      return router.asPath.startsWith("/explore");
    }
    if (path === "/user") {
      return user && router.asPath.startsWith(`/user/${user.username}`);
    }
    if (path === "/home") {
      return router.asPath.startsWith("/home");
    }
    return false;
  };

  if (isMobile) {
    return (
      <div
        className={cn(
          " bg-background pt-[75px] z-80 font-sans antialiased flex flex-col relative"
        )}
      >
        <div className="fixed left-0 top-0 z-50 h-[75px] w-[101vw] border-b bg-background dark:bg-background flex flex-row items-center justify-between px-5 border">
          <Link href="/explore">
            <Image
              src={slogo}
              alt="logo"
              width={36}
              height={36}
              className="rounded-lg"
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

            <div onClick={() => handleButtonClick(`/user/${user?.username}`)}>
              <div className="flex flex-col gap-2 items-center justify-center rounded-lg bg-none">
                <User
                  className={cn(
                    "size-5",
                    isActivePage("/user")
                      ? "text-primary"
                      : "text-slate-500 dark:text-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isActivePage("/user")
                      ? "text-primary"
                      : "text-slate-500 dark:text-foreground"
                  )}
                >
                  Profile
                </span>
                <div
                  className={cn(
                    "h-1 w-6 rounded-full transition-all duration-200",
                    isActivePage("/webs") ? "bg-primary" : "bg-transparent"
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
                <NewWebModal>
                  <div className="flex flex-col gap-2 items-center justify-center rounded-lg bg-none text-slate-500 dark:text-foreground">
                    <CirclePlus className="size-5" />
                    <span className="text-xs font-semibold">Create</span>
                    <div className={cn("h-1 w-6")} />
                  </div>
                </NewWebModal>
              ) : (
                <div
                  onClick={() => handleButtonClick("/webs/new")}
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
            open={isAuthModalOpen}
            setOpen={setAuthModalOpen}
          />
        )}
      </div>
    );
  }

  return (
    <SidebarProvider
      className={cn("h-screen bg-background font-sans antialiased")}
    >
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">{children}</SidebarInset>
    </SidebarProvider>
  );
}
