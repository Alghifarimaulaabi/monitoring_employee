"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
  X,
  ExternalLink,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaInstallViewProps {
  userSession?: {
    name: string | null;
    role: string | null;
  } | null;
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(display-mode: standalone)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshotStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://")
  );
}

function subscribeNoop() {
  return () => {};
}

function getSnapshotIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

export default function PwaInstallView({ userSession }: PwaInstallViewProps) {
  // Determine target link for user
  const dashboardLink = userSession
    ? userSession.role === "OWNER" || userSession.role === "admin"
      ? "/owner/employees"
      : "/employee/tasks"
    : "/login";

  const isStandalone = useSyncExternalStore(subscribeStandalone, getSnapshotStandalone, () => false);
  const isIos = useSyncExternalStore(subscribeNoop, getSnapshotIos, () => false);

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone) {
      window.location.replace(dashboardLink);
    }
  }, [isStandalone, dashboardLink]);

  useEffect(() => {
    if (!showIosGuide) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowIosGuide(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showIosGuide]);

  useEffect(() => {
    // Listen for beforeinstallprompt (Chrome, Chromium, Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instruction for browsers without deferredPrompt
      alert(
        "Untuk menginstall aplikasi ini:\n\n1. Di Google Chrome: Ketuk menu titik tiga (⋮) lalu pilih 'Instal aplikasi' atau 'Tambahkan ke Layar Utama'.\n2. Di Safari iOS: Ketuk tombol Bagikan lalu 'Tambah ke Layar Utama'."
      );
    }
  };

  if (isStandalone) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-rose-50 via-white to-pink-50 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200 mb-4 animate-pulse">
          <span className="text-3xl">🌸</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Membuka B-Tracker...</h2>
        <p className="text-xs text-gray-500 mt-1">Mengalihkan ke aplikasi</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-gradient-to-b from-rose-50 via-white to-pink-50/40 p-4 sm:p-6 select-none">
      {/* Top Bar / Header */}
      <header className="w-full max-w-md flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-base">🌸</span>
          </div>
          <span className="font-bold text-gray-900 tracking-tight text-base">B-Tracker</span>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100/70 text-rose-700 border border-rose-200/60">
          <Sparkles className="w-3 h-3" /> PWA Ready
        </span>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-md my-auto py-6">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl shadow-rose-100/60 border border-rose-100 p-6 sm:p-8 text-center relative overflow-hidden">
          {/* Subtle decorative glow in top card */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-200/40 rounded-full blur-2xl pointer-events-none" />

          {/* App Logo */}
          <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32 mb-5">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-pink-400 rounded-3xl blur-md opacity-40 transform scale-95" />
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-lg shadow-rose-200 border-2 border-white flex items-center justify-center bg-gradient-to-tr from-rose-500 via-rose-600 to-pink-500 transform hover:scale-[1.02] transition-transform">
              <Image
                src="/icons/icon-192x192.png"
                alt="Logo B-Tracker"
                width={128}
                height={128}
                priority
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* App Title & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            B-Tracker
          </h1>
          <p className="text-xs sm:text-sm font-medium text-rose-600 mt-1">
            Bouquet Tracker & Field Operations
          </p>

          <p className="text-xs sm:text-sm text-gray-500 mt-3 leading-relaxed">
            Sistem monitoring buket florist & manajemen tugas operasional karyawan. Instal ke layar utama untuk pengalaman seperti aplikasi native.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-2 mt-5 text-left">
            <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100/80 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-900">Aplikasi Ringan</div>
                <div className="text-[11px] text-gray-500">Tanpa membebani memori</div>
              </div>
            </div>

            <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100/80 flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-900">Akses Cepat</div>
                <div className="text-[11px] text-gray-500">Buka langsung dari HP</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 space-y-3">
            {/* Install Button */}
            {!isInstalled && !isStandalone ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 hover:from-rose-700 hover:to-pink-600 active:scale-[0.98] text-white font-semibold text-sm sm:text-base rounded-2xl shadow-lg shadow-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-5 h-5 animate-bounce" />
                <span>Install Aplikasi B-Tracker</span>
              </button>
            ) : (
              <div className="w-full py-3 px-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Aplikasi Sudah Terpasang di Perangkat Ini</span>
              </div>
            )}

            {/* Direct Open / Login Button */}
            <Link
              href={dashboardLink}
              className="w-full py-3 px-4 bg-white hover:bg-gray-50 active:scale-[0.99] text-gray-800 font-medium text-sm rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all flex items-center justify-center gap-2"
            >
              {userSession ? (
                <>
                  <span>Buka Dashboard ({userSession.name || "Akun"})</span>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem (Buka di Web)</span>
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </>
              )}
            </Link>

            {/* iOS Help Link */}
            {isIos && !isStandalone && (
              <button
                type="button"
                onClick={() => setShowIosGuide(true)}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 underline underline-offset-2 pt-1 font-medium cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Cara pasang di iPhone / iPad
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center py-2 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} B-Tracker. All rights reserved.
      </footer>

      {/* iOS Install Instruction Modal */}
      {showIosGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-guide-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-rose-100 animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 id="ios-guide-title" className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-rose-600" />
                Cara Pasang di iOS (Safari)
              </h3>
              <button
                onClick={() => setShowIosGuide(false)}
                aria-label="Tutup panduan pemasangan"
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ketuk Tombol Bagikan (Share)</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    Ketuk ikon bagikan <Share className="w-3.5 h-3.5 text-blue-600 inline" /> di bilah navigasi bawah Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Pilih &quot;Tambah ke Layar Utama&quot;</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    Gulir opsi dan pilih <PlusSquare className="w-3.5 h-3.5 text-gray-700 inline" /> <b>&quot;Add to Home Screen&quot;</b>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ketuk &quot;Tambah&quot; (Add)</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ketuk tombol Tambah di pojok kanan atas. B-Tracker akan muncul sebagai aplikasi di layar utama!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-xl transition-all"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
