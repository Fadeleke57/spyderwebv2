import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  description?: string;
}

export function ImageModal({ isOpen, onClose, imageUrl }: ImageModalProps) {
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl w-full lg:max-h-screen p-0 gap-0 border-none border"
        onClick={(e) => handleModalClick(e)}
      >
        <DialogTitle hidden></DialogTitle>
        <div className="relative w-full h-full overflow-hidden rounded-lg border">
          <Image
            src={imageUrl}
            alt={"Image Popup"}
            width={1200}
            height={800}
            className="w-full h-auto object-contain"
            unoptimized
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
