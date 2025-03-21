"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Web } from "@/types/web";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useIterateWeb } from "@/hooks/webs";
import { useRouter } from "next/router";
import { useUser } from "@/context/UserContext";
import { toast } from "../ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { Switch } from "../ui/switch";
export function IterateModal({
  web,
  open,
  setIsOpen,
  children,
}: {
  web: Web;
  open: boolean;
  setIsOpen: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();

  const { mutateAsync: iterateWeb, isPending: isIterating } =
    useIterateWeb(web.webId);
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: web.name,
    description: web.description || "",
    withConnections: false,
  });
  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (formData.name === "") {
      setFormData({
        ...formData,
        name: "Untitled",
      });
    }

    try {
      const webId = await iterateWeb(formData);
      setIsOpen(false);
      toast({
        title: "Web iterated successfully",
        description: "A new web has been created.",
      });
      router.push("/web/" + webId);
      setFormData({
        name: "",
        description: "",
        withConnections: false,
      });
    } catch (error) {
      toast({
        title: "Error iterating web",
        variant: "destructive",
      });
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    handleStopPropagation(e);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DrawerContent
          onClick={handleStopPropagation}
          className="min-h-[90dvh] lg:px-16 lg:max-w-[700px] rounded-md"
        >
          <DrawerHeader className="p-6 pb-0">
            <DrawerTitle className="text-left lg:text-2xl">
              Iterate Web
            </DrawerTitle>
            <DrawerDescription className="text-left">
              An iteration is a copy of someone else&apos;s web. Iterating a
              web allows you to freely branch off in your own style without
              affecting the original project.
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              <p className="text-sm text-muted-foreground">
                By default, iterations are named the same as the original. You
                can customize the name to distinguish it further.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description{" "}
                <span className="text-xs font-bold">(Optional)</span>
              </label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="with-connections" className="text-sm font-medium">
                Include connections?
                <span className="ml-2 rounded-xl bg-violet-400 px-2 py-1 text-white text-xs">PRO</span>
              </label>
              <Switch
                disabled
                id="with-connections"
                name="withConnections"
                checked={formData.withConnections}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    withConnections: checked,
                  }))
                }
              />
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                className="w-[100px]"
                onClick={handleSubmit}
                disabled={isIterating}
              >
                {isIterating ? "Creating..." : "Iterate"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-[100px]"
                onClick={handleCancel}
                disabled={isIterating}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="max-w-[350px] py-10 lg:px-16 lg:max-w-[700px] rounded-md"
        onClick={handleStopPropagation}
      >
        <DialogHeader>
          <DialogTitle className="text-left lg:text-2xl">
            Iterate Web
          </DialogTitle>
          <DialogDescription className="text-left">
            An iteration is a copy of someone else&apos;s web. Iterating a
            web allows you to freely branch off in your own style without
            affecting the original project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <p className="text-sm text-muted-foreground">
              By default, iterations are named the same as the original. You can
              customize the name to distinguish it further.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-xs font-bold">(Optional)</span>
            </label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="with-connections" className="text-sm font-medium">
              Include connections?
              <span className="ml-2 rounded-xl bg-violet-400 px-2 py-1 text-white text-xs">PRO</span>
            </label>
            {/* TODO: implement this */}
            <Switch
              disabled
              id="with-connections"
              name="withConnections"
              checked={formData.withConnections}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  withConnections: checked,
                }))
              }
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              className="w-[100px]"
              onClick={handleSubmit}
              disabled={isIterating}
            >
              {isIterating ? "Creating..." : "Iterate"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-[100px]"
              onClick={handleCancel}
              disabled={isIterating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
