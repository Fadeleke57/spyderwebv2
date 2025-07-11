// components/feeds/FeedGrid.tsx
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { CheckCircle, Link2 } from "lucide-react";
import { feedMap } from "@/lib/constants";

// Props: `connected` contains the user’s active feeds (feedType strings)
export default function FeedGrid(
  { connected }: { connected: string[] } = { connected: [] }
) {
  console.log(connected);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.values(feedMap).map((feed: any) => {
        const isConnected = connected.includes(feed.name);
        console.log(`${feed.name} is connected: ${isConnected}`)
        return (
          <Card
            key={feed.key}
            className="group cursor-pointer hover:border-primary transition-colors duration-150"
          >
            <CardHeader className="flex items-center gap-3">
              <Image
                src={feed.image}
                alt={feed.name}
                width={32}
                height={32}
                className="rounded"
              />
              <div className="font-medium">{feed.name}</div>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground">
              {feed.description}
            </CardContent>

            <CardFooter className="mt-2 flex justify-between items-center">
              <a
                href={feed.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs hover:underline"
              >
                <Link2 className="w-3 h-3 mr-1" />
                Docs
              </a>

              {isConnected ? (
                <div className="flex items-center text-xs font-medium text-emerald-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log("Connect feed");
                  }}
                >
                  Connect
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
