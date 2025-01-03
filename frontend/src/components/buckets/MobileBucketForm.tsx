import React from "react";
import { Bucket } from "@/types/bucket";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Info} from "lucide-react";
import { PublicUser } from "@/types/user";
import BucketForm from "./BucketForm";
import PublicBucketView from "./PublicBucketView";

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
      <DrawerContent className="min-h-[80vh] p-4" aria-describedby={undefined}>
        <DrawerTitle hidden>Title</DrawerTitle>
        {bucket?.userId === user?.id ? (
          <BucketForm bucket={bucket} user={user} />
        ) : (
          <PublicBucketView bucket={bucket} user={user} />
        )}
      </DrawerContent>
    </Drawer>
  );
}

export default MobileBucketForm;
