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
import { Bucket } from "@/types/bucket";
import { Input } from "@/components/ui/input";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useFetchUserById } from "@/hooks/user";
import { useState } from "react";
import { useIterateBucket } from "@/hooks/buckets";
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
export function IterateModal({
  bucket,
  open,
  setIsOpen,
  children,
}: {
  bucket: Bucket;
  open: boolean;
  setIsOpen: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();

  const { mutateAsync: iterateBucket, isPending: isIterating } =
    useIterateBucket(bucket.bucketId);
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: bucket.name,
    description: bucket.description || "",
  });
  const { data: bucketOwner, isLoading: bucketOwnerLoading } = useFetchUserById(
    bucket.userId as string
  );
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
      const bucketId = await iterateBucket(formData);
      setIsOpen(false);
      toast({
        title: "Bucket iterated successfully",
        description: "A new bucket has been created.",
      });
      router.push("/buckets/bucket/" + bucketId);
      setFormData({
        name: "",
        description: "",
      });
    } catch (error) {
      toast({
        title: "Error iterating bucket",
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
          className="min-h-[90svh] lg:px-16 lg:max-w-[700px] rounded-md"
        >
          <DrawerHeader className="p-6">
            <DrawerTitle className="text-left lg:text-2xl">
              Iterate Bucket
            </DrawerTitle>
            <DrawerDescription className="text-left">
              An iteration is a copy of someone else&apos;s bucket. Iterating a
              bucket allows you to freely branch off in your own style without
              affecting the original project.
            </DrawerDescription>
          </DrawerHeader>
          <Separator className="my-2 h-px bg-slate-200" />

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
              <p className="text-sm text-gray-500">
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
            Iterate Bucket
          </DialogTitle>
          <DialogDescription className="text-left">
            An iteration is a copy of someone else&apos;s bucket. Iterating a
            bucket allows you to freely branch off in your own style without
            affecting the original project.
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-2 h-px bg-slate-200" />

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
            <p className="text-sm text-gray-500">
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
