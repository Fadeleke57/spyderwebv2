import {
  Dialog,
  DialogClose,
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
        className="max-w-full w-full h-[100dvh] p-0 gap-0 border-none flex justify-center items-center bg-transparent fixed z-50"
        onClick={(e) => handleModalClick(e)}
        secondary
      >
        <DialogTitle hidden></DialogTitle>
        <img
          src={imageUrl}
          alt="Image Popup"
          style={{ objectFit: "contain", width: "100%", height: "100%", borderRadius: "10px", background: "black" }}
          className="rounded-lg"
        />
      </DialogContent>
    </Dialog>
  );
}
