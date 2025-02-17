import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
        <Image
          src={imageUrl}
          alt="Image Popup"
          width={1000}
          height={1000}
          style={{ objectFit: "contain", width: "100%", height: "100%", borderRadius: "10px", background: "black" }}
          className="rounded-lg w-full h-full object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}
