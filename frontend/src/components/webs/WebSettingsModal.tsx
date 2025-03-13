import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { Lock, Orbit, SettingsIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { UpdateWeb, Web } from "@/types/web";
import { useUpdateWeb } from "@/hooks/webs";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

function WebSettingsModal({
  web,
  refetchWeb,
}: {
  web: Web;
  refetchWeb: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  const [webSettings, setWebSettings] = React.useState({
    enableAIConnections: web.enableAIConnections,
    visibility: web.visibility,
  });

  const {
    mutateAsync: updateWeb,
    isPending: webUpdating,
    error: webUpdateError,
  } = useUpdateWeb(web.webId);

  const handleUpdateWeb = async () => {
    const updates: UpdateWeb = {
      enableAIConnections: webSettings.enableAIConnections || false,
      visibility: webSettings.visibility,
    };
    await updateWeb(updates);
    refetchWeb();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="ghost" className="h-fit p-2 m-0 rounded-full">
          <SettingsIcon size={20} className="cursor-pointer" />
        </Button>
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
              <p className="text-xs text-gray-500">
                Allow AI to connect to and interact with this web
              </p>
            </div>
            <Switch
              id="ai-connections"
              checked={webSettings.enableAIConnections}
              onCheckedChange={(checked) =>
                setWebSettings({ ...webSettings, enableAIConnections: checked })
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
        </div>

        {webUpdateError && (
          <p className="text-sm text-red-500 mt-2">
            Error: {webUpdateError.message || "Failed to update settings"}
          </p>
        )}

        <DialogFooter className="mt-6">
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
  );
}

export default WebSettingsModal;
