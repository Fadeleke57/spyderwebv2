import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/router";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader,
  Users,
  Star,
  GitFork,
  Book,
  Package,
  Star as StarIcon,
  Pin,
  CirclePlus,
  Link as LinkIcon,
  CircleUser,
  Edit,
} from "lucide-react";
import { useFetchProfileWebs } from "@/hooks/webs";
import { Web } from "@/types/web";
import { format } from "date-fns";
import { useFetchPinnedWebs, useFetchUserByUsername } from "@/hooks/user";
import UserAvatar from "@/components/utility/UserAvatar";
import UserWebSearch from "@/components/webs/UserWebSearch";
import { useUser } from "@/context/UserContext";
import { NewWebModal } from "@/components/webs/NewWebModal";
import { motion } from "framer-motion";
import SimpleTooltip from "@/components/utility/SimpleTooltip";
import { useIsMobile } from "@/hooks/use-mobile";

const VALID_TABS = ["overview", "webs", "packages", "stars"];

function UserProfile() {
  const router = useRouter();
  const { user: viewer } = useUser();
  const isMobile = useIsMobile();
  const { username, tab: tabParam } = router.query;
  const [tab, setTab] = useState("overview");
  const { ref, inView } = useInView();

  useEffect(() => {
    if (
      tabParam &&
      typeof tabParam === "string" &&
      VALID_TABS.includes(tabParam)
    ) {
      setTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setTab(value);

    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, tab: value },
      },
      undefined,
      { shallow: true }
    );
  };

  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useFetchUserByUsername(username as string);

  const {
    data: websData,
    isLoading: websLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchProfileWebs(user?.id || "");

  const {
    data: pinnedWebs,
    isLoading: pinnedWebsLoading,
    error: pinnedWebsError,
  } = useFetchPinnedWebs(user?.id);

  useEffect(() => {
    if (inView && hasNextPage && user) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, user]);

  const allWebs = websData?.pages.flatMap((page) => page.result) || [];

  const webCount = websData?.pages[0]?.total || 0;
  const isOwner = viewer && user && viewer.id === user.id;

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center space-y-4 p-6 border border-muted rounded-2xl shadow-lg bg-card max-w-sm"
        >
          <CircleUser className="mx-auto w-10 h-10" />
          <h2 className="text-xl font-semibold">User Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The user you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
        </motion.div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM yyyy");
    } catch (e) {
      return "Unknown date";
    }
  };

  const joinDate = formatDate(user.created_at);

  return (
    <div className="min-h-screen px-4 lg:px-16 py-8">
      <Head>
        <title>{user.username} - spydr</title>
        <meta
          name="description"
          content={`${user.full_name}'s profile on Spydr`}
        />
      </Head>

      {/* Profile header - Full Width for Mobile */}
      <div className="p-4 border-b">
        <div className="flex flex-col mb-4">
          <div className="flex lg:items-center gap-2">
            <div className="relative">
              {" "}
              {isOwner && (
                <div className="flex items-center justify-center cursor-pointer dark:bg-black/70 dark:hover:bg-black/50 rounded-full p-2 text-xs absolute -top-2 right-0 lg:-right-2">
                  <SimpleTooltip
                    content="Change your avatar"
                    side={"right"}
                    p={2}
                    sideOffset={8}
                  >
                    <Edit
                      onClick={() => router.push("/settings?tab=profile")}
                      size={16}
                    />
                  </SimpleTooltip>
                </div>
              )}
              {!isMobile && (
                <UserAvatar
                  userId={user.id}
                  dimension={96}
                  className="hidden md:block"
                />
              )}
              <UserAvatar
                userId={user.id}
                dimension={48}
                className="md:hidden mr-4"
              />
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                {user.full_name}
              </h1>
              <h2 className="text-base md:text-lg text-muted-foreground">
                @{user.username}
              </h2>
            </div>
          </div>

          {isOwner && (
            <Button
              variant="outline"
              className="mt-4 w-full md:w-auto md:self-start"
              onClick={() => router.push("/settings?tab=profile")}
            >
              Edit profile
            </Button>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm mb-4">{user.bio || "No bio available"}</p>

          <div className="flex flex-col gap-2">
            {/* Social links */}
            {user.website && (
              <div className="flex items-center gap-2">
                <LinkIcon size={16} className="text-muted-foreground" />
                <a
                  href={user.website}
                  className="text-sm hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {user.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}

            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="text-muted-foreground"
              >
                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"></path>
              </svg>
              <span className="text-sm">Joined {joinDate}</span>
            </div>

            {/*<div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users size={16} className="text-muted-foreground" />
                <span>
                  <strong>7</strong> followers
                </span>
              </div>
              <div>
                <span>
                  <strong>4</strong> following
                </span>
              </div>
            </div>
            */}
          </div>

          {user.subscription_plan === "pro" && (
            <Badge variant="outline" className="mt-3">
              {user.subscription_plan}
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="w-full">
        <Tabs
          defaultValue="overview"
          value={tab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="border-b">
            <TabsList className="bg-transparent w-full md:w-auto">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Book size={16} className="mr-2 hidden md:inline" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="webs"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <GitFork size={16} className="mr-2 hidden md:inline" />
                Webs{" "}
                <span className="ml-2 bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                  {websLoading ? "..." : webCount}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="packages"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Package size={16} className="mr-2 hidden md:inline" />
                Feeds
              </TabsTrigger>
              <TabsTrigger
                value="stars"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <StarIcon size={16} className="mr-2 hidden md:inline" />
                Saved{" "}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-4 md:px-0">
            <TabsContent
              value="overview"
              className="mt-4 md:mt-6 data-[state=active]:animate-fadeIn"
            >
              {pinnedWebs && pinnedWebs.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-base md:text-lg font-medium flex items-center gap-2">
                    <Pin size={16} className="text-muted-foreground" />
                    Pinned
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 ml-auto hidden md:flex"
                    >
                      All pinned webs
                    </Button>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pinnedWebs.slice(0, 4).map((web: Web) => (
                      <div
                        key={web.webId}
                        className="border relative rounded-md p-4 hover:bg-muted transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex w-full items-center justify-between gap-2 mb-2">
                            <h3
                              className="font-medium text-violet-400/80 hover:underline cursor-pointer"
                              onClick={() => router.push(`/web/${web.webId}`)}
                            >
                              {web.name}
                            </h3>
                            <Badge
                              variant={
                                web.visibility === "Public"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {web.visibility}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {web.description || "No description"}
                        </p>

                        {web.tags && web.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {web.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="bg-accent/50 text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {web.tags.length > 3 && (
                              <Badge
                                variant="outline"
                                className="bg-accent/50 text-xs"
                              >
                                +{web.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Star size={14} className="mr-1" />
                            {web.likes?.length || 0}
                          </div>
                          <div>Updated {formatDate(web.updated)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="font-medium">No pinned webs yet</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {isOwner
                      ? "Pin your favorite webs to showcase them here"
                      : "This user hasn't pinned any webs yet."}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="webs"
              className="mt-4 md:mt-6 data-[state=active]:animate-fadeIn"
            >
              {isOwner && (
                <div className="border-b pb-4 mb-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
                    <div className="relative flex-1">
                      <UserWebSearch />
                    </div>
                    <NewWebModal>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-11 md:w-auto md:ml-2"
                      >
                        <CirclePlus size={14} className="mr-2" />
                        New
                      </Button>
                    </NewWebModal>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {websLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader className="animate-spin" />
                  </div>
                ) : allWebs.length > 0 ? (
                  allWebs.map((web) => (
                    <div
                      key={web.webId}
                      className="border-b pb-6 mb-6 last:border-0"
                    >
                      <div className="flex justify-between items-start">
                        <div className="">
                          <h3
                            className="font-medium text-violet-400/80 hover:underline text-base md:text-lg cursor-pointer transition-all ease-in-out duration-300"
                            onClick={() => router.push(`/web/${web.webId}`)}
                          >
                            {web.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {web.description || "No description"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            web.visibility === "Public"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {web.visibility}
                        </Badge>
                      </div>

                      {web.tags && web.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {web.tags.slice(0, 3).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="bg-accent/50 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {web.tags.length > 3 && (
                            <Badge
                              variant="outline"
                              className="bg-accent/50 text-xs"
                            >
                              +{web.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                        <div className="flex items-center">
                          <Star size={14} className="mr-1" />
                          {web.likes?.length || 0}
                        </div>
                        <div>Updated {formatDate(web.updated)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <h3 className="font-medium">No webs yet</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      This user hasn&apos;t created any webs or they&apos;re all
                      private
                    </p>
                  </div>
                )}

                <div ref={ref} className="h-10 w-full">
                  {isFetchingNextPage && (
                    <div className="w-full flex justify-center py-4">
                      <Loader className="animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="packages"
              className="mt-4 md:mt-6 data-[state=active]:animate-fadeIn"
            >
              <div className="text-center py-12">
                <h3 className="font-medium">Feeds coming soon</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  This feature is currently in development
                </p>
              </div>
            </TabsContent>

            <TabsContent
              value="stars"
              className="mt-4 md:mt-6 data-[state=active]:animate-fadeIn"
            >
              <div className="text-center py-12">
                <h3 className="font-medium">Saved webs coming soon</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  This feature is currently in development
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default UserProfile;
