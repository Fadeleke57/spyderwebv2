import React from "react";
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
import { Button } from "@/components/ui/button";

function MCPOnboardModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogHeader>
        <DialogTitle>MCP Onboard Modal</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <DialogDescription>MCP Onboard Modal</DialogDescription>
      </DialogContent>
      <DialogFooter>
        <DialogClose asChild>
          <Button>Close</Button>
        </DialogClose>
      </DialogFooter>
    </Dialog>
  );
}

export default MCPOnboardModal;
