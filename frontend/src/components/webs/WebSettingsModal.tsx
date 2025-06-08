import React, { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
} from "../ui/dialog";
import { Lock, Orbit, SettingsIcon, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { useDeleteWeb, useFetchWebById, useUpdateWeb } from "@/hooks/webs";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import DeleteModal from "../utility/DeleteModal";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import SimpleTooltip from "../utility/SimpleTooltip";

function WebSettingsModal({ webId }: { webId: string }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { data: web, refetch: refetchWeb } = useFetchWebById(webId);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [visibilityModalOpen, setVisibilityModalOpen] = React.useState(false);
  const [currentVisibility, setCurrentVisibility] = React.useState<
    "Public" | "Private" | "Invite"
  >((web && web.visibility) || "Public");

  const {
    mutateAsync: updateWeb,
    isPending: webUpdating,
    error: webUpdateError,
  } = useUpdateWeb(web.webId);

  const { mutateAsync: deleteWeb, isPending: webDeleting } = useDeleteWeb();

  const handleDeleteWeb = useCallback(async () => {
    try {
      await deleteWeb(web.webId);
      setOpen(false);
      router.push("/home");
    } catch (error) {
      console.error(error as Error);
      toast({
        title: "Error deleting web",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  }, [deleteWeb, router, web.webId]);

  const handleToggleVisibility = async (
    newVisibility: "Public" | "Private" | "Invite"
  ) => {
    try {
      await updateWeb({
        visibility: newVisibility,
      });
      refetchWeb();
      setCurrentVisibility(newVisibility);
      toast({
        title: `Web visibility updated to ${newVisibility.toLowerCase()}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating web",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleVisibilityChange = (value: "Public" | "Private" | "Invite") => {
    setCurrentVisibility(value);
    setVisibilityModalOpen(true);
  };

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
                </Label>
                <a className="text-xs text-gray-500">
                  Allow AI to connect to and interact with this web
                </a>
              </div>
              <Switch
                disabled={webUpdating}
                id="enable-ai-connections"
                defaultChecked={(web && web.enableAIConnections) || false}
                onCheckedChange={async (checked) => {
                  await updateWeb({ enableAIConnections: checked });
                  refetchWeb();
                }}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center">
                Visibility <Lock size={16} className="ml-2" />
              </Label>
              <RadioGroup
                disabled={webUpdating}
                value={currentVisibility}
                onValueChange={handleVisibilityChange}
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

            <div className="space-y-3 flex flex-row items-center justify-between">
              <Label className="text-sm font-medium w-xs">
                <div className="flex items-center mb-1">
                  Delete Web <Trash size={16} className="ml-2" />
                </div>
                <a className="text-xs text-gray-500">
                  Delete this web and all of its connections. <br></br>
                  This action cannot be undone.
                </a>
              </Label>
              <Button
                disabled={webDeleting}
                variant="destructive"
                onClick={() => setDeleteModalOpen(true)}
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
        </DialogContent>
      </Dialog>
      {deleteModalOpen && (
        <DeleteModal
          itemType="web"
          onDelete={handleDeleteWeb}
          isPending={webDeleting}
          open={deleteModalOpen}
          setOpen={setDeleteModalOpen}
        />
      )}
      {visibilityModalOpen && (
        <Dialog
          open={visibilityModalOpen}
          onOpenChange={setVisibilityModalOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Web Visibility</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to change the visibility of this web to{" "}
                {currentVisibility.toLowerCase()}?
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setVisibilityModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleToggleVisibility(currentVisibility);
                    setVisibilityModalOpen(false);
                  }}
                  disabled={webUpdating}
                >
                  {webUpdating ? "Updating..." : "Confirm"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default WebSettingsModal;
