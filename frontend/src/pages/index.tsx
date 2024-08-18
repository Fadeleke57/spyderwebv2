import LandingGrid from "@/components/landing/LandingGrid";
import Header from "@/components/landing/Header";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-between p-6 lg:p-24">
      <div className="flex flex-col gap-8">
        <Header/>
        <LandingGrid/>
      </div>
    </main>
  );
}