import { create } from "zustand";

interface PopupState {
    isMCPPopupOpen: boolean;
    setIsMCPPopupOpen: (open: boolean) => void;
}

export const usePopupStore = create<PopupState>((set) => ({
    isMCPPopupOpen: false,
    setIsMCPPopupOpen: (open) => set({ isMCPPopupOpen: open }),
}));
