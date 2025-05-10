import { create } from "zustand";
import { useFetchSource } from "@/hooks/sources";

interface SourceState {
  selectedSourceId: string;
  setSelectedSourceId: (id: string) => void;
}

export const useSourceStore = create<SourceState>((set) => ({
  selectedSourceId: "",
  setSelectedSourceId: (id) => set({ selectedSourceId: id }),
}));

