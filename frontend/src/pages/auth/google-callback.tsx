import { useEffect } from "react";
import { useRouter } from "next/router";
import { LoadingPage } from "@/components/utility/Loading";

const GoogleCallback: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const { token, email, name } = router.query;

    if (token && email && name) {
      localStorage.setItem("token", token as string);
      setTimeout(() => {
        router.push("/terminal");
      }, 5000); 
    }
  }, [router.query, router]);

  return <LoadingPage />;
};

export default GoogleCallback;
