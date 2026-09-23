# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Owner / Florist Administrator**:
   - Memantau operasional lapangan pemasangan buket secara real-time.
   - Mengelola kartu periode buket, inspeksi visual galeri buket, dan memantau total tangkai bunga yang terpasang.
   - Mengunduh laporan bulanan PDF konsolidasi (A4 portrait, 3 kartu per halaman) untuk arsip dan klien.
   - Mengelola tagihan (Invoice) terintegrasi template CV. Aliza dengan perhitungan subtotal otomatis berdasarkan tier paket (Reguler, VIP, Medium) dan teks terbilang rupiah Indonesia.
   - Mengatur konservasi kuota penyimpanan cloud (Supabase Storage) melalui fitur *Purge Storage* bulanan/periode yang aman.
   - Manajemen staf/karyawan dan penugasan kerja.

2. **Karyawan / Staf Florist Lapangan**:
   - Beroperasi di lokasi pemasangan (venue, hotel, ballroom, acara) menggunakan perangkat seluler (PWA / mobile web).
   - Mengambil foto bukti pemasangan secara langsung melalui kamera smartphone dengan kompresi otomatis client-side ke format WebP (~250KB, resolusi maks 1280px).
   - Memilih jenis paket buket (Reguler, VIP, Medium) tanpa menampilkan nominal harga di layar input karyawan.
   - Mengisi jumlah tangkai bunga, lokasi/venue, dan tanggal pemasangan.
   - Melacak riwayat pemasangan pribadi dan daftar checklist tugas.

## Product Purpose

B-Tracker hadir untuk mentransformasi pencatatan manual dan penyebaran foto buket di grup chat menjadi sistem dokumentasi terstruktur, efisien kuota, dan siap tagih. Keberhasilan produk diukur dari:
- Kecepatan staf lapangan mengunggah bukti pemasangan tanpa kendala kuota atau koneksi lambat (berkat kompresi otomatis WebP).
- Transparansi dan akurasi data pemasangan antara staf, owner, dan klien.
- Kemudahan pembuatan laporan PDF dan faktur tagihan resmi CV. Aliza tanpa input ulang manual.

## Positioning

Satu-satunya sistem manajemen operasional florist lapangan yang mengawinkan kompresi foto otomatis cerdas di sisi browser dengan kartu periode buket, generator invoice CV. Aliza terbilang otomatis, dan siklus hidup pembersihan storage (purge) terencana.

## Operating Context

- **Lingkungan Lapangan**: Staf bekerja di lapangan yang seringkali berpindah-pindah, membutuhkan antarmuka mobile-first yang cepat dibuka, tombol aksi yang mudah disentuh dengan satu tangan, dan feedback visual yang jelas.
- **Lingkungan Manajerial**: Owner mengakses dari dashboard desktop maupun tablet untuk mereview galeri foto buket, memeriksa jumlah total bunga, mengekspor laporan PDF, dan menerbitkan surat tagihan resmi.
- **Dokumen Resmi**: Faktur CV. Aliza dan Laporan Dokumentasi Lapangan B-Tracker berstandar format cetak dokumen A4.

## Capabilities and Constraints

- **Paket Buket**:
  - `REGULER`: Rp 10.000 / unit.
  - `VIP`: Rp 15.000 / unit.
  - `MEDIUM_PHOTO_TAKING`: Rp 150.000 / unit.
  - Aturan: Pada antarmuka karyawan harga disembunyikan; pada level sistem dan invoice owner harga dihitung otomatis.
- **Penyimpanan Gambar**:
  - Dukungan Supabase Storage dengan fallback lokal disk.
  - Fitur Purge Storage menghapus file fisik di storage untuk menghemat kuota namun tetap mempertahankan metadata entri di database (ditandai `isArchived`).
- **Autentikasi & Otorisasi**:
  - Better-Auth dengan role-based access control (`OWNER` / `admin` dan `EMPLOYEE`).
- **Ekspor Dokumen**:
  - React-PDF untuk render server-side PDF laporan dan invoice.
  - Sharp image conversion (WebP/PNG ke JPEG Data URI) untuk kompatibilitas mesin render PDF.

## Brand Commitments

- **Nama**: B-Tracker (Buket Tracker / CV. ALIZA).
- **Nuansa & Bahasa**: Bahasa Indonesia profesional, ringkas, dan jelas.
- **Aksen Visual**: Warna mawar/rose (`rose-600` / `pink-500`) yang anggun dipadukan dengan tipografi bersih, layout kartu berbingkai rapi, dan badge status visual yang informatif.

## Evidence on Hand

- Skema basis data Prisma di `prisma/schema.prisma` (`BouquetPost`, `BouquetPeriod`, `Task`, `User`).
- Halaman galeri owner di `app/owner/bouquets/` dan detail periode di `[periodId]`.
- Form unggah buket mobile di `components/bouquet-submit-form.tsx`.
- Modul invoice CV. Aliza di `components/invoice/`.
- Generator PDF di `components/reports/bouquet-pdf-document.tsx` dan `app/api/reports/bouquet-pdf/`.

## Product Principles

1. **Efisiensi Lapangan Tanpa Kompromi**: Pengunggahan foto harus secepat mungkin tanpa membebani kuota data staf lapangan maupun server storage.
2. **Kerapian & Keterbacaan Visual**: Galeri foto dan laporan harus tersusun simetris, teratur per periode, dan mudah diaudit oleh owner.
3. **Integritas Penagihan**: Setiap foto pemasangan yang tercatat harus dapat ditelusuri kuantitas bunga, jenis paket, dan staf penanggung jawabnya saat dicetak ke invoice.
4. **Pemisahan Peran Tegas**: Staf fokus pada dokumentasi bukti kerja; owner memegang kontrol penuh atas harga, tagihan, arsip, dan penghapusan storage.

## Accessibility & Inclusion

- Antarmuka responsif mobile-friendly dengan target sentuh tombol minimal 44x44px.
- Kontras teks tinggi pada latar belakang kartu putih.
- Informasi visual (seperti jenis buket dan status) selalu didukung oleh label teks eksplisit di samping warna dan ikon.
