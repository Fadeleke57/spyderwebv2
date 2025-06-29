import { useRouter } from "next/router";
import { useEffect } from "react";
import { useStytchUser } from "@stytch/nextjs";

export default function withAuth(Component: any) {
  return function AuthenticatedComponent(props: any) {
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
    return <Component {...props} />;
  };
}
