import Header from "@/components/landing/Header";
import LandingCarousel from "@/components/landing/Carousel";
import { useEffect, useState } from "react";
import { LoadingPage } from "@/components/utility/Loading";
import PublicLayout from "@/app/PublicLayout";
import { ReactElement } from "react";
import LandingGrid from "@/components/landing/LandingGrid";
import Demo from "@/components/landing/Demo";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[100svh] flex-col items-center justify-center">
        <LoadingPage />
      </div>
    );
  }
  return (
    <div className="flex min-h-[100svh] flex-col items-start justify-between p-6 lg:px-10 lg:py-24 overflow-x-hidden">
      <div className="flex flex-col gap-8 w-full mx-auto">
        <Header />
        <LandingGrid />
        <Demo />
        <LandingCarousel />
      </div>
    </div>
  );
}

Home.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};
