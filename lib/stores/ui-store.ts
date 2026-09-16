import { create } from "zustand";

export interface ToastMessage {
  type: "success" | "error";
  text: string;
}

interface UIState {
  toastMessage: ToastMessage | null;
  isExportingPdf: boolean;
  toastTimeoutId: NodeJS.Timeout | null;
  showToast: (type: "success" | "error", text: string, durationMs?: number) => void;
  clearToast: () => void;
  setIsExportingPdf: (val: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  toastMessage: null,
  isExportingPdf: false,
  toastTimeoutId: null,

  showToast: (type, text, durationMs = 4000) => {
    // Clear any active timeout
    const currentTimeout = get().toastTimeoutId;
    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }

    const timeoutId = setTimeout(() => {
      set({ toastMessage: null, toastTimeoutId: null });
    }, durationMs);

    set({
      toastMessage: { type, text },
      toastTimeoutId: timeoutId,
    });
  },

  clearToast: () => {
    const currentTimeout = get().toastTimeoutId;
    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }
    set({ toastMessage: null, toastTimeoutId: null });
  },

  setIsExportingPdf: (isExportingPdf) => set({ isExportingPdf }),
}));
