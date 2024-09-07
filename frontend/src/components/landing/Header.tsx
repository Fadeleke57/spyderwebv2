import { Button } from "../ui/button";
import { useRouter } from "next/router";

function Header() {
  const router = useRouter();
  return (
    <div className="relative mb-8">
      <p className="text-sm text-muted-foreground mb-4">The new way to news.</p>
      <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-5xl mb-2 lg:mb-4">
        Welcome to <span className="bg-blue-400">Spydr.</span>
      </h1>
      <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-5xl">
        Ready to <span className="bg-blue-400">Explore?</span>
      </h1>
      <p className="leading-7 [&:not(:first-child)]:mt-6 text-lg font-medium max-w-xl">
        AI-powered research tool that helps quickly explore and analyze real-time news
        articles, and soon research papers, on any topic.
      </p>
      <div className="mt-4 flex flex-row">
        <Button onClick={() => router.push("/auth/register")}>Get Started</Button>
        <Button variant="link" onClick={() => router.push("/about")}>Learn More</Button>
      </div>
    </div>
  );
}

export default Header;