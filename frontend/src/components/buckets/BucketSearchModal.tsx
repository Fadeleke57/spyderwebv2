import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, X } from "lucide-react";
import ConfigForm from "../terminal/ConfigForm";
import { ConfigFormValues } from "@/types/article";
import { Undo2 } from "lucide-react";
import { Bucket } from "@/types/bucket";
import BucketConfigForm from "./BucketConfigForm";

type ConfigGraphModalProps = {
    setConfig: (value: ConfigFormValues) => void;
    bucket: Bucket
};

export default function BucketSearchModal({
    setConfig,
    bucket
}: ConfigGraphModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} className="mt-4">
          <Search size={16} className="mr-2 cursor-pointer" />
          Curate my sources
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby="description"
        className="max-w-[80vw] h-[80vh] flex flex-col items-center px-6 pt-15 lg:p-20 overflow-y-auto"
      >
        <DialogHeader className="w-full mx-auto flex flex-row justify-between items-start">
          <div className="space-y-4">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-7xl text-left">
              Spydr Search
            </h1>
            <p className="text-md text-muted-foreground text-left">
              It isn't about the answers, it's the steps that'll get you there.
            </p>
          </div>
          <div
            className="cursor-pointer rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
            <span>esc</span>
          </div>
        </DialogHeader>
        <BucketConfigForm  bucket={bucket} setIsOpen={setIsOpen} setConfig={setConfig} />
      </DialogContent>
    </Dialog>
  );
}
