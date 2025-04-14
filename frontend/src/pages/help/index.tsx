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

type VideoType = {
  id: number;
  title: string;
  description: string;
  embedId: string;
  duration: string;
  date: string;
};

// Video data organized by category
const videosData = {
  gettingStarted: [
    {
      id: 1,
      title: "Quick App Overview",
      description: "A 2-minute tour of the main features and interface",
      embedId: "abcdefghij", // Replace with your actual Loom embed ID
      duration: "2:15",
      date: "Apr 10, 2025",
    },
    {
      id: 2,
      title: "Setting Up Your Profile",
      description: "How to customize your user profile and preferences",
      embedId: "klmnopqrst", // Replace with your actual Loom embed ID
      duration: "3:42",
      date: "Apr 10, 2025",
    },
    {
      id: 3,
      title: "Navigating the Dashboard",
      description: "Learn how to efficiently navigate through the app",
      embedId: "uvwxyzabcd", // Replace with your actual Loom embed ID
      duration: "4:21",
      date: "Apr 11, 2025",
    },
  ],
  coreWorkflows: [
    {
      id: 4,
      title: "Creating New Projects",
      description: "Step-by-step guide to start and configure new projects",
      embedId: "efghijklmn", // Replace with your actual Loom embed ID
      duration: "5:37",
      date: "Apr 11, 2025",
    },
    {
      id: 5,
      title: "Task Management",
      description: "How to create, assign, and track tasks effectively",
      embedId: "opqrstuvwx", // Replace with your actual Loom embed ID
      duration: "6:19",
      date: "Apr 12, 2025",
    },
    {
      id: 6,
      title: "Collaboration Features",
      description: "Learn to share and collaborate with team members",
      embedId: "yzabcdefgh", // Replace with your actual Loom embed ID
      duration: "4:55",
      date: "Apr 12, 2025",
    },
  ],
  advancedFeatures: [
    {
      id: 7,
      title: "Data Visualization",
      description: "Making the most of charts and reporting features",
      embedId: "ijklmnopqr", // Replace with your actual Loom embed ID
      duration: "7:23",
      date: "Apr 13, 2025",
    },
    {
      id: 8,
      title: "Custom Automation",
      description: "Setting up workflows to automate repetitive tasks",
      embedId: "stuvwxyzab", // Replace with your actual Loom embed ID
      duration: "8:41",
      date: "Apr 13, 2025",
    },
    {
      id: 9,
      title: "Advanced Analytics",
      description: "Deep dive into data analysis and insights",
      embedId: "cdefghijkl", // Replace with your actual Loom embed ID
      duration: "9:17",
      date: "Apr 13, 2025",
    },
  ],
};

// Animation variants
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

// Component for rendering video cards
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
  // Filter state for search functionality
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter videos based on search query
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

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Help Center
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Watch these step-by-step video tutorials to learn how to make the most
          of our app&apos;s features
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative max-w-md mx-auto mb-10"
      >
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          type="search"
          placeholder="Search tutorials..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Tabs and Videos Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Tabs defaultValue="gettingStarted" className="w-full h-fit">
          <TabsList className="w-full max-w-md mx-auto flex flex-col lg:flex-row mb-12 lg:mb-8 h-fit">
            <TabsTrigger
              value="gettingStarted"
              className="truncate p-4 lg:p-2 w-full"
            >
              Getting Started
            </TabsTrigger>
            <TabsTrigger
              value="coreWorkflows"
              className="truncate p-4 lg:p-2 w-full"
            >
              Core Workflows
            </TabsTrigger>
            <TabsTrigger
              value="advancedFeatures"
              className="truncate p-4 lg:p-2 w-full"
            >
              Advanced Features
            </TabsTrigger>
          </TabsList>

          {/* Getting Started Videos */}
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

          {/* Core Workflows Videos */}
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

          {/* Advanced Features Videos */}
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
          team.
        </p>
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium">
          Contact Support
        </button>
      </motion.div>
    </div>
  );
}

Index.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default Index;
