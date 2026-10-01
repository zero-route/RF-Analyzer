import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-start justify-center gap-4 px-6">
      <p className="num text-sm text-faint">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Halaman tidak ditemukan</h1>
      <p className="text-muted">Alamat yang kamu buka tidak ada atau sudah dipindahkan.</p>
      <Link
        href="/"
        className="inline-flex h-10 items-center rounded-md bg-accent px-4 text-sm font-medium text-on-accent"
      >
        Kembali ke kalkulator
      </Link>
    </main>
  );
}
