import { ReactElement, useEffect } from "react";
import { useRouter } from "next/router";
import PublicLayout from "@/app/PublicLayout";

const GoogleCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const { token, email, name } = router.query;

    if (token && email && name) {
      localStorage.setItem("token", token as string);
      setTimeout(() => {
        window.location.href = "/explore";
      }, 2000);
    }
  }, [router.query, router]);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <p>Loading...</p>
    </div>
  );
};
GoogleCallback.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};
export default GoogleCallback;
