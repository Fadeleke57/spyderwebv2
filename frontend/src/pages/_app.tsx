import Layout from "@/app/layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/UserContext";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "SpyderWeb",
  description: "The new way to news.",
};

function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Layout>
        <SessionProvider session={pageProps.session}>
          <Component {...pageProps} />
        </SessionProvider>
        <Toaster />
      </Layout>
    </UserProvider>
  );
}

export default App;
