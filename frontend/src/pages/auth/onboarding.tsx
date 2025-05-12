import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import OnboardingFlow from "@/components/auth/OnboardingFlow";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    isGoogleSignup: false,
    defaultWebId: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue.",
        variant: "destructive",
      });
      router.push("/");
      return;
    }

    const username = (router.query.username as string) || "";
    const firstName = (router.query.firstName as string) || "";
    const lastName = (router.query.lastName as string) || "";
    const isGoogleSignup = router.query.isGoogleSignup === "true";
    const defaultWebId = (router.query.defaultWebId as string) || "";

    setUserData({
      username,
      firstName,
      lastName,
      isGoogleSignup,
      defaultWebId,
    });

    setIsLoading(false);
  }, [router, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Dialog open={true}>
      <DialogClose hidden className="hidden"></DialogClose>
      <DialogContent hideClose className="w-full max-w-[100vw] h-full p-0">
        <DialogTitle hidden></DialogTitle>
        <DialogDescription hidden></DialogDescription>
        <OnboardingFlow
          firstName={router.query.firstName as string}
          lastName={router.query.lastName as string}
          username={userData.username}
          isGoogleSignup={userData.isGoogleSignup}
          defaultWebId={userData.defaultWebId}
        />
      </DialogContent>
    </Dialog>
  );
}
