import "@/styles/globals.css";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/UserContext";
import AppLayout from "@/app/AppLayout";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function App({ Component, pageProps }: AppPropsWithLayout) {
  // fallback to root layout if no layout is provided
  const getLayout =
    Component.getLayout || ((page) => <AppLayout>{page}</AppLayout>);

  return (
    <UserProvider>
      {getLayout(
        <>
          <Component {...pageProps} />
          <Toaster />
        </>
      )}
    </UserProvider>
  );
}

export default App;
