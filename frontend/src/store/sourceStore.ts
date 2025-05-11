import { create } from "zustand";
import { Source, SourceAsNode } from "@/types/source";
import { Connection } from "@/types/connection";

interface SourceState {
  source: SourceAsNode | null;
  setSource: (source: SourceAsNode | null) => void;
  selectedSourceId: string;
  setSelectedSourceId: (id: string) => void;
  presignedUrl: string;
  setPresignedUrl: (url: string) => void;
  sourceTitle: string;
  setSourceTitle: (title: string) => void;
  sourceContent: string;
  setSourceContent: (content: string) => void;
  isEditingSource: boolean;
  setIsEditingSource: (editing: boolean) => void;
}

export const useSourceStore = create<SourceState>((set) => ({
  source: null,
  setSource: (source) => set({ source }),
  selectedSourceId: "",
  setSelectedSourceId: (id) => set({ selectedSourceId: id }),
  presignedUrl: "",
  setPresignedUrl: (url) => set({ presignedUrl: url }),
  sourceTitle: "",
  setSourceTitle: (title) => set({ sourceTitle: title }),
  sourceContent: "",
  setSourceContent: (content) => set({ sourceContent: content }),
  isEditingSource: false,
  setIsEditingSource: (editing) => set({ isEditingSource: editing }),
}));
