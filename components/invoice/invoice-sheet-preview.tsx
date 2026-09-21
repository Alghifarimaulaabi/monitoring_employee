"use client";

import React from "react";
import Image from "next/image";
import { InvoiceData, formatRupiah, terbilang } from "@/lib/constants/invoice";

interface InvoiceSheetPreviewProps {
  data: InvoiceData;
  isEditing?: boolean;
  onChange?: (field: keyof InvoiceData, value: string | number) => void;
  onAmountChange?: (rawStr: string) => void;
}

export default function InvoiceSheetPreview({
  data,
  isEditing = false,
  onChange,
  onAmountChange,
}: InvoiceSheetPreviewProps) {
  const formattedAmount = formatRupiah(data.totalAmount);

  const handleFieldChange = (field: keyof InvoiceData, val: string) => {
    if (onChange) {
      onChange(field, val);
    }
  };

  const handleNumberInput = (val: string) => {
    if (onAmountChange) {
      onAmountChange(val);
    } else if (onChange) {
      const cleanNum = parseInt(val.replace(/\D/g, ""), 10) || 0;
      onChange("totalAmount", cleanNum);
      onChange("terbilangAmount", `${terbilang(cleanNum)} Rupiah`);
    }
  };

  // Helper classes for editable elements
  const inputClass = isEditing
    ? "border-b border-dashed border-rose-400 bg-rose-50/40 hover:bg-rose-50 focus:bg-white focus:ring-1 focus:ring-rose-500 px-1.5 py-0.5 rounded transition-all outline-none text-inherit font-inherit"
    : "";

  return (
    <div className="invoice-sheet-print bg-white text-black w-full max-w-[210mm] min-h-[297mm] mx-auto p-8 sm:p-12 md:p-14 shadow-xl border border-gray-200 rounded-sm font-sans text-xs sm:text-sm leading-normal sm:leading-relaxed flex flex-col justify-between select-text transition-all print:shadow-none print:border-none print:m-0 print:p-0">
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
            {isEditing ? (
              <input
                type="text"
                value={data.companyName}
                onChange={(e) => handleFieldChange("companyName", e.target.value)}
                className={`text-[10px] sm:text-xs font-serif font-bold text-gray-800 tracking-wider text-center mt-1 w-full ${inputClass}`}
                title="Klik untuk ubah nama di bawah logo"
              />
            ) : (
              <span className="text-[10px] sm:text-xs font-serif font-bold text-gray-800 tracking-wider mt-1 text-center block">
                {data.companyName}
              </span>
            )}
          </div>

          {/* Company details */}
          <div className="flex-1 text-center pr-10 sm:pr-16 space-y-1">
            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={data.companyName}
                  onChange={(e) => handleFieldChange("companyName", e.target.value)}
                  className={`font-serif font-bold text-lg sm:text-xl md:text-2xl text-gray-900 tracking-wide text-center w-full ${inputClass}`}
                  placeholder="Nama Perusahaan"
                />
                <input
                  type="text"
                  value={data.companyAddress}
                  onChange={(e) => handleFieldChange("companyAddress", e.target.value)}
                  className={`text-[11px] sm:text-xs text-gray-800 text-center w-full ${inputClass}`}
                  placeholder="Alamat Perusahaan"
                />
                <input
                  type="text"
                  value={data.companyContact}
                  onChange={(e) => handleFieldChange("companyContact", e.target.value)}
                  className={`text-[11px] sm:text-xs text-gray-800 text-center w-full ${inputClass}`}
                  placeholder="Kontak Telp & Email"
                />
              </div>
            ) : (
              <>
                <h1 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-gray-900 tracking-wide">
                  {data.companyName}
                </h1>
                <p className="text-[11px] sm:text-xs text-gray-800 mt-0.5">
                  {data.companyAddress}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-800">
                  {data.companyContact}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Divider line */}
        <div className="border-b-2 sm:border-b-[2.5px] border-black mt-2 mb-4 print:mt-1 print:mb-2" />

        {/* Tanggal Surat (Kanan Atas) */}
        <div className="flex justify-end mb-3 print:mb-1.5">
          {isEditing ? (
            <input
              type="text"
              value={data.letterDate}
              onChange={(e) => handleFieldChange("letterDate", e.target.value)}
              className={`text-gray-900 font-normal text-right w-48 ${inputClass}`}
              title="Klik untuk ubah tanggal surat"
              placeholder="Contoh: 18 Mei 2026"
            />
          ) : (
            <span className="text-gray-900 font-normal">{data.letterDate}</span>
          )}
        </div>

        {/* Metadata Surat: Nomor, Perihal, Lampiran */}
        <div className="grid grid-cols-[80px_16px_1fr] sm:grid-cols-[90px_20px_1fr] text-xs sm:text-sm gap-y-1 sm:gap-y-1.5 mb-4 print:mb-2 items-center">
          <span className="text-gray-900">Nomor</span>
          <span>:</span>
          {isEditing ? (
            <input
              type="text"
              value={data.letterNumber}
              onChange={(e) => handleFieldChange("letterNumber", e.target.value)}
              className={`text-gray-900 font-medium max-w-sm ${inputClass}`}
              placeholder="005/ALZ/V/2026"
            />
          ) : (
            <span className="text-gray-900 font-medium">{data.letterNumber}</span>
          )}

          <span className="text-gray-900">Perihal</span>
          <span>:</span>
          {isEditing ? (
            <input
              type="text"
              value={data.subject}
              onChange={(e) => handleFieldChange("subject", e.target.value)}
              className={`text-gray-900 font-medium max-w-sm ${inputClass}`}
              placeholder="Penagihan"
            />
          ) : (
            <span className="text-gray-900 font-medium">{data.subject}</span>
          )}

          <span className="text-gray-900">Lampiran</span>
          <span>:</span>
          {isEditing ? (
            <input
              type="text"
              value={data.attachment}
              onChange={(e) => handleFieldChange("attachment", e.target.value)}
              className={`text-gray-900 max-w-xs ${inputClass}`}
              placeholder="-"
            />
          ) : (
            <span className="text-gray-900">{data.attachment}</span>
          )}
        </div>

        {/* Penerima Surat (Yth.) */}
        <div className="space-y-0.5 sm:space-y-1 mb-4 print:mb-2 text-xs sm:text-sm text-gray-900 max-w-md">
          {isEditing ? (
            <div className="space-y-1.5">
              <input
                type="text"
                value={data.recipientSalutation}
                onChange={(e) => handleFieldChange("recipientSalutation", e.target.value)}
                className={`w-28 ${inputClass}`}
                placeholder="Yth."
              />
              <input
                type="text"
                value={data.recipientTitle}
                onChange={(e) => handleFieldChange("recipientTitle", e.target.value)}
                className={`w-full block ${inputClass}`}
                placeholder="General Manager"
              />
              <input
                type="text"
                value={data.recipientCompany}
                onChange={(e) => handleFieldChange("recipientCompany", e.target.value)}
                className={`w-full block font-medium ${inputClass}`}
                placeholder="Patra Cirebon"
              />
              <input
                type="text"
                value={data.recipientAddress}
                onChange={(e) => handleFieldChange("recipientAddress", e.target.value)}
                className={`w-full block ${inputClass}`}
                placeholder="Jl. Tuparev No. 11 Kedawung"
              />
              <input
                type="text"
                value={data.recipientCity}
                onChange={(e) => handleFieldChange("recipientCity", e.target.value)}
                className={`w-full block ${inputClass}`}
                placeholder="Cirebon"
              />
            </div>
          ) : (
            <>
              <p>{data.recipientSalutation}</p>
              {data.recipientTitle ? <p>{data.recipientTitle}</p> : null}
              <p className="font-medium">{data.recipientCompany}</p>
              <p>{data.recipientAddress}</p>
              <p>{data.recipientCity}</p>
            </>
          )}
        </div>

        {/* Salam Pembuka */}
        <div className="mb-2 print:mb-1 text-xs sm:text-sm">
          {isEditing ? (
            <input
              type="text"
              value={data.greeting}
              onChange={(e) => handleFieldChange("greeting", e.target.value)}
              className={`w-44 ${inputClass}`}
              placeholder="Dengan Hormat,"
            />
          ) : (
            <p className="text-gray-900">{data.greeting}</p>
          )}
        </div>

        {/* Paragraf 1: Pengantar Layanan & Periode */}
        <div className="mb-2.5 print:mb-1.5 text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
          {isEditing ? (
            <div className="space-y-1.5 p-2 bg-rose-50/30 border border-dashed border-rose-300 rounded-lg">
              <span className="text-[10px] font-bold text-rose-600 block uppercase tracking-wider">
                Isi Surat & Periode:
              </span>
              <span>Bersama ini kami sampaikan mengenai tagihan </span>
              <input
                type="text"
                value={data.serviceDescription}
                onChange={(e) => handleFieldChange("serviceDescription", e.target.value)}
                className={`inline-block font-medium w-full sm:w-auto sm:min-w-[320px] ${inputClass}`}
                placeholder="Perawatan Taman, Rental Tanaman, dan Bunga Rangkai"
              />
              <span> periode </span>
              <input
                type="text"
                value={data.periodStart}
                onChange={(e) => handleFieldChange("periodStart", e.target.value)}
                className={`inline-block font-medium w-32 ${inputClass}`}
                placeholder="25 April 2026"
              />
              <span> s/d </span>
              <input
                type="text"
                value={data.periodEnd}
                onChange={(e) => handleFieldChange("periodEnd", e.target.value)}
                className={`inline-block font-medium w-32 ${inputClass}`}
                placeholder="24 Mei 2026"
              />
              <span>.</span>
            </div>
          ) : (
            <p>
              Bersama ini kami sampaikan mengenai tagihan {data.serviceDescription}{" "}
              periode {data.periodStart} s/d {data.periodEnd}.
            </p>
          )}
        </div>

        {/* Paragraf 2: Nilai Tagihan & Terbilang */}
        <div className="mb-2.5 print:mb-1.5 text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
          {isEditing ? (
            <div className="space-y-2 p-2 bg-rose-50/30 border border-dashed border-rose-300 rounded-lg">
              <span className="text-[10px] font-bold text-rose-600 block uppercase tracking-wider">
                Nominal Tagihan & Terbilang:
              </span>
              <span>Adapun nilai tagihannya sebesar <strong>Rp. </strong></span>
              <input
                type="text"
                value={formattedAmount}
                onChange={(e) => handleNumberInput(e.target.value)}
                className={`inline-block font-bold w-40 text-gray-900 ${inputClass}`}
                placeholder="15.000.000"
                title="Masukkan nominal angka (terbilang otomatis terupdate)"
              />
              <span><strong>.- ( </strong></span>
              <input
                type="text"
                value={data.terbilangAmount}
                onChange={(e) => handleFieldChange("terbilangAmount", e.target.value)}
                className={`inline-block font-medium w-64 capitalize text-gray-800 ${inputClass}`}
                placeholder="Lima Belas Juta Rupiah"
                title="Teks terbilang (bisa dikustomisasi)"
              />
              <span><strong> )</strong></span>
            </div>
          ) : (
            <p>
              Adapun nilai tagihannya sebesar{" "}
              <strong>Rp. {formattedAmount}.-</strong> ({" "}
              <span className="capitalize">{data.terbilangAmount}</span> )
            </p>
          )}
        </div>

        {/* Paragraf 3: Rekening Pembayaran */}
        <div className="mb-1.5 print:mb-1 text-xs sm:text-sm text-gray-900">
          {isEditing ? (
            <input
              type="text"
              value={data.paymentInstructions}
              onChange={(e) => handleFieldChange("paymentInstructions", e.target.value)}
              className={`w-full ${inputClass}`}
              placeholder="Untuk pembayarannya mohon di transfer melalui rekening :"
            />
          ) : (
            <p>{data.paymentInstructions}</p>
          )}
        </div>

        {/* Rincian Rekening */}
        <div className="grid grid-cols-[100px_16px_1fr] sm:grid-cols-[110px_20px_1fr] text-xs sm:text-sm gap-y-1 sm:gap-y-1.5 mb-4 print:mb-2 ml-0 text-gray-900 font-medium items-center">
          <span>Atas nama</span>
          <span>:</span>
          {isEditing ? (
            <input
              type="text"
              value={data.bankAccountName}
              onChange={(e) => handleFieldChange("bankAccountName", e.target.value)}
              className={`max-w-sm ${inputClass}`}
              placeholder="Aji Kurniaji"
            />
          ) : (
            <span>{data.bankAccountName}</span>
          )}

          <span>No rekening</span>
          <span>:</span>
          {isEditing ? (
            <input
              type="text"
              value={data.bankAccountNumber}
              onChange={(e) => handleFieldChange("bankAccountNumber", e.target.value)}
              className={`font-mono font-bold tracking-wider max-w-sm ${inputClass}`}
              placeholder="1320025326860"
            />
          ) : (
            <span className="font-mono font-bold tracking-wider">{data.bankAccountNumber}</span>
          )}

          <span>Bank</span>
          <span>:</span>
          {isEditing ? (
            <input
              type="text"
              value={data.bankName}
              onChange={(e) => handleFieldChange("bankName", e.target.value)}
              className={`max-w-xs ${inputClass}`}
              placeholder="Mandiri"
            />
          ) : (
            <span>{data.bankName}</span>
          )}
        </div>

        {/* Paragraf Penutup */}
        <div className="mb-6 print:mb-2.5 text-xs sm:text-sm text-justify leading-relaxed text-gray-900">
          {isEditing ? (
            <textarea
              rows={2}
              value={data.closingText}
              onChange={(e) => handleFieldChange("closingText", e.target.value)}
              className={`w-full ${inputClass} resize-y`}
              placeholder="Demikian surat penagihan ini kami sampaikan..."
            />
          ) : (
            <p>{data.closingText}</p>
          )}
        </div>
      </div>

      {/* Tanda Tangan (Kanan Bawah) */}
      <div className="flex justify-end pt-2 print:pt-1">
        <div className="text-center min-w-[180px] space-y-10 sm:space-y-12 print:space-y-7">
          {isEditing ? (
            <input
              type="text"
              value={data.signatureSalutation}
              onChange={(e) => handleFieldChange("signatureSalutation", e.target.value)}
              className={`text-xs sm:text-sm text-gray-900 text-center w-full ${inputClass}`}
              placeholder="Hormat kami,"
            />
          ) : (
            <p className="text-xs sm:text-sm text-gray-900">{data.signatureSalutation}</p>
          )}

          <div className="space-y-1">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={data.signerName}
                  onChange={(e) => handleFieldChange("signerName", e.target.value)}
                  className={`font-bold text-xs sm:text-sm text-gray-900 underline underline-offset-2 text-center w-full ${inputClass}`}
                  placeholder="Aji Kurniaji"
                />
                <input
                  type="text"
                  value={data.signerTitle}
                  onChange={(e) => handleFieldChange("signerTitle", e.target.value)}
                  className={`text-xs text-gray-700 text-center w-full ${inputClass}`}
                  placeholder="Direktur"
                />
              </>
            ) : (
              <>
                <p className="font-bold text-xs sm:text-sm text-gray-900 underline underline-offset-2">
                  {data.signerName}
                </p>
                <p className="text-xs text-gray-700">{data.signerTitle}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
