import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import PublicLayout from "@/app/PublicLayout";
import { useStytch } from "@stytch/nextjs";
import { SESSION_MINUTES } from ".";
import { useCompleteOauth } from "@/hooks/auth";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import { LoaderIcon } from "lucide-react";

const GoogleCallback = () => {
  const client = useStytch();
  const { mutateAsync: completeOauth } = useCompleteOauth();
  const router = useRouter();
  const { stytch_token_type, token } = router.query;
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessed = useRef(false);

  const authenticate = useCallback(async () => {
    if (hasProcessed.current || isProcessing) {
      console.log("Authentication already in progress or completed");
      return;
    }

    if (!token || typeof token !== "string") {
      console.error("No valid token found");
      toast({
        title: "Error",
        description: "Invalid authentication token",
        variant: "destructive",
      });
      return;
    }

    hasProcessed.current = true;
    setIsProcessing(true);

    try {
      console.log("Starting OAuth authentication...");

      const response = await client.oauth.authenticate(token, {
        session_duration_minutes: SESSION_MINUTES,
      });

      if (response.session && response.user) {
        console.log("Stytch authentication successful, completing OAuth...");

        const redirectUrl = await completeOauth({
          stytchUserId: response.user_id,
          firstName: response.user.name?.first_name || "",
          lastName: response.user.name?.last_name || "",
          email: response.user.emails?.[0]?.email || "",
          profilePictureUrl:
            response.user.providers?.[0]?.profile_picture_url || "",
        });

        console.log(
          "OAuth completion successful, redirecting to:",
          redirectUrl
        );
        const returnTo = localStorage.getItem("returnTo");
        if (returnTo) {
          localStorage.removeItem("returnTo");
          window.location.href = returnTo;
        } else if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = "/home?src=oauth";
        }
      } else {
        throw new Error("No session or user returned from Stytch");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      hasProcessed.current = false;
      setIsProcessing(false);

      toast({
        title: "Authentication Failed",
        description: error.message || "Please try logging in again",
        variant: "destructive",
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    }
  }, [client, completeOauth, token, router, isProcessing]);

  useEffect(() => {
    if (router.isReady && token && !hasProcessed.current) {
      console.log("Router ready, triggering authentication");
      authenticate();
    }
  }, [router.isReady, token, authenticate]);

  return (
    <div className="w-full h-[90dvh] flex justify-center items-center">
      <div className="text-center flex flex-col items-center justify-center">
        <p className="text-lg mb-4">
          {isProcessing ? "Logging you in..." : "Preparing authentication..."}
        </p>
        {isProcessing && (
          <LoaderIcon
            size={24}
            className="animate-spin text-violet-400/50"
          ></LoaderIcon>
        )}
      </div>
    </div>
  );
};

GoogleCallback.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default GoogleCallback;
