import { Button } from "../ui/button";
import TerminalDemo from "./TerminalDemo";
import { ChartBarBig } from "lucide-react";
import { useRouter } from "next/router";

export default function Demo() {
  const router = useRouter();
  return (
    <div className="relative mt-32 lg:mt-20 flex flex-col gap-10 lg:gap-0 lg:flex-row rounded-xl lg:bg-muted lg:p-10 ">
      <div className="lg:pr-16 h-fit lg:border-b-2 lg:border-slate-300 lg:pb-4">
        <h1 className="text-3xl sm:text-4xl lg:text-4xl font-bold tracking-tight mb-2 sm:mb-4 max-w-3xl mx-auto">
          <span className="text-blue-500">organize</span> and <span className="text-blue-500">understand</span> the full context of
          your deep dives.
        </h1>
        <p className="leading-7 mt-4 text-semibold sm:text-lg font-medium max-w-full sm:max-w-sm lg:max-w-md mx-auto sm:mx-0 text-muted-foreground">
          Visualize connections and gain insights between websites, documents, youtube videos, and
          even your own notes.
        </p>
        <Button
          className="mt-6"
          variant={"outline"}
          onClick={() => router.push("/about")}
        >
          <ChartBarBig className="mr-2" />
          Why this matters
        </Button>
      </div>
      <TerminalDemo />
    </div>
  );
}
