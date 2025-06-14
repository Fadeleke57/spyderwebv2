import PublicLayout from "@/app/PublicLayout";
import React, { ReactElement } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

type VideoType = {
  id: number;
  title: string;
  description: string;
  embedId: string;
  duration: string;
  date: string;
};

const videosData = {
  gettingStarted: [
    {
      id: 1,
      title: "Quick Intro To Webs",
      description: "A quick video showing the basics of navigating webs.",
      embedId:
        "6ee83a7d81fc4747bfd1dad3ecfb7cb9?sid=5e9521d4-6ddc-452a-acff-365c9424e970",
      duration: "4:06",
      date: "Jun 9, 2025",
    },
    {
      id: 2,
      title: "Setting Up Your Profile",
      description: "How to customize your user profile and preferences",
      embedId:
        "83a370b6d8c04346b713e0647f2932c5?sid=166b64f0-57d3-40fb-870a-84ec3c95aa9e",
      duration: "1:00",
      date: "Jun 9, 2025",
    },
    {
      id: 3,
      title: "Publishing Your First Web",
      description:
        "A step-by-step guide on how to create and publish your first knowledge web",
      embedId:
        "54f19ce7eaf94a8ab404c24edfcbfdfe?sid=42611d9e-997f-43e1-895b-07620a05a04d",
      duration: "1:33",
      date: "Jun 9, 2025",
    },
  ],
  coreWorkflows: [
    {
      id: 4,
      title: "Basics of Iterating Webs",
      description: "Step-by-step guide to iterate webs and add content",
      embedId:
        "4419052889c545f68d77b30ccef323b8?sid=2025079f-9f58-433d-819b-b2b4e24d95d4",
      duration: "2:05",
      date: "Jun 10, 2025",
    },
    {
      id: 5,
      title: "Connections and the Autolinker",
      description:
        "An explanation of how connections work and how to use the autolinker",
      embedId:
        "4b0527e778a04aa6bc7b20ab4ad8c422?sid=b9b7192d-a727-4d54-92dd-e6d868e1f8aa",
      duration: "4:01",
      date: "Jun 10, 2025",
    },
  ],
  advancedFeatures: [
    {
      id: 7,
      title: "MCP Installation",
      description: "How to install and configure the Spydr Memory MCP",
      embedId:
        "e1aaaedf670a4978a8e1fbab08637ac3?sid=fee35afb-4b86-47c6-b6ec-b687b2ec0cd3",
      duration: "1:35",
      date: "Jun 10, 2025",
    },
    {
      id: 8,
      title: "MCP Usage Introduction",
      description: "An introduction to using the Spydr Memory MCP with Claude",
      embedId:
        "c8e0deb89ee84e18a5ee5c2e15d65e6d?sid=e9b96d30-8d78-478c-9dea-2ab66c5e9851",
      duration: "5:00",
      date: "Jun 10, 2025",
    },
    {
      id: 9,
      title: "Context Orchestation and Managment",
      description:
        "Using the Spydr Memory MCP to orchestrate contexts to fit your use case",
      embedId:
        "d8937a0121d4461281f0d26e41fe6b1f?sid=d2ce340c-a58c-4c01-8c24-201f09ea2ed0",
      duration: "4:43",
      date: "Jun 10, 2025",
    },
  ],
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const VideoCard = ({ video }: { video: VideoType }) => {
  return (
    <motion.div variants={item}>
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{video.title}</CardTitle>
          <CardDescription>{video.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 aspect-video">
          <div className="relative h-full w-full">
            <iframe
              src={`https://www.loom.com/embed/${video.embedId}`}
              frameBorder="0"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground pt-4">
          <span>{video.duration}</span>
          <span>Added {video.date}</span>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

function Index() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isInputActive, setIsInputActive] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState("gettingStarted");
  const router = useRouter();
  const { src } = router.query;

  // initialize tab based on URL parameter
  React.useEffect(() => {
    if (src) {
      const validTabs = ["gettingStarted", "coreWorkflows", "advancedFeatures"];
      const tabFromUrl = src === "mcp" ? "advancedFeatures" : (src as string);

      if (validTabs.includes(tabFromUrl)) {
        setSelectedTab(tabFromUrl);
      }
    }
  }, [src]);

  // handle tab change and update URL
  const handleTabChange = (newTab: string) => {
    setSelectedTab(newTab);
    router.replace(
      {
        pathname: router.pathname,
        query: { src: newTab },
      },
      undefined,
      { shallow: true }
    );
  };

  const filterVideos = (videos: VideoType[]) => {
    if (!searchQuery) return videos;
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="container mx-auto px-12 py-16 max-w-7xl">
      <Head>
        <title>Help Center</title>
        <meta
          name="description"
          content="Help videos and tutorials for our app"
        />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-xl font-extrabold tracking-tight lg:text-2xl mb-2">
          Help Center
        </h1>
        <p className="text-md text-muted-foreground max-w- mx-auto">
          Watch these step-by-step video tutorials to learn how to make the most
          of our platform&apos;s features
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Tabs
          value={selectedTab}
          onValueChange={handleTabChange}
          className="w-full h-fit"
        >
          <div className="flex flex-col lg:flex-row items-center gap-2 mb-10">
            <div className="relative w-full h-full">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isInputActive ? "text-primary" : "text-muted-foreground"
                }`}
                size={18}
              />
              <Input
                type="search"
                placeholder="Search tutorials..."
                className="pl-10 bg-muted"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsInputActive(true)}
                onBlur={() => setIsInputActive(false)}
              />
            </div>
            <TabsList className="w-full bg-transparent mx-auto flex flex-col lg:flex-row h-fit">
              <TabsTrigger
                value="gettingStarted"
                className="truncate p-4 lg:p-2 w-full data-[state=active]:border data-[state=active]:dark:bg-violet-400/40 data-[state=active]:dark:border-violet-200"
              >
                Getting Started
              </TabsTrigger>
              <TabsTrigger
                value="coreWorkflows"
                className="truncate p-4 lg:p-2 w-full data-[state=active]:border data-[state=active]:dark:bg-violet-400/40 data-[state=active]:dark:border-violet-200"
              >
                Core Workflows
              </TabsTrigger>
              <TabsTrigger
                value="advancedFeatures"
                className="truncate p-4 lg:p-2 w-full data-[state=active]:border data-[state=active]:dark:bg-violet-400/40 data-[state=active]:dark:border-violet-200"
              >
                Advanced Features
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="gettingStarted">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filterVideos(videosData.gettingStarted).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </motion.div>
            {filterVideos(videosData.gettingStarted).length === 0 && (
              <p className="text-center py-10 text-muted-foreground">
                No videos match your search criteria
              </p>
            )}
          </TabsContent>

          <TabsContent value="coreWorkflows">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filterVideos(videosData.coreWorkflows).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </motion.div>
            {filterVideos(videosData.coreWorkflows).length === 0 && (
              <p className="text-center py-10 text-muted-foreground">
                No videos match your search criteria
              </p>
            )}
          </TabsContent>

          <TabsContent value="advancedFeatures">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filterVideos(videosData.advancedFeatures).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </motion.div>
            {filterVideos(videosData.advancedFeatures).length === 0 && (
              <p className="text-center py-10 text-muted-foreground">
                No videos match your search criteria
              </p>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Additional Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-16 text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Need more help?</h2>
        <p className="text-muted-foreground mb-6">
          Can&apos;t find what you&apos;re looking for? Reach out to our support
          team or join our{" "}
          <span
            className="font-semibold cursor-pointer text-violet-400 hover:underline"
            onClick={() => {
              window.open("https://discord.com/invite/pVQQRkyECV", "_blank");
            }}
          >
            Discord
          </span>
          .
        </p>
        <Button
          onClick={() => {
            window.location.href = "mailto:farouk@spydr.dev";
          }}
          className="border dark:bg-violet-400/40 dark:border-violet-200 dark:hover:bg-violet-400/60"
        >
          Contact Support
        </Button>
      </motion.div>
    </div>
  );
}

Index.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default Index;
