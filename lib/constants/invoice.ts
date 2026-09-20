/**
 * Business Logic, Data Types, and Helpers for Invoice / Surat Penagihan
 * Separated from UI components for maintainability.
 */

export interface InvoiceData {
  // Kop Surat
  companyName: string;
  companyAddress: string;
  companyContact: string;
  companyLogoUrl?: string;

  // Metadata Surat
  letterNumber: string;
  letterDate: string;
  subject: string;
  attachment: string;

  // Penerima Surat
  recipientSalutation: string;
  recipientTitle: string;
  recipientCompany: string;
  recipientAddress: string;
  recipientCity: string;

  // Isi Surat
  greeting: string;
  serviceDescription: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  terbilangAmount: string;

  // Rekening Pembayaran
  paymentInstructions: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;

  // Penutup & Tanda Tangan
  closingText: string;
  signatureSalutation: string;
  signerName: string;
  signerTitle: string;
}

const SATUAN = [
  "",
  "Satu",
  "Dua",
  "Tiga",
  "Empat",
  "Lima",
  "Enam",
  "Tujuh",
  "Delapan",
  "Sembilan",
  "Sepuluh",
  "Sebelas",
];

/**
 * Converts a numerical integer to Indonesian words (Terbilang).
 * E.g. 15000000 -> "Lima Belas Juta"
 */
export function terbilang(n: number): string {
  const num = Math.floor(Math.abs(n));

  if (num === 0) return "Nol";
  if (num < 12) return SATUAN[num];
  if (num < 20) return `${terbilang(num - 10)} Belas`;
  if (num < 100) {
    const sisa = num % 10;
    return `${terbilang(Math.floor(num / 10))} Puluh${sisa > 0 ? " " + terbilang(sisa) : ""}`;
  }
  if (num < 200) {
    const sisa = num - 100;
    return `Seratus${sisa > 0 ? " " + terbilang(sisa) : ""}`;
  }
  if (num < 1000) {
    const sisa = num % 100;
    return `${terbilang(Math.floor(num / 100))} Ratus${sisa > 0 ? " " + terbilang(sisa) : ""}`;
  }
  if (num < 2000) {
    const sisa = num - 1000;
    return `Seribu${sisa > 0 ? " " + terbilang(sisa) : ""}`;
  }
  if (num < 1000000) {
    const sisa = num % 1000;
    return `${terbilang(Math.floor(num / 1000))} Ribu${sisa > 0 ? " " + terbilang(sisa) : ""}`;
  }
  if (num < 1000000000) {
    const sisa = num % 1000000;
    return `${terbilang(Math.floor(num / 1000000))} Juta${sisa > 0 ? " " + terbilang(sisa) : ""}`;
  }
  if (num < 1000000000000) {
    const sisa = num % 1000000000;
    return `${terbilang(Math.floor(num / 1000000000))} Miliar${sisa > 0 ? " " + terbilang(sisa) : ""}`;
  }
  const sisa = num % 1000000000000;
  return `${terbilang(Math.floor(num / 1000000000000))} Triliun${sisa > 0 ? " " + terbilang(sisa) : ""}`;
}

const MONTH_NAMES_INDO = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const ROMAN_MONTHS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

export function formatDateIndoLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const day = d.getUTCDate();
  const month = MONTH_NAMES_INDO[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generates initial invoice letter data based on period information.
 */
export function createDefaultInvoiceData(params: {
  periodTitle?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  totalAmount?: number;
}): InvoiceData {
  const now = new Date();
  const romanMonth = ROMAN_MONTHS[now.getUTCMonth()];
  const currentYear = now.getUTCFullYear();
  const defaultLetterNumber = `005/ALZ/${romanMonth}/${currentYear}`;

  const formattedLetterDate = formatDateIndoLong(now);

  const startFormatted = params.startDate
    ? formatDateIndoLong(params.startDate)
    : "25 April 2026";
  const endFormatted = params.endDate
    ? formatDateIndoLong(params.endDate)
    : "24 Mei 2026";

  const amount = params.totalAmount !== undefined && params.totalAmount > 0
    ? params.totalAmount
    : 15000000;

  return {
    // Kop Surat
    companyName: "CV. ALIZA",
    companyAddress: "Jl. Barunagri Rt 01/03 Desa Sukajaya Kab. Bandung Barat",
    companyContact: "Telp./Fax.(085) 624705260, Email: alizaflorist@gmail.com",
    companyLogoUrl: "/assets/logo.jpeg",

    // Metadata Surat
    letterNumber: defaultLetterNumber,
    letterDate: formattedLetterDate,
    subject: "Penagihan",
    attachment: "-",

    // Penerima Surat
    recipientSalutation: "Yth.",
    recipientTitle: "General Manager",
    recipientCompany: "Patra Cirebon",
    recipientAddress: "Jl. Tuparev No. 11 Kedawung",
    recipientCity: "Cirebon",

    // Isi Surat
    greeting: "Dengan Hormat,",
    serviceDescription:
      "Perawatan Taman, Rental Tanaman, dan Bunga Rangkai",
    periodStart: startFormatted,
    periodEnd: endFormatted,
    totalAmount: amount,
    terbilangAmount: `${terbilang(amount)} Rupiah`,

    // Rekening Pembayaran
    paymentInstructions:
      "Untuk pembayarannya mohon di transfer melalui rekening :",
    bankAccountName: "Aji Kurniaji",
    bankAccountNumber: "1320025326860",
    bankName: "Mandiri",

    // Penutup & Tanda Tangan
    closingText:
      "Demikian surat penagihan ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terimakasih.",
    signatureSalutation: "Hormat kami,",
    signerName: "Aji Kurniaji",
    signerTitle: "Direktur",
  };
}
