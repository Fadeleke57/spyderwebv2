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
        className="max-w-full w-full h-[100dvh] p-0 gap-0 border-none flex justify-center items-center bg-black"
        onClick={(e) => handleModalClick(e)}
      >
        <DialogTitle hidden></DialogTitle>
        <div className="relative max-w-full max-h-[100dvh] overflow-hidden rounded-lg lg:border">
          <Image
            src={imageUrl}
            alt="Image Popup"
            width={1200}
            height={800}
            className="w-auto h-full max-h-[100dvh] object-contain"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
