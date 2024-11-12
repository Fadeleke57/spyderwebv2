import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link, Notebook, Plus,Upload, X, Youtube } from "lucide-react";
import { BucketConfigFormValues } from "@/types/article";
import { Bucket } from "@/types/bucket";
import { useFileUpload } from "@/hooks/sources";
import { toast } from "../ui/use-toast";

type ConfigGraphModalProps = {
  config: BucketConfigFormValues;
  setConfig: (value: BucketConfigFormValues) => void;
  bucket: Bucket;
  refetch: () => void;
};

export default function BucketSearchModal({
  bucket,
  refetch,
}: ConfigGraphModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { uploadFile, progress, error } = useFileUpload(
    bucket.userId,
    bucket.bucketId
  );

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      return;
    }
    console.log("file", file);
    const fileType = "document"; // to be updated
    try {
      const result = await uploadFile(file, fileType);
      toast({
        title: "File uploaded",
        description: "File uploaded successfully",
        duration: 500,
      });
      setIsOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error uploading file",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} className="mt-4 rounded-full">
          <Plus size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby="description"
        className="max-w-[80vw] h-[80vh] flex flex-col gap-6 items-center px-6 lg:p-12 overflow-y-auto"
      >
        <DialogHeader className="w-full mx-auto flex flex-row justify-between items-start">
          <div className="space-y-4">
            <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-6xl text-left">
              Upload
            </h1>
            <p className="text-md text-muted-foreground text-left">
              It isn&apos;t about the answers, it&apos;s the steps that will get
              you there.
            </p>
          </div>
          <div
            className="cursor-pointer rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
            <span>esc</span>
          </div>
        </DialogHeader>
        <div className="w-full flex flex-col gap-8">
          <div className="w-full bg-muted grid grid-cols-1 p-10 rounded-xl border-dashed border-2 border-slate-400">
            <div className="flex flex-col gap-2 items-center">
              <div>
                <label htmlFor="file">
                  <div className="relative p-4 rounded-full bg-slate-400 cursor-pointer hover:bg-slate-500">
                    <Upload
                      size={24}
                      color="white"
                      className="cursor-pointer"
                    />
                  </div>
                </label>
                <input
                  type="file"
                  id="file"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  hidden
                  onChange={(e) =>
                    handleFileUpload(e.target.files ? e.target.files[0] : null)
                  }
                />
              </div>
              <div className="text-center">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-muted-foreground">
                  Upload sources
                </h3>
                <p className="text-md text-muted-foreground text-center">
                  Drag and drop or{" "}
                  <label htmlFor="file">
                    <span className="text-blue-500 cursor-pointer">
                      choose file
                    </span>{" "}
                  </label>
                  <input
                    type="file"
                    id="file"
                    multiple
                    hidden
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) =>
                      handleFileUpload(
                        e.target.files ? e.target.files[0] : null
                      )
                    }
                  />
                  to upload
                </p>
              </div>
            </div>
          </div>
          <div className="w-full grid grid-cols-3 gap-4">
            <div className="bg-muted rounded-xl p-4 flex flex-row gap-4 items-center cursor-pointer hover:scale-105 duration-00 transition ease-in">
              <div className="bg-blue-500 rounded-full w-fit h-fit p-2">
                <Link size={20} className="text-white" />
              </div>
              <p className="text-md text-muted-foreground">Website</p>
            </div>
            <div className="bg-muted rounded-xl p-4 flex flex-row gap-4 items-center cursor-pointer hover:scale-105 duration-00 transition ease-in">
              <div className="bg-red-500 rounded-full w-fit h-fit p-2">
                <Youtube size={20} className="text-white" />
              </div>
              <p className="text-md text-muted-foreground">Youtube</p>
            </div>
            <div className="bg-muted rounded-xl p-4 flex flex-row gap-4 items-center cursor-pointer hover:scale-105 duration-00 transition ease-in">
              <div className="bg-purple-500 rounded-full w-fit h-fit p-2">
                <Notebook size={20} className="text-white" />
              </div>
              <p className="text-md text-muted-foreground">Note</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
