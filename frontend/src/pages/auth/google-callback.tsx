import { ReactElement, useEffect } from "react";
import { useRouter } from "next/router";
import PublicLayout from "@/app/PublicLayout";
import { useIsMobile } from "@/hooks/use-mobile";

const GoogleCallback = () => {
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    const { token, email, name } = router.query;

    if (token && email && name) {
      localStorage.setItem("token", token as string);
      window.location.href = isMobile
        ? "/buckets"
        : "/home?login-source=welcome";
    }
  }, [router.query, router]);

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
