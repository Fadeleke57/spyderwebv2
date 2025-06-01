import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import type { NextPage } from "next";
import { StytchProvider } from "@stytch/nextjs";
import { createStytchUIClient } from "@stytch/nextjs/ui";
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
import { Toaster as SonnerToaster } from "sonner";
import { PostHogProvider } from "@/components/PostHogProvider";
import { environment } from "@/environment/load_env";

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

  const stytch = createStytchUIClient(
    environment.stytch_public_token as string,
    {
      cookieOptions: {
        availableToSubdomains: true,
        domain: environment.client_url
          ?.replace("https://", "")
          .replace("www.", ""),
      },
    }
  );

  return (
    <StytchProvider stytch={stytch}>
      <PostHogProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <QueryClientProvider client={queryClient}>
            <Head>
              <title>
                Bridging the Gap Between AI Models and Human Thought
              </title>
              <meta
                name="description"
                content="An exploration into harmonizing AI capabilities with human cognition."
              />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
              <meta
                property="og:title"
                content="Bridging the Gap Between AI Models and Human Thought"
              />
              <meta
                property="og:description"
                content="An exploration into harmonizing AI capabilities with human cognition."
              />
              <meta property="og:image" content="/opengraph-image.jpg" />
              <meta property="og:url" content="https://www.spydr.ai" />
              <meta property="og:type" content="website" />
              <link rel="icon" href="/favicon.ico" />
              <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            </Head>

            <UserProvider>
              <div>
                {getLayout(
                  <>
                    <Analytics />
                    <div className={`${fontSans.className}`}>
                      <Component {...pageProps} />
                      <Toaster />
                      <SonnerToaster />
                    </div>
                  </>
                )}
              </div>
            </UserProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </PostHogProvider>
    </StytchProvider>
  );
}

export default App;
