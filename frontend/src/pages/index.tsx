import LandingGrid from "@/components/landing/LandingGrid";
import Header from "@/components/landing/Header";
import Demo from "@/components/landing/Demo";
import { CarouselPlugin } from "@/components/landing/Carousel";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 lg:px-10 py-24">
      <div className="flex flex-col gap-8">
        <Header />
        <LandingGrid />
        <Demo />
        <CarouselPlugin />
      </div>
    </main>
  );
}
