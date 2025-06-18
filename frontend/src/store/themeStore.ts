import { create } from "zustand";

interface ThemeState {
  mobile: boolean;
  setMobile: (mobile: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mobile: false,
  setMobile: (mobile) => set({ mobile }),
}));
