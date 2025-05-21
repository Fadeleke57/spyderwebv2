import { ReactElement, useEffect } from "react";
import { useRouter } from "next/router";
import PublicLayout from "@/app/PublicLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";

const GoogleCallback = () => {
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    const { email, username, firstName, lastName, newUser, newWebId } =
      router.query;
    let redirectTo = null;
    if (newWebId) {
      redirectTo = "/auth/onboarding";
    }
    if (email && username) {
      toast({
        title: `${newWebId ? `Welcome to Spydr ${firstName || username}` : `Welcome back ${firstName || username}`}`,
        description: `${newWebId ? "Registration" : "Login"} successful!`,
      });
      window.location.href = redirectTo
        ? `${redirectTo}?firstName=${firstName}&lastName=${lastName}&username=${username}&isGoogleSignup=true&defaultWebId=${newWebId}`
        : "/home";
    }
  }, [router.query, router, isMobile]);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <p>Logging you in...</p>
    </div>
  );
};
GoogleCallback.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};
export default GoogleCallback;
