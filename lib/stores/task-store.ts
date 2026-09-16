import { create } from "zustand";

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | string;
  status: string; // PENDING | COMPLETED
  completedAt: Date | string | null;
  createdAt: Date | string;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
}

export interface EmployeeTaskItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | string;
  status: string; // PENDING | COMPLETED
  completedAt: Date | string | null;
  createdAt: Date | string;
}

interface TaskState {
  // Owner filters
  filterStatus: "ALL" | "PENDING" | "COMPLETED";
  filterEmployee: string;
  filterDate: string;
  searchQuery: string;

  // Employee filter
  employeeTabFilter: "ALL" | "PENDING" | "COMPLETED";

  // Data lists
  ownerTasks: TaskItem[];
  employeeTasks: EmployeeTaskItem[];

  // Action status
  actionLoadingId: string | null;
  error: string | null;

  // Setters
  setFilterStatus: (filterStatus: "ALL" | "PENDING" | "COMPLETED") => void;
  setFilterEmployee: (filterEmployee: string) => void;
  setFilterDate: (filterDate: string) => void;
  setSearchQuery: (searchQuery: string) => void;
  setEmployeeTabFilter: (employeeTabFilter: "ALL" | "PENDING" | "COMPLETED") => void;

  setOwnerTasks: (ownerTasks: TaskItem[]) => void;
  setEmployeeTasks: (employeeTasks: EmployeeTaskItem[]) => void;
  setActionLoadingId: (actionLoadingId: string | null) => void;
  setError: (error: string | null) => void;

  // Optimistic updates
  optimisticToggleOwnerTask: (taskId: string, nextStatus: string) => void;
  optimisticToggleEmployeeTask: (taskId: string, nextStatus: string) => void;
  removeOwnerTask: (taskId: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  filterStatus: "ALL",
  filterEmployee: "ALL",
  filterDate: "",
  searchQuery: "",
  employeeTabFilter: "ALL",

  ownerTasks: [],
  employeeTasks: [],
  actionLoadingId: null,
  error: null,

  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setFilterEmployee: (filterEmployee) => set({ filterEmployee }),
  setFilterDate: (filterDate) => set({ filterDate }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setEmployeeTabFilter: (employeeTabFilter) => set({ employeeTabFilter }),

  setOwnerTasks: (ownerTasks) => set({ ownerTasks }),
  setEmployeeTasks: (employeeTasks) => set({ employeeTasks }),
  setActionLoadingId: (actionLoadingId) => set({ actionLoadingId }),
  setError: (error) => set({ error }),

  optimisticToggleOwnerTask: (taskId, nextStatus) =>
    set((state) => ({
      ownerTasks: state.ownerTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: nextStatus,
              completedAt: nextStatus === "COMPLETED" ? new Date().toISOString() : null,
            }
          : t
      ),
    })),

  optimisticToggleEmployeeTask: (taskId, nextStatus) =>
    set((state) => ({
      employeeTasks: state.employeeTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: nextStatus,
              completedAt: nextStatus === "COMPLETED" ? new Date().toISOString() : null,
            }
          : t
      ),
    })),

  removeOwnerTask: (taskId) =>
    set((state) => ({
      ownerTasks: state.ownerTasks.filter((t) => t.id !== taskId),
    })),
}));
