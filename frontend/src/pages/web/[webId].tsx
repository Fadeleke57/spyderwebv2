import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useFetchWebById } from "@/hooks/webs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/context/UserContext";
import WebPlayground from "@/components/webs/WebPlayground";
import WebForm from "@/components/webs/WebForm";
import PublicWebView from "@/components/webs/PublicWebView";
import { useFetchUserById } from "@/hooks/user";
import { formatDistanceToNow } from "date-fns";
import ShareDialog from "@/components/utility/ShareButton";
import UserAvatar from "@/components/utility/UserAvatar";
import {
  SkeletonTextCard,
  SkeletonUserCard,
} from "@/components/utility/SkeletonCard";
import Head from "next/head";
import { Web } from "@/types/web";
import { ArrowLeft, IterationCcw } from "lucide-react";
import { IterateModal } from "@/components/utility/IterateModal";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { Separator } from "@/components/ui/separator";
import ContributersBlock from "@/components/webs/ContributersBlock";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MobileWebView from "@/components/webs/MobileWebForm";

function Index() {
  const router = useRouter();
  const { webId } = router.query;
  const {
    data: webData,
    isLoading: loading,
    error,
    refetch,
  } = useFetchWebById(webId as string);

  const [web, setWeb] = React.useState<Web | null>(webData || null);
  const [showIterateModal, setShowIterateModal] = React.useState(false);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  useEffect(() => {
    if (webData) {
      setWeb(webData);
    }
  }, [webData]);

  const { data: webOwner, isLoading: webOwnerLoading } = useFetchUserById(
    web?.userId as string
  );

  const { data: iteratedFromUser, isLoading: iteratedFromLoading } =
    useFetchUserById(web?.iteratedFrom ? web?.iteratedFrom : "");

  const { user } = useUser();
  const isOwner = user?.id === webOwner?.id;

  const title = loading ? "Loading..." : web?.name || "Web Details";
  const description = loading
    ? "Fetching web details..."
    : web?.description || "View and explore web details.";

  if (error) {
    return (
      <div className="grid h-screen w-full overflow-hidden scrollbar-none">
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta
            property="og:url"
            content={`${
              typeof window !== "undefined" ? window.location.href : ""
            }`}
          />
        </Head>
        <div className="flex h-full w-full flex-col items-center justify-center">
          <h1 className="text-2xl font-semibold">Web not found</h1>
          <p className="text-muted-foreground">
            The web you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-[91dvh] lg:h-screen w-full overflow-hidden scrollbar-none">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`${
            typeof window !== "undefined" ? window.location.href : ""
          }`}
        />
      </Head>
      <div className="flex flex-col">
        <header
          className={`sticky top-0 z-10 flex ${loading ? "animate-pulse" : ""} ${web && web.iteratedFrom ? "h-[90px]" : "h-[80px]"} items-center justify-between gap-1 border-b bg-background px-4`}
        >
          <div className="flex flex-col z-40 items-center justify-start mb-3 lg:mb-0  max-w-[210px] lg:max-w-2xl">
            {loading || webOwnerLoading ? (
              <SkeletonUserCard />
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant={"link"}
                  onClick={() => router.back()}
                  className="flex items-center gap-2 p-0 h-fit w-fit font-semibold text-violet-400"
                >
                  <ArrowLeft strokeWidth={4} className="h-4 w-4" /> Back
                </Button>
                <div className="flex items-center gap-2">
                  <UserAvatar userId={web?.userId} height={28} width={28} />
                  <div className="flex flex-col gap-0">
                    <h1 className="text-xs md:text-base lg:text-sm font-semibold m-0">
                      {webOwner?.username || ""}{" "}
                    </h1>
                    {web?.iteratedFrom ? (
                      <p className="text-xs font-normal text-muted-foreground">
                        Iterated From{" "}
                        <span className="font-semibold text-violet-400 dark:text-violet-400">
                          @{iteratedFromUser?.username}
                        </span>
                      </p>
                    ) : (
                      ""
                    )}

                    <span className="text-xs text-muted-foreground font-normal m-0">
                      {web?.updated &&
                        formatDistanceToNow(new Date(web.updated + "Z"), {
                          addSuffix: true,
                        })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mb-3 lg:mb-0">
            {webOwner && web?.enableAIConnections && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative inline-flex items-center justify-center">
                      <div className="absolute rounded-full bg-violet-400/30 animate-pulse w-6 h-6 blur-sm"></div>
                      <div className="absolute rounded-full bg-violet-400/20 animate-pulse w-8 h-8 blur-md"></div>
                      <div className="relative rounded-full bg-violet-400 w-4 h-4 flex items-center justify-center z-10"></div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isOwner ? (
                      <p>AI connections enabled</p>
                    ) : (
                      <p>
                        {" "}
                        <span className="text-violet-400 font-semibold">
                          {webOwner?.username}{" "}
                        </span>{" "}
                        enabled AI connections
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {web && <MobileWebView web={web} user={user ? user : null} />}

            {user && web && webOwner ? (
              <IterateModal
                open={showIterateModal}
                setIsOpen={setShowIterateModal}
                web={web}
              >
                <Button
                  disabled={
                    web.iterations.includes(user?.id || "") ||
                    webOwner.id === user?.id
                  }
                  size="sm"
                  variant={"outline"}
                >
                  <span className="hidden md:inline lg:inline">Iterate </span>
                  <IterationCcw
                    className="md:ml-2 lg:ml-2"
                    size={16}
                    onClick={() => setShowIterateModal(true)}
                  />
                </Button>
              </IterateModal>
            ) : (
              <Button
                size="sm"
                variant={"outline"}
                onClick={() => setAuthModalOpen(true)}
              >
                <span className="hidden md:inline lg:inline">Iterate </span>
                <IterationCcw className="md:ml-2 lg:ml-2" size={16} />
              </Button>
            )}

            <ShareDialog link={`${window.location.origin}/web/${webId}`} />
          </div>
        </header>
        <div className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3 overflow-hidden scrollbar-none">
          {loading ? (
            <SkeletonTextCard />
          ) : (
            <ScrollArea
              className="relative h-[calc(90vh-18px)] hidden flex-col items-start gap-8 md:flex"
              x-chunk="dashboard-03-chunk-0"
            >
              {web && isOwner ? (
                <WebForm web={web} user={user ? user : null} />
              ) : web ? (
                <PublicWebView web={web} />
              ) : null}
              {webId && web && web.iterations.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <ContributersBlock
                    count={web.iterations.length}
                    webId={webId as string}
                  />
                </>
              )}
            </ScrollArea>
          )}
          {loading ? (
            <div className="flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 lg:col-span-2"></div>
          ) : web ? (
            <WebPlayground
              web={web}
              user={user ? user : null}
              refetch={refetch}
            />
          ) : null}
        </div>
      </div>
      <AuthModal
        referrer={"web"}
        type="login"
        open={authModalOpen}
        setOpen={setAuthModalOpen}
      />
    </div>
  );
}

export default Index;
