"use client";

import { useState } from "react";
import { toggleTaskStatusAction, deleteTaskAction } from "@/lib/actions/task";
import { CheckSquare, Calendar, User, Trash2, CheckCircle2, Clock, Search, Filter, AlertCircle, Loader2 } from "lucide-react";

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

interface OwnerTaskListProps {
  tasks: TaskItem[];
  employees: { id: string; name: string; email: string }[];
}

export default function OwnerTaskList({ tasks, employees }: OwnerTaskListProps) {
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");
  const [filterEmployee, setFilterEmployee] = useState<string>("ALL");
  const [filterDate, setFilterDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter tasks based on controls
  const filteredTasks = tasks.filter((task) => {
    // Status filter
    if (filterStatus !== "ALL" && task.status !== filterStatus) {
      return false;
    }

    // Employee filter
    if (filterEmployee !== "ALL" && task.assignedTo.id !== filterEmployee) {
      return false;
    }

    // Date filter
    if (filterDate) {
      const taskDateStr = new Date(task.dueDate).toISOString().split("T")[0];
      if (taskDateStr !== filterDate) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description?.toLowerCase().includes(query) || false;
      const matchAssignee = task.assignedTo.name.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchAssignee) {
        return false;
      }
    }

    return true;
  });

  const handleToggleStatus = async (task: TaskItem) => {
    setError(null);
    setActionLoadingId(task.id);
    const nextStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";

    try {
      const res = await toggleTaskStatusAction(task.id, nextStatus);
      if (!res.success) {
        setError(res.error || "Gagal mengubah status tugas.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus penugasan ini?")) {
      return;
    }

    setError(null);
    setActionLoadingId(taskId);

    try {
      const res = await deleteTaskAction(taskId);
      if (!res.success) {
        setError(res.error || "Gagal menghapus tugas.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200/80 flex items-center gap-2.5 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama tugas atau staf..."
            className="w-full pl-9 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === "ALL" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterStatus("PENDING")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === "PENDING" ? "bg-white text-amber-700 shadow-2xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus("COMPLETED")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === "COMPLETED" ? "bg-white text-emerald-700 shadow-2xs" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Selesai
            </button>
          </div>

          {/* Filter by Employee */}
          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          >
            <option value="ALL">Semua Staf</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>

          {/* Filter by Date */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            title="Filter tanggal tugas"
          />

          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="text-xs text-rose-600 hover:underline px-1"
            >
              Reset Tanggal
            </button>
          )}
        </div>
      </div>

      {/* Task List / Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">
              Daftar Penugasan ({filteredTasks.length})
            </h3>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">Tidak ada tugas ditemukan</h4>
            <p className="text-xs text-gray-500 mt-1">
              Sesuaikan filter pencarian atau buat tugas baru untuk staf lapangan.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === "COMPLETED";
              const isLoadingThis = actionLoadingId === task.id;

              const dateStr = new Intl.DateTimeFormat("id-ID", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date(task.dueDate));

              return (
                <div
                  key={task.id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-gray-50/50 ${
                    isCompleted ? "bg-gray-50/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      disabled={isLoadingThis}
                      className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                          : "border-gray-300 hover:border-rose-400 bg-white"
                      }`}
                      title={isCompleted ? "Tandai belum selesai" : "Tandai selesai"}
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : null}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold text-gray-900 ${
                            isCompleted ? "line-through text-gray-400" : ""
                          }`}
                        >
                          {task.title}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isCompleted ? "Selesai" : "Pending"}
                        </span>
                      </div>

                      {task.description && (
                        <p
                          className={`text-xs mt-1 ${
                            isCompleted ? "text-gray-400 line-through" : "text-gray-600"
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="font-medium text-gray-600">{task.assignedTo.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{dateStr}</span>
                        </div>
                        {isCompleted && task.completedAt && (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <Clock className="w-3 h-3" />
                            <span>
                              Selesai:{" "}
                              {new Intl.DateTimeFormat("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(new Date(task.completedAt))}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 sm:self-center">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      disabled={isLoadingThis}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                    >
                      {isCompleted ? "Buka Kembali" : "Tandai Selesai"}
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={isLoadingThis}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors"
                      title="Hapus tugas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
