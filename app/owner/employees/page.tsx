import { prisma } from "@/lib/prisma";
import CreateEmployeeForm from "@/components/create-employee-form";
import { Users, Shield, User, Calendar, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const employeeCount = users.filter((u) => u.role === "EMPLOYEE").length;
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
            <div className="text-xs font-medium text-gray-500">Staf Lapangan</div>
            <div className="text-xl font-bold text-gray-900">{employeeCount}</div>
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

      {/* Table: Registered Staff */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Daftar Akun Terdaftar</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Semua akun yang memiliki akses ke sistem B-Tracker.
            </p>
          </div>
          <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">
            {users.length} pengguna
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/75 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5">Nama & Email</th>
                <th className="px-6 py-3.5">Peran (Role)</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Tanggal Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const isOwner = u.role === "OWNER";
                const dateStr = new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                }).format(new Date(u.createdAt));

                return (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                            isOwner
                              ? "bg-purple-100 text-purple-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isOwner
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {isOwner ? (
                          <>
                            <Shield className="w-3 h-3" />
                            <span>OWNER</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3" />
                            <span>EMPLOYEE</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        <span>Aktif</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{dateStr}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
