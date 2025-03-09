import React from "react";
import { Web } from "@/types/web";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Info, Scroll } from "lucide-react";
import { PublicUser } from "@/types/user";
import WebForm from "./WebForm";
import PublicWebView from "./PublicWebView";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "../ui/scroll-area";

type FormProps = {
  web: Web;
  user: PublicUser | null;
};

function MobileWebForm({ web, user }: FormProps) {
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
          {web?.userId === user?.id ? (
            <WebForm web={web} user={user} />
          ) : (
            <PublicWebView web={web} />
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

export default MobileWebForm;
