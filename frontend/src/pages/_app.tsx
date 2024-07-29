import Layout from '@/app/layout'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "SpyderWeb",
    description: "A new way to view the news.",
};

function App({ Component, pageProps }: AppProps) {
    return (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    );
  }
  
  export default App;