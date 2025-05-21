import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useFetchWebById } from "@/hooks/webs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/context/UserContext";
import WebPlayground from "@/components/webs/WebPlayground";
import WebForm from "@/components/webs/WebForm";
import PublicWebView from "@/components/webs/PublicWebView";
import { useFetchUserById, usePinWeb, useUnpinWeb } from "@/hooks/user";
import { formatDistanceToNow } from "date-fns";
import ShareDialog from "@/components/utility/ShareButton";
import UserAvatar from "@/components/utility/UserAvatar";
import {
  SkeletonTextCard,
  SkeletonUserCard,
} from "@/components/utility/SkeletonCard";
import Head from "next/head";
import { Web } from "@/types/web";
import { ArrowLeft, IterationCcw, Pin, PinOff } from "lucide-react";
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
import { useConfigureChat } from "@/hooks/chats";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import FeedbackModal from "@/components/utility/FeedbackModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { environment } from "@/environment/load_env";

function Index() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { webId } = router.query;
  const {
    data: webData,
    isLoading: webLoading,
    error: webError,
    refetch: refetchWeb,
  } = useFetchWebById(webId as string);

  const [web, setWeb] = React.useState<Web | null>(webData || null);
  const [feedbackModalOpen, setFeedbackModalOpen] = React.useState(false);

  const { mutateAsync: pinWeb, isPending: pinLoading } = usePinWeb(
    webId as string
  );
  const { mutateAsync: unpinWeb, isPending: unpinLoading } = useUnpinWeb(
    webId as string
  );
  const [showIterateModal, setShowIterateModal] = React.useState(false);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);

  useEffect(() => {
    if (webData) {
      setWeb(webData);
    }
  }, [webData]);

  const {
    data: webOwner,
    isLoading: webOwnerLoading,
    error: webOwnerError,
  } = useFetchUserById(web ? web.userId : "");

  const {
    data: iteratedFromUser,
    isLoading: iteratedFromLoading,
    error: iteratedFromError,
  } = useFetchUserById(web ? web.iteratedFrom || "" : "");

  const { user, userLoading } = useUser();

  const [isPinned, setPinned] = React.useState(
    user ? user.websPinned.includes(webId as string) : false
  );

  useEffect(() => {
    if (user) {
      setPinned(user.websPinned.includes(webId as string));
    }
  }, [user, webId]);

  const isOwner = user && webOwner && user.id === webOwner.id;

  const title = webLoading ? "Loading..." : web?.name || "Web Details";
  const description = webLoading
    ? "Getting web details..."
    : web?.description || "View and explore web details.";

  const { mutateAsync: configureCharlotte } = useConfigureChat();

  useEffect(() => {
    if (webId) {
      configureCharlotte(webId as string);
    }
  }, [webId, configureCharlotte]);

  const handlePinToggle = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      if (isPinned) {
        await unpinWeb();
        setPinned(false);
        toast({
          title: "Web unpinned",
          description: "The web has been removed from your pinned collection",
        });
      } else {
        await pinWeb();
        setPinned(true);
        toast({
          title: "Web pinned",
          description: "The web has been added to your pinned collection",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pinned status",
        variant: "destructive",
      });
      console.error("Failed to toggle pin status:", error);
    }
  };

  if (webError) {
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
          className={`sticky top-0 z-10 flex ${webLoading && "animate-pulse"} h-[70px] items-center justify-between gap-1 border-b bg-background px-4`}
        >
          <div className="flex flex-col z-40 items-center justify-start mb-3 lg:mb-0  max-w-[210px] lg:max-w-2xl">
            <div className="flex flex-col gap-2">
              <Button
                variant={"link"}
                onClick={() => router.back()}
                className="flex items-center gap-2 p-0 h-fit w-fit text-md font-semibold text-violet-400/80"
              >
                <ArrowLeft strokeWidth={4} className="h-4 w-4" /> Back
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3 lg:mb-0">
            {!isMobile && (
              <FeedbackModal
                triggerVisibile
                open={feedbackModalOpen}
                setOpen={setFeedbackModalOpen}
              />
            )}
            {webOwner && web?.enableAIConnections && (
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div className="relative inline-flex items-center justify-center">
                      <div className="absolute rounded-full bg-violet-400/0 animate-pulse w-6 h-6 blur-sm"></div>
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
                        <span className="text-violet-400/80 font-semibold">
                          {webOwner?.username}{" "}
                        </span>{" "}
                        enabled AI connections
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {web && <MobileWebView web={web} user={user || null} />}
            {webOwner && user && webOwner.id === user.id && (
              <Button
                size="sm"
                variant={"outline"}
                onClick={handlePinToggle}
                disabled={pinLoading || unpinLoading}
                className={
                  isPinned
                    ? "bg-violet-400/30 border-violet-200 hover:bg-violet-400/40"
                    : ""
                }
              >
                {isPinned ? (
                  <>
                    <PinOff className="mr-2" size={16} />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="mr-2" size={16} />
                    Pin
                  </>
                )}
              </Button>
            )}
            {user && web && webOwner ? (
              <>
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
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant={"outline"}
                  onClick={() => setAuthModalOpen(true)}
                >
                  <span className="hidden md:inline lg:inline">Iterate </span>
                  <IterationCcw className="md:ml-2 lg:ml-2" size={16} />
                </Button>
              </>
            )}

            <ShareDialog
              link={`${typeof window !== "undefined" ? window.location.origin : environment.client_url}/web/${webId}`}
            />
          </div>
        </header>
        <div className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3 overflow-hidden scrollbar-none">
          {webLoading ? (
            <div className="flex flex-col gap-4 justify-start">
              <SkeletonUserCard />
              <SkeletonTextCard />
            </div>
          ) : (
            <ScrollArea
              className="relative h-[calc(90vh-18px)] hidden flex-col items-start gap-8 md:flex"
              x-chunk="dashboard-03-chunk-0"
            >
              <div className="flex items-center gap-2 px-3">
                <UserAvatar showTooltip userId={web?.userId} dimension={38} />
                <div className="flex flex-col gap-0">
                  <h1 className="text-xs md:text-base flex items-center lg:text-sm font-semibold m-0">
                    {webOwnerLoading ? "Loading..." : ""}
                    {(webOwner && webOwner.full_name) || ""}{" "}
                  </h1>
                  <span className="text-foreground font-semibold text-xs">
                    @{webOwner && webOwner.username}
                  </span>
                  {web && web.iteratedFrom ? (
                    <p className="text-xs font-normal text-muted-foreground">
                      Iterated From{" "}
                      <span className="font-semibold text-violet-400/80 dark:text-violet-400/80">
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

              {web && user && isOwner && <WebForm web={web} user={user} />}
              {web &&
                !isOwner &&
                !webLoading &&
                !webOwnerLoading &&
                !userLoading && <PublicWebView web={web} />}

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
          {!web && (
            <Skeleton className="flex h-full lg:h-[calc(90vh-18px)] flex-col rounded-xl lg:col-span-2"></Skeleton>
          )}
          {web && (
            <WebPlayground
              web={web}
              user={user || null}
              refetchWeb={refetchWeb}
            />
          )}
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
