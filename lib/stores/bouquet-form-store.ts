import { create } from "zustand";
import { CompressionResult } from "@/lib/image/compress";

interface BouquetFormState {
  selectedFile: File | null;
  previewUrl: string | null;
  compressionMetrics: CompressionResult | null;
  isCompressing: boolean;

  installDate: string;
  locationName: string;
  flowerCount: string;

  isSubmitting: boolean;
  error: string | null;
  success: boolean;

  setFileAndPreview: (
    file: File | null,
    metrics: CompressionResult | null,
    previewUrl: string | null
  ) => void;
  setIsCompressing: (isCompressing: boolean) => void;
  setInstallDate: (installDate: string) => void;
  setLocationName: (locationName: string) => void;
  setFlowerCount: (flowerCount: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: boolean) => void;
  resetForm: () => void;
}

const getTodayString = () => new Date().toISOString().split("T")[0];

export const useBouquetFormStore = create<BouquetFormState>((set, get) => ({
  selectedFile: null,
  previewUrl: null,
  compressionMetrics: null,
  isCompressing: false,

  installDate: getTodayString(),
  locationName: "",
  flowerCount: "",

  isSubmitting: false,
  error: null,
  success: false,

  setFileAndPreview: (selectedFile, compressionMetrics, previewUrl) => {
    const existingUrl = get().previewUrl;
    if (existingUrl && existingUrl !== previewUrl) {
      URL.revokeObjectURL(existingUrl);
    }
    set({ selectedFile, compressionMetrics, previewUrl });
  },

  setIsCompressing: (isCompressing) => set({ isCompressing }),
  setInstallDate: (installDate) => set({ installDate }),
  setLocationName: (locationName) => set({ locationName }),
  setFlowerCount: (flowerCount) => set({ flowerCount }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),

  resetForm: () => {
    const existingUrl = get().previewUrl;
    if (existingUrl) {
      URL.revokeObjectURL(existingUrl);
    }
    set({
      selectedFile: null,
      previewUrl: null,
      compressionMetrics: null,
      isCompressing: false,
      installDate: getTodayString(),
      locationName: "",
      flowerCount: "",
      isSubmitting: false,
      error: null,
      success: false,
    });
  },
}));
