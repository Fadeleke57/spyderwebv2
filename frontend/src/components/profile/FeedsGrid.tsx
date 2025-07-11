import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { CheckCircle, ExternalLink, Settings } from "lucide-react";
import { feedMap } from "@/lib/constants";
import Link from "next/link";

export default function FeedGrid(
  { connected }: { connected: string[] } = { connected: [] }
) {
  console.log(connected);
  return (
    <div>
      <Button className="flex items-center py-1 h-fit w-fit rounded-full text-sm transition-colors duration-150 mb-3 hover:bg-neon hover:text-black dark:hover:text-black dark:hover:bg-neon">
        <Settings size={16} className="mr-2" />
        <span className="font-semibold">Settings</span>
      </Button>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(feedMap).map((feed: any) => {
          const isConnected = connected.includes(feed.name);
          console.log(`${feed.name} is connected: ${isConnected}`);
          return (
            <Card
              key={feed.key}
              className={`relative group transition-colors duration-150 ${feed.category === "AI" && !isConnected ? "border-muted" : ""}`}
            >
              <div className="flex flex-col justify-between h-full">
                <CardHeader className="flex flex-col justify-start gap-2">
                  <div
                    className={`h-16 w-16 group-hover:border-neon overflow-hidden border rounded flex items-center justify-center ${feed.name === "Tiktok" ? "bg-black" : "bg-foreground"} ${feed.zoom ? "p-2" : ""} transition-colors ease-in-out duration-150`}
                  >
                    <Image
                      src={feed.image}
                      alt={feed.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>

                  <div className="font-medium">{feed.name}</div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {feed.description}
                </CardContent>
              </div>

              <div className="absolute top-3 right-4">
                {isConnected && (
                  <div className="flex items-center text-xs font-medium text-neon">
                    <CheckCircle size={16} className="mr-1" />
                    Synced
                  </div>
                )}

                {!isConnected && (
                  <Link
                    href={feed.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-primary hover:text-black hover:bg-neon rounded-full px-2 py-1 transition-colors duration-150"
                  >
                    Sync
                  </Link>
                )}
              </div>
              <Link
                href={feed.link}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 text-muted-foreground right-2 text-xs hover:text-black hover:bg-neon rounded-full px-2 py-1 transition-colors duration-150"
              >
                <ExternalLink size={16} />
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
