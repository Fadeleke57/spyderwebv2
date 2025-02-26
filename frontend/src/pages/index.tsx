import Header from "@/components/landing/Header";
import { useEffect, useState } from "react";
import PublicLayout from "@/app/PublicLayout";
import { ReactElement } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (user) {
      router.push("/explore");
    }
  }, []);

  return (
    <div className="flex min-h-[85dvh] lg:min-h-[90dvh] flex-col items-start justify-between p-6 pt-20 lg:px-10  lg:pt-24 overflow-x-hidden">
      <div className="flex flex-col gap-8 w-full mx-auto">
        <Header />
      </div>
    </div>
  );
}

Home.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};
