import React, { useState } from "react";
import { Copy, Check, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer";

const ShareDialog = ({ link }: { link: string }) => {
  const isMobile = useIsMobile();

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy!", error);
    }
  };

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            
            size="sm"
            className="ml-auto gap-1.5 text-sm"
          >
            <Share className="size-3.5" />
            <span className="hidden md:inline lg:inline">Share</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="min-h-[50vh]">
          <DrawerHeader className="p-6">
            <DrawerTitle className="text-left">Share link</DrawerTitle>
            <DrawerDescription className="text-left">
              If this is a public bucket, you can share it with anyone.
              Private sharing is not supported yet.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex items-center space-x-2 px-6">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={link}
                readOnly
                className="select-all"
              />
            </div>
            <Button
              onClick={handleCopy}
              size="sm"
              className="px-3 transition-all duration-200 relative"
            >
              <span className="sr-only">Copy</span>
              <div className="relative">
                <Copy
                  size={16}
                  className={`transition-all duration-200 ${
                    copied ? "opacity-0 scale-50" : "opacity-100 scale-100"
                  }`}
                />
                <Check
                  size={16}
                  className={`absolute inset-0 transition-all duration-200 text-white-500 ${
                    copied ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  }`}
                />
              </div>
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="ml-auto gap-1.5 text-sm">
          <Share className="size-3.5" />
          <span className="hidden md:inline lg:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            If this is a public bucket, you can share it with anyone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue={link}
              readOnly
              className="select-all"
            />
          </div>
          <Button
            onClick={handleCopy}
            size="sm"
            className="px-3 transition-all duration-200 relative"
          >
            <span className="sr-only">Copy</span>
            <div className="relative">
              <Copy
                size={16}
                className={`transition-all duration-200 ${
                  copied ? "opacity-0 scale-50" : "opacity-100 scale-100"
                }`}
              />
              <Check
                size={16}
                className={`absolute inset-0 transition-all duration-200 text-white-500 ${
                  copied ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
              />
            </div>
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
