import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EmployeeTaskChecklist from "@/components/employee-task-checklist";
import { getAppDateString, parseDateToUtc, formatDateJakarta } from "@/lib/date";
import { Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checklist Tugas Harian - B-Tracker",
};

export default async function TasksPage() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  // Current calendar day in Asia/Jakarta (WIB)
  const todayStr = getAppDateString();
  const todayDate = parseDateToUtc(todayStr);

  // Fetch all recurring tasks assigned to this employee
  const rawTasks = await prisma.task.findMany({
    where: {
      assignedToId: session.user.id,
      OR: [{ dueDate: null }, { dueDate: { lte: todayDate } }],
    },
    include: {
      completions: {
        where: {
          userId: session.user.id,
          date: todayDate,
        },
      },
    },
    orderBy: [{ createdAt: "asc" }],
  });

  const tasks = rawTasks
    .map((task) => {
      const isCompleted = task.completions.length > 0;
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate || task.createdAt,
        status: isCompleted ? "COMPLETED" : "PENDING",
        completedAt: isCompleted ? task.completions[0].completedAt : null,
        createdAt: task.createdAt,
      };
    })
    .sort((a, b) => {
      // PENDING comes before COMPLETED
      if (a.status === b.status) return 0;
      return a.status === "PENDING" ? -1 : 1;
    });

  const todayFormatted = formatDateJakarta(new Date());

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs text-rose-100 font-medium mb-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{todayFormatted}</span>
        </div>
        <h1 className="text-xl font-bold">Halo, {session.user.name}!</h1>
        <p className="text-xs text-rose-100 mt-1">
          Daftar checklist tugas harian operasional toko (menyiram tanaman, menyapu, kebersihan, dll.) yang harus Anda selesaikan hari ini.
        </p>
      </div>

      {/* Interactive Checklist */}
      <EmployeeTaskChecklist tasks={tasks} />
    </div>
  );
}
