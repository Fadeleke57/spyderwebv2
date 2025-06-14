import React, { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/kibo-ui/dropzone";
import { Loader } from "lucide-react";
import { useFileUpload } from "@/hooks/sources";
import { useFetchSourcesForWeb } from "@/hooks/sources";
import { useFetchWebById } from "@/hooks/webs";
import { useSourceStore } from "@/store/sourceStore";
import { useRouter } from "next/router";

interface FileUploadProps {
  setIsWebDataModalOpen: (open: boolean) => void;
}

const FileUploadSection: React.FC<FileUploadProps> = ({
  setIsWebDataModalOpen,
}) => {
  const router = useRouter();
  const { webId } = router.query;
  const { setSelectedSourceId, setIsUploadingSource } = useSourceStore();
  const [parseObsidianLinks, setParseObsidianLinks] = useState(false);
  const { mutateAsync: uploadFile, isPending: isFileUploading } = useFileUpload(
    webId as string
  );
  const { refetch: refetchSources } = useFetchSourcesForWeb(webId as string);
  const { refetch: refetchWeb } = useFetchWebById(webId as string);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const uploadResult = await uploadFile({
        files,
        parseObsidianLinks,
      });

      if (files.length > 1) {
        toast({ title: "Multiple files uploading..." });
      } else {
        setSelectedSourceId(uploadResult.firstSourceId);
        setIsWebDataModalOpen(true);
        toast({ title: "File uploaded successfully!" });
      }

      refetchSources();
      refetchWeb();
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast({
        variant: "destructive",
        title: "Error uploading file(s)",
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsUploadingSource(false);
    }
  };

  return (
    <div className="h-[390px] flex flex-col gap-2 p-2 pt-4">
      {isFileUploading ? (
        <div className="flex items-center justify-center h-full">
          <Loader size={24} className="animate-spin text-violet-400/50" />
        </div>
      ) : (
        <Dropzone
          onDrop={(acceptedFiles: File[]) => {
            const dataTransfer = new DataTransfer();
            acceptedFiles.forEach((file) => dataTransfer.items.add(file));
            handleFileUpload(dataTransfer.files);
          }}
          accept={{
            pdf: [".pdf"],
            pptx: [".pptx"],
            markdown: [".md"],
            txt: [".txt", ".md"],
          }}
          maxFiles={10}
          onError={(err) => {
            console.error("Dropzone error:", err);
            toast({
              variant: "destructive",
              title: "Error during file drop",
            });
          }}
        >
          <DropzoneEmptyState />
          {isFileUploading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <DropzoneContent />
          )}
        </Dropzone>
      )}
    </div>
  );
};

export default FileUploadSection;
