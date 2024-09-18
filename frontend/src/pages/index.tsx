import LandingGrid from "@/components/landing/LandingGrid";
import Header from "@/components/landing/Header";
import Demo from "@/components/landing/Demo";
import LandingCarousel from "@/components/landing/Carousel";
import { useEffect, useState } from "react";
import { LandingLoader } from "@/components/utility/Loading";
export default function Home() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    console.log("Laning loader component", <LandingLoader />);
    return <LandingLoader />;
  }

  return (
    <main className="flex min-h-screen flex-col items-start justify-between p-6 lg:px-10 lg:py-24 overflow-x-hidden">
      <div className="flex flex-col gap-8 w-full mx-auto">
        <Header />
        <LandingGrid />
        <Demo />
        <LandingCarousel/>
      </div>
    </main>
  );
}
