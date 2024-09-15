import { Button } from "../ui/button";
import { useRouter } from "next/router";

function Header() {
  const router = useRouter();
  return (
    <div className="relative mb-6 sm:mb-8 w-full text-center lg:text-left">
      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
        The new way to news.
      </p>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-2 sm:mb-4">
        Welcome to <span className="bg-blue-400">Spydr.</span>
      </h1>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
        Ready to <span className="bg-blue-400">Explore?</span>
      </h1>
      <p className="leading-7 mt-4 text-base sm:text-lg font-medium max-w-full sm:max-w-sm lg:max-w-xl mx-auto sm:mx-0">
        Research platform that helps quickly explore and analyze
        real-time news articles, and soon research papers, on any topic.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center sm:justify-start">
        <Button onClick={() => router.push("/home")}>
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
