"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Flower2,
  Layers,
  ArrowRight,
  Sparkles,
  ReceiptText,
  Search,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { SerializedInvoicePeriod } from "@/lib/actions/invoice";
import { formatRupiah } from "@/lib/constants/invoice";

interface InvoiceCardsViewProps {
  periods: SerializedInvoicePeriod[];
}

export default function InvoiceCardsView({ periods }: InvoiceCardsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPeriods = periods.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.formattedRange.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAllInvoices = periods.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalAllFlowers = periods.reduce((sum, p) => sum + p.totalFlowers, 0);
  const totalAllBouquets = periods.reduce((sum, p) => sum + p.totalPosts, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <span>Manajemen Tagihan Buket</span>
            <span className="text-xs bg-rose-50 text-rose-700 font-semibold px-2.5 py-0.5 rounded-full border border-rose-100">
              {periods.length} Periode
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Daftar kartu periode penagihan otomatis dari kartu buket. Klik detail untuk menyunting template surat dan export PDF.
          </p>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">
              Total Akumulasi Tagihan
            </div>
            <div className="text-lg sm:text-xl font-bold text-gray-900">
              Rp {formatRupiah(totalAllInvoices)}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Flower2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">
              Total Seluruh Buket
            </div>
            <div className="text-lg sm:text-xl font-bold text-gray-900">
              {totalAllBouquets} Buket
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">
              Total Tangkai Bunga
            </div>
            <div className="text-lg sm:text-xl font-bold text-gray-900">
              {totalAllFlowers} pcs
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama periode atau rentang tanggal..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
          />
        </div>

        <span className="text-xs text-gray-500 sm:text-right">
          Menampilkan <strong>{filteredPeriods.length}</strong> dari{" "}
          {periods.length} kartu tagihan
        </span>
      </div>

      {/* Cards Grid */}
      {filteredPeriods.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-200/80 shadow-xs text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <ReceiptText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {periods.length === 0
              ? "Belum Ada Periode Buket / Tagihan"
              : "Tidak Ditemukan Periode yang Cocok"}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            {periods.length === 0
              ? "Kartu tagihan akan otomatis muncul begitu kartu periode buket dibuat di menu Galeri Buket."
              : "Coba gunakan kata kunci pencarian lain."}
          </p>
          {periods.length === 0 && (
            <div className="mt-5">
              <Link
                href="/owner/bouquets"
                prefetch={true}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <span>Buka Menu Buket</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPeriods.map((period) => (
            <div
              key={period.id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
            >
              {/* Card Top */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                    {period.totalPosts} Buket Terpasang
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-rose-600 transition-colors">
                    {period.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Rentang: {period.formattedRange}
                  </p>
                </div>

                {/* Amount Highlight */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
                      Total Nilai Tagihan
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      Rp {formatRupiah(period.totalAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">Total Bunga</span>
                    <span className="text-xs font-bold text-gray-700">
                      {period.totalFlowers} pcs
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="pt-3 border-t border-gray-100">
                <Link
                  href={`/owner/invoices/${period.id}`}
                  prefetch={true}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs shadow-rose-200 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Detail Surat Tagihan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
