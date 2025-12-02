import type { ReactNode } from 'react';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-[220px,1fr]">
      <aside className="hidden h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300 md:flex">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            PetMark
          </div>
          <div className="mt-1 text-sm font-medium text-slate-100">
            Inventory Console
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 text-xs">
          <a
            href="/dashboard"
            className="rounded-lg px-3 py-2 font-medium text-slate-200 hover:bg-slate-800/80"
          >
            Dashboard
          </a>
          <a
            href="/stores"
            className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800/80"
          >
            Negozi
          </a>
          <a
            href="/inventory"
            className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800/80"
          >
            Scadenziario
          </a>
        </nav>

        <div className="mt-4 border-t border-slate-800 pt-3 text-[11px] text-slate-500">
          Accesso interno · Admin
        </div>
      </aside>

      <section className="space-y-4">{children}</section>
    </div>
  );
}

