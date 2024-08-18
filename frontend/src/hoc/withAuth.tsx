import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUser } from "@/context/UserContext";

export default function withAuth(Component: any) {
  return function AuthenticatedComponent(props: any) {
    const { data: session, status } = useSession();
    const { user } = useUser();
    const loading = status === "loading";
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!user) {
        router.push("/auth/login");
      }
    }, [user, router]);


    return <Component {...props} />;
  };
}
