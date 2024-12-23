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
  bucketId,
  handleDelete,
  isPending,
  children,
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  bucketId: string;
  handleDelete: any;
  isPending: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-10">
        <DialogHeader>
          <DialogTitle>Delete Bucket.</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this bucket? This action cannot be
          undone.
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(bucketId)}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteModal;
