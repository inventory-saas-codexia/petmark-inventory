export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-10 py-16">
      <div className="max-w-2xl text-center">
        <span className="inline-flex items-center rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
          Pilot interno · PetMark
        </span>
        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
          Controllo scadenze e stock per <span className="text-brand-400">108
          negozi</span>, in un&apos;unica dashboard.
        </h1>
        <p className="mt-4 text-sm text-slate-400 sm:text-base">
          Niente più prodotti scaduti sugli scaffali, niente più fogli Excel
          infiniti. Scopri lo scadenziario centralizzato pensato solo per i
          pet store.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-600/40 transition hover:bg-brand-500"
          >
            Entra nell&apos;app
          </a>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:border-slate-500 hover:bg-slate-900"
          >
            Guarda la demo
          </a>
        </div>
      </div>
    </section>
  );
}
