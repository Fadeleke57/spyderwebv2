import Layout from '@/app/layout'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
    title: "SpyderWeb",
    description: "The new way to news.",
};

function App({ Component, pageProps }: AppProps) {
    return (
      <Layout>
        <Component {...pageProps} />
        <Toaster />
      </Layout>
    );
  }
  
  export default App;