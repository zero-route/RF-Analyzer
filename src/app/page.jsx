export default function Page() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-3 px-6">
      <h1 className="text-3xl font-semibold tracking-tight">RF-Analyzer</h1>
      <p className="max-w-prose text-muted">
        Fondasi proyek sudah berjalan. Komponen kalkulator akan dirakit di halaman ini.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <span className="num rounded-md bg-accent px-3 py-1.5 text-sm text-on-accent">20.0 dBm</span>
        <span className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-muted">
          Uji token warna
        </span>
      </div>
    </main>
  );
}
