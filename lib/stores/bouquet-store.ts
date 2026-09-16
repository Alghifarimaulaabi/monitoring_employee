import { create } from "zustand";
import {
  OwnerMonthlyBouquetsResult,
  SerializedBouquetPeriod,
  getOwnerMonthlyBouquetsAction,
  getBouquetPeriodsAction,
} from "@/lib/actions/bouquet";

export interface ActiveBouquetPreview {
  url: string;
  location: string;
  date: string;
  flowerCount: number;
  staffName: string;
}

interface BouquetState {
  // Filters & Tabs
  selectedMonth: number;
  selectedYear: number;
  activeTab: "cards" | "allPhotos";

  // Data
  monthlyData: OwnerMonthlyBouquetsResult | null;
  periods: SerializedBouquetPeriod[];
  isLoading: boolean;

  // Modals & Overlays
  activePreview: ActiveBouquetPreview | null;
  periodToDelete: SerializedBouquetPeriod | null;
  isDeletingPeriod: boolean;
  isPurgeModalOpen: boolean;
  isPeriodModalOpen: boolean;

  // Actions
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  setActiveTab: (tab: "cards" | "allPhotos") => void;
  setMonthlyData: (data: OwnerMonthlyBouquetsResult) => void;
  setPeriods: (periods: SerializedBouquetPeriod[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setActivePreview: (preview: ActiveBouquetPreview | null) => void;
  setPeriodToDelete: (period: SerializedBouquetPeriod | null) => void;
  setIsDeletingPeriod: (isDeleting: boolean) => void;
  setIsPurgeModalOpen: (isOpen: boolean) => void;
  setIsPeriodModalOpen: (isOpen: boolean) => void;

  // Async data fetchers
  fetchMonthlyData: (month?: number, year?: number) => Promise<void>;
  fetchPeriods: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const currentDate = new Date();

export const useBouquetStore = create<BouquetState>((set, get) => ({
  selectedMonth: currentDate.getMonth() + 1,
  selectedYear: currentDate.getFullYear(),
  activeTab: "cards",

  monthlyData: null,
  periods: [],
  isLoading: false,

  activePreview: null,
  periodToDelete: null,
  isDeletingPeriod: false,
  isPurgeModalOpen: false,
  isPeriodModalOpen: false,

  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  setSelectedYear: (selectedYear) => set({ selectedYear }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setMonthlyData: (monthlyData) => set({ monthlyData }),
  setPeriods: (periods) => set({ periods }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setActivePreview: (activePreview) => set({ activePreview }),
  setPeriodToDelete: (periodToDelete) => set({ periodToDelete }),
  setIsDeletingPeriod: (isDeletingPeriod) => set({ isDeletingPeriod }),
  setIsPurgeModalOpen: (isPurgeModalOpen) => set({ isPurgeModalOpen }),
  setIsPeriodModalOpen: (isPeriodModalOpen) => set({ isPeriodModalOpen }),

  fetchMonthlyData: async (monthParam, yearParam) => {
    const month = monthParam ?? get().selectedMonth;
    const year = yearParam ?? get().selectedYear;
    set({ isLoading: true });
    try {
      const res = await getOwnerMonthlyBouquetsAction({ month, year });
      set({ monthlyData: res });
    } catch (err) {
      console.error("[useBouquetStore] fetchMonthlyData error:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPeriods: async () => {
    try {
      const res = await getBouquetPeriodsAction();
      if (res.success && res.periods) {
        set({ periods: res.periods });
      }
    } catch (err) {
      console.error("[useBouquetStore] fetchPeriods error:", err);
    }
  },

  refreshAll: async () => {
    const { selectedMonth, selectedYear } = get();
    set({ isLoading: true });
    try {
      const [monthlyRes, periodsRes] = await Promise.all([
        getOwnerMonthlyBouquetsAction({ month: selectedMonth, year: selectedYear }),
        getBouquetPeriodsAction(),
      ]);
      set({
        monthlyData: monthlyRes,
        periods: periodsRes.success ? periodsRes.periods : get().periods,
      });
    } catch (err) {
      console.error("[useBouquetStore] refreshAll error:", err);
    } finally {
      set({ isLoading: false });
    }
  },
}));
