import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Search, X } from "lucide-react";
import ConfigForm from "./ConfigForm";
import { ConfigFormValues } from "@/types/article";
import { Undo2 } from "lucide-react";

type ConfigGraphModalProps = {
  setConfig: (value: ConfigFormValues) => void;
};

export default function ConfigGraphModal({ setConfig }: ConfigGraphModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Search size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby="description"
        className="max-w-screen h-screen flex flex-col items-center px-6 pt-15 lg:p-20 overflow-y-auto"
      >
        <DialogHeader className="w-full mx-auto flex flex-row justify-between items-start">
          <div>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-7xl text-left">
              Terminal Search
            </h1>
            <p className="text-md text-muted-foreground text-left">
              Query thousands of articles over the Spydr Terminal.
            </p>
          </div>
          <div className="cursor-pointer rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" onClick={() => setIsOpen(false)}>
            <X size={24} />
            <span>esc</span>
          </div>
        </DialogHeader>
        <ConfigForm setIsOpen={setIsOpen} setConfig={setConfig} />
      </DialogContent>
    </Dialog>
  );
}
