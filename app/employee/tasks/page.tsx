import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EmployeeTaskChecklist from "@/components/employee-task-checklist";
import { Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checklist Tugas Harian - B-Tracker",
};

export default async function TasksPage() {
  const headerList = await headers();
  const session = await auth.api.getSession({
    headers: headerList,
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  // Today in UTC for date-only matching
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  const tasks = await prisma.task.findMany({
    where: {
      assignedToId: session.user.id,
      dueDate: todayUtc,
    },
    orderBy: [
      { status: "asc" }, // PENDING first
      { createdAt: "asc" },
    ],
  });

  const todayStr = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs text-rose-100 font-medium mb-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{todayStr}</span>
        </div>
        <h1 className="text-xl font-bold">Halo, {session.user.name}!</h1>
        <p className="text-xs text-rose-100 mt-1">
          Berikut adalah checklist tugas operasional lapangan yang harus Anda selesaikan hari ini.
        </p>
      </div>

      {/* Interactive Checklist */}
      <EmployeeTaskChecklist tasks={tasks} />
    </div>
  );
}
