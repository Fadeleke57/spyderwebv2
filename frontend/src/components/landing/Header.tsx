import { Button } from "../ui/button";
import { useRouter } from "next/router";
import TypingAnimation from "@/components/ui/typing-animation";

function Header() {
  const router = useRouter();
  return (
    <div className="relative mb-6 sm:mb-8 w-full max-w-2xl">
      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
        The new way to news.
      </p>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-2 sm:mb-4 font-extrabold">
        Uncover the Web of Knowledge with <TypingAnimation className="text-blue-500 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" text="Spydr." />
      </h1>
      
      <p className="leading-7 mt-4 text-base sm:text-lg font-medium max-w-full sm:max-w-sm lg:max-w-xl sm:mx-0">
        Dive into the first community-driven search engine that transforms how you
        explore and interact with the internet.
      </p>
      <div className="mt-6 flex flex-row gap-2 sm:gap-4 justify-start">
        <Button onClick={() => router.push("/auth/register")}>
          Get Started
        </Button>
        <Button variant="link" onClick={() => router.push("/about")}>
          Learn More
        </Button>
      </div>
    </div>
  );
}

export default Header;
