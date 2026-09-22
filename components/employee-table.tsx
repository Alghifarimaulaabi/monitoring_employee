"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  User,
  Calendar,
  CheckCircle,
  Ban,
  Trash2,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  Search,
} from "lucide-react";
import DeleteEmployeeDialog, {
  TargetEmployee,
} from "@/components/delete-employee-dialog";

export interface SerializedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  banned?: boolean | null;
  banReason?: string | null;
  createdAt: string;
  _count?: {
    bouquetPosts: number;
  };
  assignedTasks?: {
    id: string;
    title: string;
  }[];
}

interface EmployeeTableProps {
  users: SerializedUser[];
  currentUserId?: string;
}

export default function EmployeeTable({
  users: initialUsers,
  currentUserId,
}: EmployeeTableProps) {
  const router = useRouter();
  const [users, setUsers] = useState<SerializedUser[]>(initialUsers);
  const [filterTab, setFilterTab] = useState<"ACTIVE" | "DEACTIVATED" | "ALL">(
    "ACTIVE"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<TargetEmployee | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync when initialUsers prop updates (e.g. from router.refresh())
  React.useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const activeEmployees = users.filter(
    (u) => u.role === "EMPLOYEE" && !u.banned
  );
  const deactivatedEmployees = users.filter(
    (u) => u.role === "EMPLOYEE" && u.banned
  );

  // Filter based on active tab
  const filteredUsers = users.filter((u) => {
    // 1. Tab filter
    if (filterTab === "ACTIVE") {
      // Active tab shows active employees + owners
      if (u.role === "EMPLOYEE" && u.banned) return false;
    } else if (filterTab === "DEACTIVATED") {
      // Deactivated tab shows only deactivated accounts
      if (!u.banned) return false;
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }

    return true;
  });

  const handleOpenDelete = (u: SerializedUser) => {
    setSelectedEmployee({
      id: u.id,
      name: u.name,
      email: u.email,
      pendingTasksCount: u.assignedTasks?.length || 0,
      bouquetPostsCount: u._count?.bouquetPosts || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);

    // Optimistically update local state so user doesn't need to wait for full reload
    if (selectedEmployee) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedEmployee.id
            ? { ...u, banned: true, banReason: "Dinonaktifkan oleh Owner" }
            : u
        )
      );
    }
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs flex items-center justify-between gap-3 text-emerald-800 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-bold px-2 py-1 rounded-lg"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setFilterTab("ACTIVE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === "ACTIVE"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Karyawan Aktif ({activeEmployees.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("DEACTIVATED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === "DEACTIVATED"
                  ? "bg-white text-rose-700 shadow-2xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Dinonaktifkan ({deactivatedEmployees.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === "ALL"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Semua Akun ({users.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/75 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5">Nama & Email</th>
                <th className="px-6 py-3.5">Peran (Role)</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Aktivitas</th>
                <th className="px-6 py-3.5">Terdaftar</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-xs">
                    {filterTab === "DEACTIVATED"
                      ? "Tidak ada akun karyawan yang dinonaktifkan."
                      : "Tidak ada akun yang sesuai dengan pencarian."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isOwner = u.role === "OWNER";
                  const isBanned = Boolean(u.banned);
                  const isSelf = currentUserId ? u.id === currentUserId : false;

                  const dateStr = new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                  }).format(new Date(u.createdAt));

                  const bouquetCount = u._count?.bouquetPosts || 0;
                  const pendingCount = u.assignedTasks?.length || 0;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-gray-50/50 transition-colors ${
                        isBanned ? "bg-gray-50/40 opacity-80" : ""
                      }`}
                    >
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                              isBanned
                                ? "bg-gray-200 text-gray-500"
                                : isOwner
                                ? "bg-purple-100 text-purple-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded border border-rose-100">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
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

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        {isBanned ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200"
                            title={u.banReason || "Akun dinonaktifkan"}
                          >
                            <Ban className="w-3 h-3 text-rose-500" />
                            <span>Dinonaktifkan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            <span>Aktif</span>
                          </span>
                        )}
                      </td>

                      {/* Activity metrics */}
                      <td className="px-6 py-4 text-xs text-gray-500">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <ImageIcon className="w-3 h-3 text-gray-400" />
                            <span>{bouquetCount} foto buket</span>
                          </span>
                          {pendingCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                              <Clock className="w-3 h-3" />
                              <span>{pendingCount} tugas pending</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="px-6 py-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-right">
                        {!isOwner && !isBanned && (
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(u)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 active:scale-95 border border-rose-200/80 rounded-xl transition-all cursor-pointer shadow-2xs"
                            title={`Hapus / Nonaktifkan akun ${u.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                        {isOwner && (
                          <span className="text-[11px] text-gray-400 font-medium italic">
                            Terlindungi
                          </span>
                        )}
                        {isBanned && (
                          <span className="text-[11px] text-gray-400 font-medium italic">
                            Nonaktif
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteEmployeeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        employee={selectedEmployee}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
