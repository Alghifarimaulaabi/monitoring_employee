"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { CheckSquare, Camera, History, LogOut } from "lucide-react";

interface EmployeeNavProps {
  userName: string;
  userEmail: string;
}

export default function EmployeeNav({ userName, userEmail }: EmployeeNavProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } finally {
      window.location.href = "/login";
    }
  };

  const navItems = [
    { href: "/employee/tasks", label: "Tugas Harian", icon: CheckSquare },
    { href: "/employee/submit", label: "Foto Buket", icon: Camera },
    { href: "/employee/history", label: "Riwayat Buket", icon: History },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <div>
              <span className="font-bold text-gray-900 text-sm block leading-none">B-Tracker</span>
              <span className="text-[10px] text-gray-400 font-medium">Staf Lapangan</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-xs font-semibold text-gray-800 block leading-tight">{userName}</span>
              <span className="text-[10px] text-gray-400 block leading-none">{userEmail}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-30 pb-safe">
        <div className="max-w-md mx-auto grid grid-cols-3 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? "text-rose-600 font-semibold" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                <span className="text-[11px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
