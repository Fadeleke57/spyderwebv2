import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

function DeleteModal({
  onDelete,
  isPending,
  children,
  itemType,
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  itemType: string;
  onDelete: () => Promise<void> | void;
  isPending: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-10">
        <DialogHeader>
          <DialogTitle>Delete {itemType}.</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this {itemType}? This action cannot be
          undone.
        </DialogDescription>
        <DialogFooter className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteModal;
