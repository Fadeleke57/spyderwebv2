import { Chat } from "@/components/chat/chat";
import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>charlotte ai</title>
        <meta name="description" content={"charlotte ai"} />
        <meta property="og:title" content={"charlotte aI"} />
        <meta property="og:description" content={"charlotte ai"} />
        <meta
          property="og:url"
          content={`${
            typeof window !== "undefined" ? window.location.href : ""
          }`}
        />
      </Head>ß
      <Chat />
    </>
  );
}
