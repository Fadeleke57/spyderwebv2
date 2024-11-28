import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

export function ConfirmModal({actionStr, action, actionButtonStr, children}: {actionStr: string, action: () => void, actionButtonStr: string, children?: React.ReactNode}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            {actionStr}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>Cancel</Button>
          <Button>{actionButtonStr}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
