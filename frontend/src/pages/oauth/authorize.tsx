import React, { useEffect } from "react";
import { IdentityProvider, useStytchUser } from "@stytch/nextjs";
import PublicLayout from "@/app/PublicLayout";
import { useRouter } from "next/router";
import Head from "next/head";

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
      <IdentityProvider />
    </div>
  );
};

Authorize.getLayout = (page: React.ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default Authorize;
