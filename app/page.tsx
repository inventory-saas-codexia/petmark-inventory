export default function Home() {
  return (
    <section className="flex w-full flex-col items-center justify-center py-10 sm:py-16">
      <div className="grid w-full gap-8 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
        {/* Hero text */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
            <span>🧪 Pilot interno PetMark</span>
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            <span>Inventory & Scadenze</span>
          </div>

          <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
            Scadenziario lotti{' '}
            <span className="text-emerald-400">per 108 negozi</span>, in un’unica
            vista.
          </h1>

          <p className="max-w-xl text-sm text-slate-300 sm:text-[15px]">
            Niente più prodotti scaduti sugli scaffali, niente più file Excel
            manuali per ogni punto vendita. Inventory Cloud mette insieme
            lotti, scadenze e quantità per ogni negozio PetMark.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400"
            >
              Entra nell’app
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-900"
            >
              Guarda la demo scadenziario
            </a>
          </div>

          <div className="mt-4 grid max-w-md grid-cols-2 gap-3 text-xs text-slate-400">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-500">
                Rete negozi
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-50">108</div>
              <div className="text-[11px] text-slate-400">
                Punti vendita PetMark monitorati.
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-500">
                Prodotti
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-50">22.000+</div>
              <div className="text-[11px] text-slate-400">
                Lotti, alimenti dietetici, igiene, accessori.
              </div>
            </div>
          </div>
        </div>

        {/* Fake calendar / preview card */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-emerald-500/10 blur-3xl" />
          <div className="relative rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                🏪 <span className="font-medium text-slate-100">PetMark – HQ</span>
              </span>
              <span>Novembre 2025</span>
            </div>
            <div className="mt-4 space-y-2 text-[11px]">
              <div className="flex items-center justify-between rounded-xl bg-slate-950/80 px-3 py-2">
                <div>
                  <div className="text-slate-300">
                    Royal Canin Gastro 2kg · <span className="text-slate-400">MI-CENTRO</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Lotto RC-001 · qty 20
                  </div>
                </div>
                <div className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-300">
                  5 giorni
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-950/80 px-3 py-2">
                <div>
                  <div className="text-slate-300">
                    Friskies Umido 12x · <span className="text-slate-400">RM-EUR</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Lotto FR-100 · qty 30
                  </div>
                </div>
                <div className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                  Scaduto
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-950/80 px-3 py-2">
                <div>
                  <div className="text-slate-300">
                    Shampoo Naturale Aloe · <span className="text-slate-400">TO-NORD</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Lotto SH-050 · qty 15
                  </div>
                </div>
                <div className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  90+ giorni
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-[11px] text-slate-500">
              <span>Vista dimostrativa scadenziario.</span>
              <span>Accedi per dati reali →</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
