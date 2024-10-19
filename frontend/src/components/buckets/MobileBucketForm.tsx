import React from "react";
import { Bucket } from "@/types/bucket";
import { User } from "next-auth";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { Bird, Info, Rabbit, Settings, Turtle } from "lucide-react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { PublicUser } from "@/types/user";
import BucketForm from "./BucketForm";

type FormProps = {
  bucket: Bucket;
  user: PublicUser | null;
};

function MobileBucketForm({ bucket, user }: FormProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Info className="size-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh] p-4">
        <BucketForm bucket={bucket} user={user} />
      </DrawerContent>
    </Drawer>
  );
}

export default MobileBucketForm;
