import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { UserProvider } from "@/context/UserContext";
import AppLayout from "@/app/AppLayout";
import { Inter as FontSans } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/hoc/theme-provider";
import { handleLinkedInWebView } from "@/lib/utils";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const fontSans = FontSans({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const queryClient = new QueryClient();

function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout || ((page) => <AppLayout>{page}</AppLayout>);
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [toastId, setToastId] = useState<any>(null);

  useEffect(() => {
    handleLinkedInWebView();
  }, []);

  //handle internet connectivity
  useEffect(() => {
    //set initial status
    setIsOnline(navigator.onLine);

    //handler functions for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      if (toastId) {
        toast({
          title: "Connected",
          description: "Your internet connection has been restored.",
          duration: 3000,
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      const id = toast({
        title: "No Internet Connection",
        description:
          "You are currently offline. Some features may be unavailable.",
        variant: "destructive",
        duration: Infinity,
      });
      setToastId(id);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    //clean up event listeners
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast, toastId]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <Head>
          <title>spydr</title>
          <meta
            name="description"
            content="spydr is working to democratize research."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <UserProvider>
          <div className="max-w-[1400px] mx-auto">
            {getLayout(
              <>
                <Analytics />
                {/* show blank screen with toast when offline */}
                {isOnline ? (
                  <div className={`${fontSans.className}`}>
                    <Component {...pageProps} />
                    <Toaster />
                  </div>
                ) : (
                  <div
                    className={`${fontSans.className} h-full w-full flex items-center justify-center bg-background`}
                  >
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2">
                        No Internet Connection
                      </h2>
                      <p className="text-muted-foreground">
                        Please check your connection and try again.
                      </p>
                    </div>
                    <Toaster />
                  </div>
                )}
              </>
            )}
          </div>
        </UserProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
