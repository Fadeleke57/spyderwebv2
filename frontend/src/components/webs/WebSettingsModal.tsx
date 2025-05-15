import React, { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { Lock, Orbit, SettingsIcon, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { UpdateWeb, Web } from "@/types/web";
import { useDeleteWeb, useUpdateWeb } from "@/hooks/webs";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import DeleteModal from "../utility/DeleteModal";
import { toast } from "sonner";
import { useRouter } from "next/router";
import SimpleTooltip from "../utility/SimpleTooltip";

function WebSettingsModal({
  web,
  refetchWeb,
}: {
  web: Web;
  refetchWeb: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const [webSettings, setWebSettings] = React.useState({
    enableAIConnections: web.enableAIConnections,
    visibility: web.visibility,
  });
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  const {
    mutateAsync: updateWeb,
    isPending: webUpdating,
    error: webUpdateError,
  } = useUpdateWeb(web.webId);

  const { mutateAsync: deleteWeb, isPending: webDeleting } = useDeleteWeb();

  const handleUpdateWeb = async () => {
    const updates: UpdateWeb = {
      enableAIConnections: webSettings.enableAIConnections || false,
      visibility: webSettings.visibility,
    };
    await updateWeb(updates);
    refetchWeb();
    setOpen(false);
  };

  const handleDeleteWeb = useCallback(async () => {
    try {
      await deleteWeb(web.webId);
      setOpen(false);
      router.push("/home");
    } catch (error) {
      console.error(error);
      toast("Error deleting web");
    }
  }, [deleteWeb]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <SimpleTooltip content="Web Settings" p={2}>
            <Button variant="ghost" className="h-fit p-2 m-0 rounded-full">
              <SettingsIcon size={20} className="cursor-pointer" />
            </Button>
          </SimpleTooltip>
        </DialogTrigger>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Web Settings</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor="ai-connections"
                  className="text-sm font-medium flex items-center"
                >
                  AI Connections <Orbit size={16} className="ml-2" />
                  {/**
                 * 
                 *  <Badge className="ml-2 bg-violet-400 text-foreground">
                  PRO
                </Badge>
                 */}
                </Label>
                <a className="text-xs text-gray-500">
                  Allow AI to connect to and interact with this web
                </a>
              </div>
              <Switch
                id="ai-connections"
                checked={webSettings.enableAIConnections}
                onCheckedChange={(checked) =>
                  setWebSettings({
                    ...webSettings,
                    enableAIConnections: checked,
                  })
                }
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center">
                Visibility <Lock size={16} className="ml-2" />
              </Label>
              <RadioGroup
                value={webSettings.visibility}
                onValueChange={(value) =>
                  setWebSettings({
                    ...webSettings,
                    visibility: value as "Public" | "Private",
                  })
                }
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Public" id="public" />
                  <Label htmlFor="public" className="font-normal">
                    Public
                  </Label>
                  <span className="text-xs text-gray-500 ml-2">
                    Anyone can view this web
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Private" id="private" />
                  <Label htmlFor="private" className="font-normal">
                    Private
                  </Label>
                  <span className="text-xs text-gray-500 ml-2">
                    Only you can view this web
                  </span>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center">
                Delete Web <Trash size={16} className="ml-2" />
              </Label>
              <Button
                variant="outline"
                onClick={() => setDeleteModalOpen(true)}
                className="w-full"
              >
                Delete Web
              </Button>
            </div>
          </div>

          {webUpdateError && (
            <p className="text-sm text-red-500 mt-2">
              Error: {webUpdateError.message || "Failed to update settings"}
            </p>
          )}

          <DialogFooter className="mt-6 gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setWebSettings({
                  enableAIConnections: web.enableAIConnections,
                  visibility: web.visibility,
                })
              }
              className="mr-2"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateWeb} disabled={webUpdating}>
              {webUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {deleteModalOpen && (
        <DeleteModal
          itemType="web"
          onDelete={handleDeleteWeb}
          isPending={webDeleting}
          open={deleteModalOpen}
          setOpen={setDeleteModalOpen}
        ></DeleteModal>
      )}
    </>
  );
}

export default WebSettingsModal;
