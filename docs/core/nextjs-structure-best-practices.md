# Next.js Project Structure & Architecture Guide — B-Tracker

Dokumen ini mendefinisikan struktur folder, pemisahan tanggung jawab, dan aturan arsitektur untuk project **B-Tracker (Bouquet Tracker & Field Operations)**.

Tujuan panduan ini:
- Mengisolasi business logic buket, checklist tugas harian, dan export PDF dari lapisan UI.
- Mencegah *God Component* pada halaman submission kamera dan galeri owner.
- Memastikan aturan keamanan terpenuhi: **tidak ada form registrasi publik**, autentikasi berbasis peran (*role-based*), serta kompresi gambar wajib di sisi klien (*client-side*).

---

## 1. Technology Stack

- **Framework:** Next.js (App Router, Server Actions, React Server Components)
- **Language:** TypeScript (Strict Mode)
- **Styling & UI:** Tailwind CSS + Radix UI / Lucide React
- **Database & Auth:** Supabase (PostgreSQL + Supabase Auth)
- **Storage:** Supabase Storage (Bucket: `bouquet-photos`)
- **PDF Engine:** `@react-pdf/renderer` (Server-side stream)
- **Image Handling:** `browser-image-compression` / Canvas Native API
- **Validation:** Zod

---

## 2. Recommended Project Structure

```text
b-tracker/
│
├── docs/                        # Single Source of Truth (PRD, Core, Contracts)
│   ├── README.md
│   └── core/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (employee)/          # Area Karyawan (Mobile-First View)
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx     # Checklist tugas hari ini
│   │   │   ├── submit/
│   │   │   │   └── page.tsx     # Form lapor buket (kamera + kompresi)
│   │   │   ├── history/
│   │   │   │   └── page.tsx     # Riwayat kirim pribadi
│   │   │   └── layout.tsx       # Bottom navigation bar mobile
│   │   │
│   │   ├── (owner)/             # Area Owner (Desktop/Tablet View)
│   │   │   ├── bouquets/
│   │   │   │   └── page.tsx     # Galeri buket, filter bulan, trigger PDF & purge
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx     # Kelola penugasan harian karyawan
│   │   │   ├── employees/
│   │   │   │   └── page.tsx     # Manual user provisioning (tambah akun staf)
│   │   │   └── layout.tsx       # Desktop sidebar & top navigation
│   │   │
│   │   ├── api/
│   │   │   └── reports/
│   │   │       └── bouquet-pdf/
│   │   │           └── route.ts # Endpoint streaming PDF (3 foto per lembar A4)
│   │   │
│   │   ├── layout.tsx           # Root layout & toast provider
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                  # Primitif UI (Button, Dialog, Input, Select, Badge)
│   │   ├── layout/              # Mobile bottom-nav, Owner sidebar, Page header
│   │   └── shared/              # Empty state, Photo modal, Confirm delete modal
│   │
│   ├── features/
│   │   ├── auth/                # Login & session check
│   │   ├── bouquets/            # Input form, compress image, gallery, bulk delete
│   │   ├── tasks/               # Daily checklist, assign task
│   │   ├── employees/           # Registrasi karyawan via panel owner
│   │   └── reports/             # React-PDF document template & generator logic
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # Supabase browser client
│   │   │   ├── server.ts        # Supabase server client (Server Actions / RSC)
│   │   │   └── admin.ts         # Supabase service role (bypass RLS untuk owner ops)
│   │   ├── image/
│   │   │   └── compress.ts      # Utility kompresi canvas sisi klien (max 1280px, WebP)
│   │   ├── constants.ts         # Limit ukuran upload, batas storage, ukuran kertas PDF
│   │   └── utils.ts             # Currency/format date generic (date-fns wrapper)
│   │
│   ├── hooks/
│   │   ├── use-camera.ts        # Hook pembantu akses kamera/file input
│   │   └── use-mobile.ts        # Deteksi viewport mobile
│   │
│   └── types/
│       ├── database.ts          # Hasil generate Supabase types
│       └── common.ts            # Common API & Action response types
│
├── public/
│   ├── icons/
│   └── images/
│
├── .env.example
├── .env.local
├── middleware.ts                # Route guards berbasis cookie/role (Owner vs Employee)
├── next.config.ts
├── package.json
└── tsconfig.json