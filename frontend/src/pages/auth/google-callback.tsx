import { useEffect } from "react";
import { useRouter } from "next/router";

const GoogleCallback: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const { token, email, name } = router.query;

    if (token && email && name) {
      localStorage.setItem("token", token as string);
      setTimeout(() => {
        router.push("/terminal");
      }, 2000);
    }
  }, [router.query, router]);

  return (
    <div className="w-full h-7/8 lg:h-screen flex justify-center items-center">
      <p>Loading...</p>
    </div>
  );
};

export default GoogleCallback;
