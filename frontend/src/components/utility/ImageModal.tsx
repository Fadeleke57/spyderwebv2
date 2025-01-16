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
        className="w-full h-fit p-0 gap-0 rounded-md"
        onClick={(e) => handleModalClick(e)}
      >
        <DialogTitle hidden></DialogTitle>
        <Image
          src={imageUrl}
          alt="Image Popup"
          width={1200}
          height={800}
          className="max-h-screen w-auto object-contain rounded-md"
        />
      </DialogContent>
    </Dialog>
  );
}
