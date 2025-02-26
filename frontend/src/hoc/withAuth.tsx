import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUser } from "@/context/UserContext";
export default function withAuth(Component: any) {
  return function AuthenticatedComponent(props: any) {
    const router = useRouter();
    const { user } = useUser();
    useEffect(() => {

      if (!user) {
        router.push("/explore");
      }
    }, [router, user]);


    return <Component {...props} />;
  };
}
