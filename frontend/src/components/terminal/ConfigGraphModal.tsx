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
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import ConfigForm from "./ConfigForm";

type ConfigGraphModalProps = {
  setQuery: (value: string) => void;
};

export default function ConfigGraphModal({ setQuery }: ConfigGraphModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Search size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[300px]">
        <div className="flex flex-col gap-6 py-2">
          <ConfigForm setIsOpen={setIsOpen} setQuery={setQuery} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
