import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, type ReactElement, type ReactNode } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/UserContext";
import AppLayout from "@/app/AppLayout";
import { Inter as FontSans } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/hoc/theme-provider";
import { handleLinkedInWebView } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";
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

  useEffect(() => {
    handleLinkedInWebView();
  }, []);

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
          {getLayout(
            <>
              <Analytics />
              <div className={`${fontSans.className}`}>
                <Component {...pageProps} />
                <Toaster />
              </div>
            </>
          )}
        </UserProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
