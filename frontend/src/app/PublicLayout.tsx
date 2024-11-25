import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { Navbar } from "@/components/utility/Nav";
import Footer from "@/components/utility/Footer";

export const metadata = {
  title: "spydr - For the questions without answers.",
  description:
    "Dive into the first community-driven search engine that transforms how you explore and interact with the internet.",
};

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
      )}
    >
      <div className="relative max-w-[1440px] mx-auto">
        <Navbar />
        {children}
        <Footer />
      </div>
    </div>
  );
}
