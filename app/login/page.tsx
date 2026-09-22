"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

function getRedirectTarget(role?: string | null, callbackUrl?: string | null): string {
  const isOwner = role === "OWNER" || role === "admin";

  if (callbackUrl) {
    if (isOwner && callbackUrl.startsWith("/owner")) {
      return callbackUrl;
    }
    if (!isOwner && callbackUrl.startsWith("/employee")) {
      return callbackUrl;
    }
  }

  return isOwner ? "/owner/employees" : "/employee/tasks";
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    errorParam === "account_deactivated"
      ? "Akun Anda telah dinonaktifkan oleh administrator."
      : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session?.user && !session.user.banned) {
      const target = getRedirectTarget(session.user.role, callbackUrl);
      window.location.href = target;
    }
  }, [session, isPending, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (res.error) {
        const errorMsg = res.error.message?.toLowerCase() || "";
        if (errorMsg.includes("ban") || res.error.status === 403) {
          setError("Akun Anda telah dinonaktifkan oleh administrator dan tidak dapat digunakan untuk login.");
        } else {
          setError(res.error.message || "Email atau kata sandi tidak sesuai.");
        }
        setIsLoading(false);
        return;
      }

      // Check current session to get role and redirect immediately
      const sessionRes = await authClient.getSession();
      const role = sessionRes.data?.user?.role || (res.data as { user?: { role?: string } })?.user?.role;
      const target = getRedirectTarget(role, callbackUrl);

      window.location.href = target;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat masuk.";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-rose-100/50 border border-rose-100/80 p-8 sm:p-10 transition-all">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-rose-500 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 mb-4 transform hover:scale-105 transition-transform">
          <span className="text-3xl">🌸</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">B-Tracker</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Bouquet Tracker & Field Operations</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Email Akun
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@florist.com"
              className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Kata Sandi
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-md shadow-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memverifikasi...</span>
            </>
          ) : (
            <span>Masuk ke Sistem</span>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          Akun staf didaftarkan secara terpusat oleh Manager / Owner.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-stone-50 p-4 sm:p-6">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-rose-100/50 border border-rose-100/80 p-8 sm:p-10 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            <span className="text-xs text-gray-400 mt-2">Memuat halaman masuk...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

