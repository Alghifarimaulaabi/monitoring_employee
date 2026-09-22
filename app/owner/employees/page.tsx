import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import CreateEmployeeForm from "@/components/create-employee-form";
import EmployeeTable, { SerializedUser } from "@/components/employee-table";
import { Users, Shield, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const session = await getServerSession();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { bouquetPosts: true },
      },
      assignedTasks: {
        where: { status: "PENDING" },
        select: { id: true, title: true },
      },
    },
  });

  const serializedUsers: SerializedUser[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    banned: u.banned,
    banReason: u.banReason,
    createdAt: u.createdAt.toISOString(),
    _count: u._count,
    assignedTasks: u.assignedTasks,
  }));

  const activeEmployeeCount = users.filter(
    (u) => u.role === "EMPLOYEE" && !u.banned
  ).length;
  const ownerCount = users.filter((u) => u.role === "OWNER").length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Manajemen Karyawan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola hak akses dan staf operasional lapangan untuk pelaporan buket harian.
        </p>
      </div>

      {/* Metric summary badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Total Akun</div>
            <div className="text-xl font-bold text-gray-900">{users.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Staf Aktif</div>
            <div className="text-xl font-bold text-gray-900">{activeEmployeeCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs col-span-2 sm:col-span-1 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Owner / Manajer</div>
            <div className="text-xl font-bold text-gray-900">{ownerCount}</div>
          </div>
        </div>
      </div>

      {/* Form: Create Employee */}
      <CreateEmployeeForm />

      {/* Table: Interactive Staff Management */}
      <EmployeeTable
        users={serializedUsers}
        currentUserId={session?.user?.id}
      />
    </div>
  );
}

