import React, { useEffect } from "react";
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
      backgroundColor: "#fff",
      borderColor: "#ccc",
      borderRadius: "5px",
      width: "100%",
    },
    colors: {
      primary: "#007bff",
      secondary: "#6c757d",
      success: "#28a745",
      error: "#dc3545",
    },
    buttons: {
      primary: {
        backgroundColor: "#007bff",
        textColor: "#fff",
        borderColor: "#007bff",
        borderRadius: "5px",
      },
      secondary: {
        backgroundColor: "#6c757d",
        textColor: "#fff",
        borderColor: "#6c757d",
        borderRadius: "5px",
      },
      disabled: {
        backgroundColor: "#ccc",
        textColor: "#fff",
        borderColor: "#ccc",
        borderRadius: "5px",
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
      logoImageUrl: "/logo.svg",
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
