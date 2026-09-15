"use client";

import { useState, useOptimistic, useTransition } from "react";
import { toggleTaskStatusAction } from "@/lib/actions/task";
import { CheckCircle2, Circle, AlertCircle, Sparkles, Camera, CheckSquare } from "lucide-react";
import Link from "next/link";

export interface EmployeeTaskItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | string;
  status: string; // PENDING | COMPLETED
  completedAt: Date | string | null;
  createdAt: Date | string;
}

interface EmployeeTaskChecklistProps {
  tasks: EmployeeTaskItem[];
}

export default function EmployeeTaskChecklist({ tasks: initialTasks }: EmployeeTaskChecklistProps) {
  const [, startTransition] = useTransition();
  const [tasks, setTasks] = useState(initialTasks);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");

  // Optimistic state for tasks
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (state, { taskId, nextStatus }: { taskId: string; nextStatus: string }) =>
      state.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: nextStatus,
              completedAt: nextStatus === "COMPLETED" ? new Date().toISOString() : null,
            }
          : task
      )
  );

  const totalCount = optimisticTasks.length;
  const completedCount = optimisticTasks.filter((t) => t.status === "COMPLETED").length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllComplete = totalCount > 0 && completedCount === totalCount;

  const handleToggle = (task: EmployeeTaskItem) => {
    setError(null);
    const nextStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";

    // 1. Optimistic update
    startTransition(async () => {
      setOptimisticTasks({ taskId: task.id, nextStatus });

      try {
        const res = await toggleTaskStatusAction(task.id, nextStatus as "PENDING" | "COMPLETED");
        if (!res.success) {
          setError(res.error || "Gagal mengubah status tugas.");
          // Rollback to original tasks
          setTasks((current) => [...current]);
          return;
        }

        // Commit change to state
        setTasks((current) =>
          current.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  status: nextStatus,
                  completedAt: nextStatus === "COMPLETED" ? new Date() : null,
                }
              : t
          )
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan jaringan.";
        setError(msg);
        setTasks((current) => [...current]);
      }
    });
  };

  const displayedTasks = optimisticTasks.filter((task) => {
    if (filter === "PENDING") return task.status === "PENDING";
    if (filter === "COMPLETED") return task.status === "COMPLETED";
    return true;
  });

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/80 flex items-center gap-2.5 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Progres Hari Ini
            </span>
            {isAllComplete && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Selesai Semua</span>
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-rose-600">
            {completedCount} dari {totalCount} Selesai ({percentComplete}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-rose-500 to-pink-500 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* Celebration Banner when all complete */}
      {isAllComplete && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              🎉
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Luar biasa, semua tugas selesai!</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Jangan lupa laporkan foto bukti pemasangan buket hari ini.
              </p>
            </div>
          </div>
          <Link
            href="/employee/submit"
            className="flex-shrink-0 px-3 py-2 bg-white text-emerald-700 text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-50 transition-colors"
          >
            Lapor Buket
          </Link>
        </div>
      )}

      {/* Filter Tabs */}
      {totalCount > 0 && (
        <div className="flex bg-gray-100/80 p-1 rounded-2xl text-xs">
          <button
            onClick={() => setFilter("ALL")}
            className={`flex-1 py-1.5 rounded-xl font-medium transition-all ${
              filter === "ALL" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500"
            }`}
          >
            Semua ({totalCount})
          </button>
          <button
            onClick={() => setFilter("PENDING")}
            className={`flex-1 py-1.5 rounded-xl font-medium transition-all ${
              filter === "PENDING" ? "bg-white text-amber-700 shadow-2xs" : "text-gray-500"
            }`}
          >
            Belum ({totalCount - completedCount})
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`flex-1 py-1.5 rounded-xl font-medium transition-all ${
              filter === "COMPLETED" ? "bg-white text-emerald-700 shadow-2xs" : "text-gray-500"
            }`}
          >
            Selesai ({completedCount})
          </button>
        </div>
      )}

      {/* Checklist Items */}
      {displayedTasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs text-center py-12">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">
            {totalCount === 0 ? "Belum Ada Tugas Hari Ini" : "Tidak ada tugas dengan filter ini"}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            {totalCount === 0
              ? "Tugas baru dari Owner akan langsung muncul di sini secara real-time."
              : "Ubah filter di atas untuk melihat penugasan lainnya."}
          </p>
          {totalCount === 0 && (
            <div className="mt-6">
              <Link
                href="/employee/submit"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Lapor Buket Sekarang</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedTasks.map((task) => {
            const isCompleted = task.status === "COMPLETED";

            return (
              <div
                key={task.id}
                onClick={() => handleToggle(task)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  isCompleted
                    ? "bg-gray-50/80 border-gray-200/60 shadow-2xs"
                    : "bg-white border-gray-200/90 hover:border-rose-300 shadow-xs hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-rose-400 bg-white flex items-center justify-center transition-colors">
                        <Circle className="w-3.5 h-3.5 text-transparent" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm font-semibold leading-snug transition-all ${
                          isCompleted ? "line-through text-gray-400" : "text-gray-900"
                        }`}
                      >
                        {task.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
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
                        className={`text-xs mt-1 transition-all ${
                          isCompleted ? "line-through text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {task.description}
                      </p>
                    )}

                    {isCompleted && task.completedAt && (
                      <span className="text-[10px] text-emerald-600 font-medium block mt-1.5">
                        ✓ Diselesaikan{" "}
                        {new Intl.DateTimeFormat("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(task.completedAt))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
