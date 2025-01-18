import React from "react";
import { Bucket } from "@/types/bucket";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Info, Scroll } from "lucide-react";
import { PublicUser } from "@/types/user";
import BucketForm from "./BucketForm";
import PublicBucketView from "./PublicBucketView";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "../ui/scroll-area";

type FormProps = {
  bucket: Bucket;
  user: PublicUser | null;
};

function MobileBucketForm({ bucket, user }: FormProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Info className="size-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className="max-h-[95dvh] p-4"
        aria-describedby={undefined}
      >
        <DrawerTitle hidden>Title</DrawerTitle>
        <ScrollArea className="h-[60vh]">
          <ScrollBar orientation="horizontal" />
          {bucket?.userId === user?.id ? (
            <BucketForm bucket={bucket} user={user} />
          ) : (
            <PublicBucketView bucket={bucket} />
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

export default MobileBucketForm;
