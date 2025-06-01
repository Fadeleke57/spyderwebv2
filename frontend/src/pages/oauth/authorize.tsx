import React, { useEffect } from "react";
import { IdentityProvider, useStytchUser } from "@stytch/nextjs";
import PublicLayout from "@/app/PublicLayout";
import { useRouter } from "next/router";

const Authorize = () => {
  const router = useRouter();
  const { user, isInitialized } = useStytchUser();

  useEffect(() => {
    if (isInitialized && !user) {
      localStorage.setItem("returnTo", window.location.href + "?src=mcp_auth");
      window.location.href = "/auth";
    }
  }, [isInitialized, user, router]);

  if (!user) {
    return null;
  }
  return (
    <div className="flex items-center justify-center h-[87dvh]">
      <IdentityProvider />
    </div>
  );
};

Authorize.getLayout = (page: React.ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default Authorize;
