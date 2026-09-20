"use client";

import React from "react";
import Image from "next/image";
import { InvoiceData, formatRupiah } from "@/lib/constants/invoice";

interface InvoiceSheetPreviewProps {
  data: InvoiceData;
}

export default function InvoiceSheetPreview({ data }: InvoiceSheetPreviewProps) {
  const formattedAmount = formatRupiah(data.totalAmount);

  return (
    <div className="bg-white text-black w-full max-w-[210mm] min-h-[297mm] mx-auto p-10 sm:p-14 md:p-16 shadow-lg border border-gray-200 rounded-sm font-sans text-xs sm:text-sm leading-relaxed flex flex-col justify-between select-text print:shadow-none print:border-none print:p-8 print:max-w-none print:min-h-0">
      <div>
        {/* Header / Kop Surat */}
        <div className="flex items-center gap-4 sm:gap-6 pb-2">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center shrink-0 w-20 sm:w-24">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex items-center justify-center">
              {data.companyLogoUrl ? (
                <Image
                  src={data.companyLogoUrl}
                  alt={data.companyName}
                  fill
                  sizes="80px"
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="w-14 h-14 rounded-full border-2 border-rose-500 flex items-center justify-center text-rose-600 font-bold text-lg">
                  CA
                </div>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-serif font-bold text-gray-800 tracking-wider mt-1">
              {data.companyName}
            </span>
          </div>

          {/* Company details */}
          <div className="flex-1 text-center pr-12 sm:pr-16">
            <h1 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-gray-900 tracking-wide">
              {data.companyName}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-800 mt-0.5">
              {data.companyAddress}
            </p>
            <p className="text-[11px] sm:text-xs text-gray-800">
              {data.companyContact}
            </p>
          </div>
        </div>

        {/* Divider line */}
        <div className="border-b-2 sm:border-b-[2.5px] border-black mt-2 mb-6" />

        {/* Tanggal Surat (Kanan Atas) */}
        <div className="flex justify-end mb-4">
          <span className="text-gray-900 font-normal">{data.letterDate}</span>
        </div>

        {/* Metadata Surat: Nomor, Perihal, Lampiran */}
        <div className="grid grid-cols-[80px_16px_1fr] sm:grid-cols-[90px_20px_1fr] text-xs sm:text-sm gap-y-1 mb-6">
          <span className="text-gray-900">Nomor</span>
          <span>:</span>
          <span className="text-gray-900 font-medium">{data.letterNumber}</span>

          <span className="text-gray-900">Perihal</span>
          <span>:</span>
          <span className="text-gray-900 font-medium">{data.subject}</span>

          <span className="text-gray-900">Lampiran</span>
          <span>:</span>
          <span className="text-gray-900">{data.attachment}</span>
        </div>

        {/* Penerima Surat (Yth.) */}
        <div className="space-y-0.5 mb-6 text-xs sm:text-sm text-gray-900">
          <p>{data.recipientSalutation}</p>
          {data.recipientTitle ? <p>{data.recipientTitle}</p> : null}
          <p className="font-medium">{data.recipientCompany}</p>
          <p>{data.recipientAddress}</p>
          <p>{data.recipientCity}</p>
        </div>

        {/* Salam Pembuka */}
        <div className="mb-3 text-xs sm:text-sm">
          <p className="text-gray-900">{data.greeting}</p>
        </div>

        {/* Paragraf 1: Pengantar Layanan & Periode */}
        <div className="mb-3 text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
          <p>
            Bersama ini kami sampaikan mengenai tagihan {data.serviceDescription}{" "}
            periode {data.periodStart} s/d {data.periodEnd}.
          </p>
        </div>

        {/* Paragraf 2: Nilai Tagihan & Terbilang */}
        <div className="mb-3 text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
          <p>
            Adapun nilai tagihannya sebesar{" "}
            <strong>Rp. {formattedAmount}.-</strong> ({" "}
            <span className="capitalize">{data.terbilangAmount}</span> )
          </p>
        </div>

        {/* Paragraf 3: Rekening Pembayaran */}
        <div className="mb-2 text-xs sm:text-sm text-gray-900">
          <p>{data.paymentInstructions}</p>
        </div>

        {/* Rincian Rekening */}
        <div className="grid grid-cols-[100px_16px_1fr] sm:grid-cols-[110px_20px_1fr] text-xs sm:text-sm gap-y-1 mb-6 ml-0 text-gray-900 font-medium">
          <span>Atas nama</span>
          <span>:</span>
          <span>{data.bankAccountName}</span>

          <span>No rekening</span>
          <span>:</span>
          <span className="font-mono font-bold tracking-wider">{data.bankAccountNumber}</span>

          <span>Bank</span>
          <span>:</span>
          <span>{data.bankName}</span>
        </div>

        {/* Paragraf Penutup */}
        <div className="mb-12 text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
          <p>{data.closingText}</p>
        </div>
      </div>

      {/* Tanda Tangan (Kanan Bawah) */}
      <div className="flex justify-end pt-4">
        <div className="text-center min-w-[170px] space-y-16">
          <p className="text-xs sm:text-sm text-gray-900">{data.signatureSalutation}</p>
          <div className="space-y-0.5">
            <p className="font-bold text-xs sm:text-sm text-gray-900 underline underline-offset-2">
              {data.signerName}
            </p>
            <p className="text-xs text-gray-700">{data.signerTitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
