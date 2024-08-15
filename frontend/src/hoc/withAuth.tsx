import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function withAuth(Component: any) {
  return function AuthenticatedComponent(props: any) {
    const { data: session, status } = useSession();
    const loading = status === "loading";
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/auth/login");
      }
    }, [router]);


    return <Component {...props} />;
  };
}
