import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ConfirmImageModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  stagedImages: File[];
  onConfirm: () => Promise<void>;
  onRemoveImage: (index: number) => void;
  isPending: boolean;
}

const ConfirmImageModal = ({
  open,
  setOpen,
  stagedImages,
  onConfirm,
  onRemoveImage,
  isPending,
}: ConfirmImageModalProps) => {
    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Confirm Images</DialogTitle>
          <DialogDescription>
            Review your selected images before uploading
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="w-full h-full max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4 p-2">
            {stagedImages.map((file, index) => (
              <div key={index} className="relative group">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Staged image ${index + 1}`}
                  width={300}
                  height={200}
                  unoptimized
                  className="w-full h-auto object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveImage(index)}
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
                <div className="mt-1 text-sm text-muted-foreground">
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>

        <DialogFooter className="flex flex-row gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending || stagedImages.length === 0}
          >
            {isPending ? "Uploading..." : "Upload Images"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmImageModal;
