import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Info } from "lucide-react";
import WebForm from "./WebForm";
import PublicWebView from "./PublicWebView";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "../ui/scroll-area";
import { useUser } from "@/providers/UserProvider";
import { useFetchWebById } from "@/hooks/webs";

function MobileWebView({ webId }: { webId: string }) {
  const { data: web } = useFetchWebById(webId);
  const { user } = useUser();
  const isOwner = web && user && web.userId === user.id;
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Info className="size-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[95dvh] p-4" aria-describedby={undefined}>
        <DrawerTitle hidden>Title</DrawerTitle>
        <ScrollArea className="h-[60vh]">
          <ScrollBar orientation="horizontal" />
          {isOwner ? (
            <WebForm webId={webId} />
          ) : (
            <PublicWebView webId={webId} />
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

export default MobileWebView;
