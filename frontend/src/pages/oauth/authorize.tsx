import { useEffect } from "react";
import { IdentityProvider, useStytchUser } from "@stytch/nextjs";
import PublicLayout from "@/app/PublicLayout";
import { useRouter } from "next/router";
import Head from "next/head";
import { StyleConfig } from "@stytch/vanilla-js";

const Authorize = () => {
  const router = useRouter();
  const { user, isInitialized } = useStytchUser();

  useEffect(() => {
    if (isInitialized && !user) {
      localStorage.setItem("returnTo", window.location.href);
      window.location.href = "/auth";
    }
  }, [isInitialized, user, router]);

  if (!user) {
    return null;
  }

  const styles: StyleConfig = {
    container: {
      backgroundColor: "#1F1F1F",
      borderColor: "#3f3f46",
      borderRadius: "10px",
      width: "400",
    },
    colors: {
      primary: "#d4d4d4",
      secondary: "#e2e8f0",
      success: "#4ade80",
      error: "#ef4444",
    },
    buttons: {
      primary: {
        backgroundColor: "#564A77",
        textColor: "#E8E8E8",
        borderColor: "#E8E8E8",
        borderRadius: "10px",
      },
      secondary: {
        backgroundColor: "#282727",
        textColor: "#fff",
        borderColor: "#6c757d",
        borderRadius: "10px",
      },
      disabled: {
        backgroundColor: "#e2e8f0",
        textColor: "#3f3f46",
        borderColor: "#ccc",
        borderRadius: "10px",
      },
    },
    inputs: {
      backgroundColor: "#fff",
      textColor: "#333",
      placeholderColor: "#999",
      borderColor: "#ccc",
      borderRadius: "5px",
    },
    fontFamily: "Arial, sans-serif",
    logo: {
      logoImageUrl: "/slogonobg.png",
    },
    hideHeaderText: false,
  };
  return (
    <div className="flex items-center justify-center h-[90dvh]">
      <Head>
        <title>{"Connect your account - spydr"}</title>
        <meta
          name="description"
          content={"Connect your Spydr account to a third-party client."}
        />
        <meta property="og:title" content={"Connect your account - spydr"} />
        <meta
          property="og:description"
          content={"Connect your Spydr account to a third-party client."}
        />
      </Head>
      <IdentityProvider styles={styles} />
    </div>
  );
};

Authorize.getLayout = (page: React.ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default Authorize;
