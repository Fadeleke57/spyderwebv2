import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "../ui/dialog";
import { Lock } from "lucide-react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useRouter } from "next/router";
import { useUser } from "@/providers/UserProvider";
import { useToggleFeedsVisibility } from "@/hooks/user";

function FeedsSettingsModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const { username } = router.query;
  const { user, refetchUser } = useUser();
  const isOwner = user && user.username === username;
  const {
    mutateAsync: toggleFeedsVisibility,
    isPending: isTogglingFeedsVisibility,
  } = useToggleFeedsVisibility(user?.id!);

  if (!isOwner) return null;

  const defaultVisibility =
    user?.feedsVisibility == true ||
    user?.feedsVisibility == undefined ||
    user?.feedsVisibility == null
      ? true
      : false;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Feed Settings</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor="toggle-feeds-visibility"
                  className="text-sm font-medium flex items-center"
                >
                  Feeds Visibility <Lock size={14} className="ml-2" />
                </Label>
                <a className="text-xs text-muted-foreground">
                  Allow feeds to be visible to people who view your profile.
                </a>
              </div>
              <Switch
                aria-readonly={isTogglingFeedsVisibility}
                disabled={isTogglingFeedsVisibility}
                id="toggle-feeds-visibility"
                defaultChecked={defaultVisibility}
                onCheckedChange={async () => {
                  await toggleFeedsVisibility();
                  refetchUser();
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FeedsSettingsModal;
