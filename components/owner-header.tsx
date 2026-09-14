"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Users, Flower2, CheckSquare, LogOut } from "lucide-react";

interface OwnerHeaderProps {
  userName: string;
  userEmail: string;
}

export default function OwnerHeader({ userName, userEmail }: OwnerHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { href: "/owner/employees", label: "Karyawan", icon: Users },
    { href: "/owner/bouquets", label: "Galeri Buket", icon: Flower2 },
    { href: "/owner/tasks", label: "Penugasan", icon: CheckSquare },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/owner/employees" className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-lg shadow-sm">
                🌸
              </span>
              <div>
                <span className="font-bold text-gray-900 text-base tracking-tight block leading-tight">
                  B-Tracker
                </span>
                <span className="text-[10px] uppercase font-semibold text-rose-600 tracking-wider">
                  Owner Panel
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-rose-50 text-rose-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-gray-900">{userName}</span>
              <span className="text-xs text-gray-500">{userEmail}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-gray-100 py-2 gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-rose-50 text-rose-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
