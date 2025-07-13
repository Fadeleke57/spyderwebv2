import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useFetchWebById } from "@/hooks/webs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/providers/UserProvider";
import WebPlayground from "@/components/webs/WebPlayground";
import WebForm from "@/components/webs/WebForm";
import PublicWebView from "@/components/webs/PublicWebView";
import { useFetchUserById, usePinWeb, useUnpinWeb } from "@/hooks/user";
import { formatDistanceToNow } from "date-fns";
import SharePopover from "@/components/utility/ShareButton";
import UserAvatar from "@/components/utility/UserAvatar";
import {
  SkeletonTextCard,
  SkeletonUserCard,
} from "@/components/utility/SkeletonCard";
import Head from "next/head";
import { Web } from "@/types/web";
import {
  ArrowLeft,
  Check,
  CopyIcon,
  IterationCcw,
  Pin,
  PinOff,
} from "lucide-react";
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
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import FeedbackModal from "@/components/utility/FeedbackModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSourceStore } from "@/store/sourceStore";
import SimpleTooltip from "@/components/utility/SimpleTooltip";
import { useCheckAuthorizedUser } from "@/hooks/contributors";
import InviteModal from "@/components/webs/InviteModal";
import { AuthorizationProvider } from "@/providers/AuthorizationProvider";

function Index() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { webId, src } = router.query;
  const { user } = useUser();
  const { setIsUploadingSource } = useSourceStore();
  const { mutateAsync: pinWeb, isPending: pinLoading } = usePinWeb(
    webId as string,
    user ? user.id : null
  );
  const { mutateAsync: unpinWeb, isPending: unpinLoading } = useUnpinWeb(
    webId as string,
    user ? user.id : null
  );
  const {
    data: webData,
    isLoading: webLoading,
    error: webError,
  } = useFetchWebById(webId as string);

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [showIterateModal, setShowIterateModal] = useState(false);
  const [web, setWeb] = useState<Web | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPinned, setPinned] = useState(
    user && user.websPinned.includes(webId as string)
  );
  const { data: userAuth } = useCheckAuthorizedUser(webId as string);
  const { accessLevel } = userAuth || {
    accessLevel: "read",
    invitePending: false,
  };
  const isOriginalOwner = web && user && web.userId == user.id;
  const isOwner = accessLevel === "owner";
  const canWrite = accessLevel === "write" || isOwner;
  const canRead = accessLevel === "read" || canWrite;

  useEffect(() => {
    const returnTo = localStorage.getItem("returnTo");
    if (returnTo) {
      localStorage.removeItem("returnTo");
      window.location.href = returnTo;
    }
  }, []);

  const handleBack = () => {
    router.back();
  };

  const title = webLoading ? "Loading..." : (web && web.name) || "Web Details";
  const description = webLoading
    ? "Getting web details..."
    : (web && web.description) || "View and explore web details.";
  const { data: webOwner } = useFetchUserById(web && web.userId);
  const { data: iteratedFromUser } = useFetchUserById(web && web.iteratedFrom);

  useEffect(() => {
    if (src === "invite" && !user) {
      router.push("/auth?src=invite");
      localStorage.setItem("returnTo", window.location.href);
    }
    if (webData) {
      setWeb(webData);
    }
  }, [webData, src, user, router]);

  useEffect(() => {
    if (user) {
      setPinned(user.websPinned.includes(webId as string));
    }
  }, [user, webId]);

  useEffect(() => {
    if (webId) {
      setIsUploadingSource(false);
    }
  }, [webId, setIsUploadingSource]);

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
      <AuthorizationProvider web={web}>
        <div className="flex flex-col">
          <header
            className={`sticky top-0 z-10 flex ${webLoading && "animate-pulse"} h-[70px] items-center justify-between gap-1 border-b bg-background px-4 bg-background/40 backdrop-blur-md `}
          >
            <div className="flex flex-col z-40 items-center justify-start mb-3 lg:mb-0  max-w-[210px] lg:max-w-2xl">
              <div className="flex flex-col gap-2">
                <div
                  onClick={() => {
                    handleBack();
                  }}
                  className={`flex cursor-pointer bg-transparent items-center group gap-2 p-0 h-fit w-fit text-md font-semibold text-violet-400/80`}
                >
                  <ArrowLeft
                    strokeWidth={4}
                    className="h-4 w-4 group-hover:-translate-x-1 transition-all ease-linear duration-150"
                  />{" "}
                  <span>Back</span>
                </div>
              </div>
            </div>
            {web && (
              <div className="hidden md:flex items-center gap-4 mb-3 lg:mb-0  -mt-10">
                <SimpleTooltip
                  content="Copy web identifier to use with any LLM"
                  side="bottom"
                  sideOffset={6}
                >
                  <div
                    className="text-sm border dark:bg-violet-400/40 dark:border-violet-200 dark:hover:bg-violet-400/60 px-2 py-1 rounded-b-lg z-10 flex items-center cursor-pointer font-semibold transition-colors"
                    onClick={() => {
                      const textToCopy = `Refer to this web: @Web-${web.webId}\n`;
                      navigator.clipboard.writeText(textToCopy).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      });
                    }}
                  >
                    {web && `@Web-${web.webId}`}{" "}
                    {copied ? (
                      <Check
                        strokeWidth={2}
                        size={16}
                        className="ml-2 text-foreground transition-transform"
                      />
                    ) : (
                      <CopyIcon
                        strokeWidth={2}
                        size={16}
                        className="ml-2 text-foreground transition-transform"
                      />
                    )}
                  </div>
                </SimpleTooltip>{" "}
                {webOwner && web?.enableAIConnections && (
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <div className="relative inline-flex items-center justify-center">
                          <div className="absolute rounded-full bg-violet-400/0 animate-pulse w-5 h-5 blur-sm"></div>
                          <div className="absolute rounded-full bg-violet-400/20 animate-pulse w-6 h-6 blur-md"></div>
                          <div className="relative rounded-full bg-violet-400 w-3 h-3 flex items-center justify-center z-10"></div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isOriginalOwner ? (
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
              </div>
            )}
            <div className="flex items-center gap-2 mb-3 lg:mb-0">
              {!isMobile && (
                <FeedbackModal
                  triggerVisibile
                  open={feedbackModalOpen}
                  setOpen={setFeedbackModalOpen}
                />
              )}

              {web && <MobileWebView webId={web.webId} />}
              {canRead && (
                <SimpleTooltip content={isPinned ? "Unpin Web" : "Pin Web"}>
                  <Button
                    size="sm"
                    variant={"outline"}
                    onClick={handlePinToggle}
                    disabled={pinLoading || unpinLoading}
                    className={
                      isPinned
                        ? "bg-violet-400/30 border-violet-200 dark:hover:bg-violet-400/40"
                        : ""
                    }
                  >
                    {isPinned ? (
                      <>
                        <PinOff size={16} />
                      </>
                    ) : (
                      <>
                        <Pin size={16} />
                      </>
                    )}
                  </Button>
                </SimpleTooltip>
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
                      {" "}
                      <IterationCcw
                        className="md:mr-2 lg:mr-2"
                        size={16}
                        onClick={() => setShowIterateModal(true)}
                      />
                      <span className="hidden md:inline lg:inline">
                        Iterate{" "}
                      </span>
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

              <SharePopover />
            </div>
          </header>
          <div className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3 overflow-hidden scrollbar-none">
            {webLoading ? (
              <div className="hidden lg:flex flex-col gap-4 justify-start">
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
                      {webOwner ? webOwner.full_name : "Loading..."}{" "}
                    </h1>
                    <span className="text-foreground font-semibold text-xs">
                      @{webOwner ? webOwner.username : "Loading..."}
                    </span>
                    {web && web.iteratedFrom ? (
                      <p className="text-xs font-normal text-muted-foreground">
                        Iterated From{" "}
                        <span className="font-semibold text-violet-400/80 dark:text-violet-400/80">
                          @
                          {iteratedFromUser
                            ? iteratedFromUser.username
                            : "Loading..."}
                        </span>
                      </p>
                    ) : (
                      ""
                    )}

                    <span className="text-xs text-muted-foreground font-normal m-0">
                      {web &&
                        web.updated &&
                        formatDistanceToNow(new Date(web.updated + "Z"), {
                          addSuffix: true,
                        })}
                    </span>
                  </div>
                </div>

                {web && <WebForm webId={web.webId} />}
                {web && <PublicWebView webId={web.webId} />}

                {webId && web && web.iterations.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <ContributersBlock count={web.iterations.length} />
                  </>
                )}
              </ScrollArea>
            )}
            {!web && (
              <Skeleton className="flex h-full lg:h-[calc(90vh-18px)] flex-col rounded-xl lg:col-span-2"></Skeleton>
            )}
            {web && <WebPlayground />}
          </div>
        </div>
      </AuthorizationProvider>
      <InviteModal />
      <AuthModal open={authModalOpen} setOpen={setAuthModalOpen} />
    </div>
  );
}

export default Index;
