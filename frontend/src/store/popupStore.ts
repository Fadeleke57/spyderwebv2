import { create } from "zustand";

interface PopupState {
    selectedClientId: string | null;
    setSelectedClientId: (clientId: string | null) => void;
    isConfirmDisconnectPopupOpen: boolean;
    setIsConfirmDisconnectPopupOpen: (open: boolean) => void;
}

export const usePopupStore = create<PopupState>((set) => ({
    selectedClientId: null,
    setSelectedClientId: (clientId) => set({ selectedClientId: clientId }),
    isConfirmDisconnectPopupOpen: false,
    setIsConfirmDisconnectPopupOpen: (open) => set({ isConfirmDisconnectPopupOpen: open }),
}));
