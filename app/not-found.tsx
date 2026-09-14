import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 mx-auto bg-rose-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🌸</span>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">404</h1>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-gray-500 mb-6">
          Halaman yang Anda tuju tidak tersedia atau akses pendaftaran mandiri dinonaktifkan.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          Kembali ke Halaman Login
        </Link>
      </div>
    </div>
  );
}
