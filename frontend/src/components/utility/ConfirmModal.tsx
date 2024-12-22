import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";

export function ConfirmModal({
  actionStr,
  action,
  actionButtonStr,
  children,
  open,
}: {
  actionStr: string;
  action: () => void;
  actionButtonStr: string;
  children?: React.ReactNode;
  open?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(open || false);
  const handleAction = () => {
    action();
    setIsOpen(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-10">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>{actionStr}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={"outline"} onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleAction}>{actionButtonStr}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
