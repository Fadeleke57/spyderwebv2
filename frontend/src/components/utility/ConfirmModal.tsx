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
import { Input } from "../ui/input";
import { useState } from "react";
import { useUser } from "@/context/UserContext";

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
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const { user } = useUser();

  const handleAction = () => {
    // validate username before allowing action
    if (!user) {
      return;
    }

    if (usernameInput.trim() !== user.username) {
      setUsernameError("Incorrect username. Please try again.");
      return;
    }

    // reset error and perform action
    setUsernameError("");
    action();
    setIsOpen(false);
    setUsernameInput("");
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-10">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>{actionStr}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm">To confirm, please enter your username <span className="font-semibold text-violet-400/80">{user.username}</span>:</p>
          <Input
            type="text"
            placeholder="Enter your username"
            value={usernameInput}
            onChange={(e) => {
              setUsernameInput(e.target.value);
              setUsernameError("");
            }}
          />
          {usernameError && (
            <p className="text-red-500 text-sm">{usernameError}</p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant={"outline"}
            onClick={() => {
              setIsOpen(false);
              setUsernameInput("");
              setUsernameError("");
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAction} disabled={usernameInput.trim() === ""}>
            {actionButtonStr}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmModal;
