import { Button } from "../ui/button";
import TerminalDemo from "./TerminalDemo";
import { ChartBarBig } from "lucide-react";

export default function Demo() {
  return (
    <div className="relative mt-32 lg:mt-20 flex flex-col gap-10 lg:flex-row rounded-xl lg:bg-muted lg:p-10 ">
      <div className="pt-0 lg:px-0 lg:pt-0">
        <h1 className="text-3xl sm:text-4xl lg:text-4xl font-bold tracking-tight mb-2 sm:mb-4 max-w-7xl mx-auto">
          An <span className="text-blue-500">all-in-one</span> research tool for
          understanding the full context of your news.
        </h1>
        <p className="leading-7 mt-4 text-base sm:text-lg font-medium max-w-full sm:max-w-sm lg:max-w-xl mx-auto sm:mx-0">
          Visualize connections between articles, track bias, and conduct deep,
          interactive research that goes beyond simple summaries.
        </p>
        <Button className="mt-6" variant={"outline"}><ChartBarBig className="mr-2"/>Why this matters</Button>
      </div>
      <TerminalDemo />
    </div>
  );
}
