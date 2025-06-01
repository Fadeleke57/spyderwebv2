import React, { useCallback, useEffect } from "react";
import withAuth from "@/hoc/withAuth";
import { TrendingSearchCarousel } from "@/components/home/TrendingSearchCarousel";
import { ProjectsCarousel } from "@/components/home/ProjectsCarousel";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { User } from "lucide-react";
import sLogo from "@/assets/slogonobg.png";
import { getTimeBasedGreeting } from "@/lib/utils";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Index() {
  const router = useRouter();
  const greeting = getTimeBasedGreeting("America/New_York");
  const { user } = useUser();
  const { src } = router.query;

  const [MCPModalOpen, setMCPModalOpen] = React.useState(false);

  const removeAllQueryParams = useCallback(() => {
    router.replace(router.pathname, undefined, { shallow: true });
  }, [router]);

  useEffect(() => {
    console.log("src", src);
    if (src === "mcp_auth_complete") {
      setMCPModalOpen(true);
      setTimeout(() => {
        setMCPModalOpen(false);
        removeAllQueryParams();
      }, 10000);
    }
  }, [src, removeAllQueryParams]);

  return (
    <div className="flex flex-col gap-12 lg:gap-16 p-6 pt-16 pb-36 lg:py-16 lg:px-16 min-h-screen overflow-x-hidden w-full mx-auto">
      <Head>
        <title>{"home - spydr"}</title>
        <meta name="description" content={"Welcome to spydr"} />
        <meta property="og:title" content={user?.full_name} />
        <meta property="og:description" content={"Welcome to spydr"} />
        <meta
          property="og:url"
          content={`${
            typeof window !== "undefined" ? window.location.href : ""
          }`}
        />
      </Head>
      <User
        onClick={() => router.push(`/user/${user?.username}`)}
        className="absolute top-6 right-4 lg:top-8 lg:right-8 cursor-pointer hover:opacity-50"
      />

      <div className="flex flex-col lg:flex-row gap-2 w-full items-center justify-center">
        <Image src={sLogo} alt="spydr logo" className="w-12 h-12" />
        <h1 className="text-2xl text-center lg:text-3xl font-extrabold tracking-tight">
          {greeting}, {user?.username}
        </h1>
      </div>

      <div>
        <span className="text-md font-semibold ml-2 dark:text-muted-foreground">
          Popular
        </span>
        <TrendingSearchCarousel />
      </div>
      <div>
        <div className="flex flex-col">
          <span className="text-md font-semibold ml-2 dark:text-muted-foreground">
            Recent Webs
          </span>{" "}
          <Link
            href={`/user/${user?.username}?tab=webs`}
            className="ml-2 text-violet-400 hover:underline"
          >
            View All
          </Link>
        </div>

        <ProjectsCarousel />
      </div>
      <MCPAuthCompleteModal open={MCPModalOpen} setOpen={setMCPModalOpen} />
    </div>
  );
}

const MCPAuthCompleteModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-10 max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Authentication Complete</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-md">
          You have successfully authenticated with your MCP account. Feel free
          to close this window and return to your session.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default withAuth(Index);
