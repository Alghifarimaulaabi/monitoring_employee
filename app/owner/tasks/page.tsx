import { prisma } from "@/lib/prisma";
import CreateTaskForm from "@/components/create-task-form";
import OwnerTaskList from "@/components/owner-task-list";
import { CheckSquare, Clock, CheckCircle2, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manajemen Penugasan - B-Tracker",
};

export default async function OwnerTasksPage() {
  const [tasks, employees] = await Promise.all([
    prisma.task.findMany({
      orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const pendingTasks = tasks.filter((t) => t.status === "PENDING").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Manajemen Penugasan Harian
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Buat, delegasikan, dan pantau tugas harian toko (seperti menyiram tanaman, menyapu, kebersihan, & operasional toko).
          </p>
        </div>

        <CreateTaskForm employees={employees} />
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Total Tugas</div>
            <div className="text-xl font-bold text-gray-900">{totalTasks}</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Menunggu (Pending)</div>
            <div className="text-xl font-bold text-gray-900">{pendingTasks}</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Selesai Dikerjakan</div>
            <div className="text-xl font-bold text-gray-900">{completedTasks}</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Tingkat Penyelesaian</div>
            <div className="text-xl font-bold text-gray-900">{completionRate}%</div>
          </div>
        </div>
      </div>

      {/* Task List Component with Filters */}
      <OwnerTaskList tasks={tasks} employees={employees} />
    </div>
  );
}
