import React, { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
} from "../ui/dialog";
import { Orbit, SettingsIcon, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { useDeleteWeb, useFetchWebById, useUpdateWeb } from "@/hooks/webs";
import { Label } from "../ui/label";
import DeleteModal from "../utility/DeleteModal";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import SimpleTooltip from "../utility/SimpleTooltip";
import { useUser } from "@/providers/UserProvider";

function WebSettingsModal({ webId }: { webId: string }) {
  const [open, setOpen] = React.useState(false);
  const { user } = useUser();
  const router = useRouter();
  const { data: web, refetch: refetchWeb } = useFetchWebById(webId);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

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
      router.push(`/user/${user?.username}`);
    } catch (error) {
      console.error(error as Error);
      toast({
        title: "Error deleting web",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  }, [deleteWeb, router, web.webId, user?.username]);

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
                <a className="text-xs text-muted-foreground">
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

            <div className="space-y-3 flex flex-row items-center justify-between">
              <Label className="text-sm font-medium w-xs">
                <div className="flex items-center mb-1">
                  Delete Web <Trash size={16} className="ml-2" />
                </div>
                <a className="text-xs text-muted-foreground">
                  Delete this web and all of its connections. <br></br>
                  This action cannot be undone.
                </a>
              </Label>
              <Button
                disabled={webDeleting}
                className="p-0 h-fit w-fit dark:bg-transparent dark:border-none dark:hover:bg-transparent dark:text-red-400 dark:hover:text-red-500"
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
    </>
  );
}

export default WebSettingsModal;
