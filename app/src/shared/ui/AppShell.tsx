import type { ReactNode } from 'react';

interface AppShellProps {
  sidebar: ReactNode;
  main: ReactNode;
  inspector: ReactNode;
  terminal: ReactNode;
}

export function AppShell({ sidebar, main, inspector, terminal }: AppShellProps) {
  return (
    <div className="grid min-h-screen gap-4 bg-[radial-gradient(circle_at_top_left,#164e63,transparent_35%),radial-gradient(circle_at_bottom_right,#4c1d95,transparent_35%),#09090b] p-4 text-zinc-100 lg:grid-cols-[18rem_minmax(0,1fr)_22rem] lg:grid-rows-[minmax(0,1fr)_18rem]">
      <aside className="rounded-3xl border border-white/10 bg-zinc-950/80 p-4 lg:row-span-2" aria-label="Navegação e workspace">
        {sidebar}
      </aside>
      <main className="min-w-0 rounded-3xl border border-white/10 bg-zinc-950/70 p-4" aria-label="Área principal">
        {main}
      </main>
      <aside className="rounded-3xl border border-white/10 bg-zinc-950/80 p-4 lg:row-span-2" aria-label="Inspector">
        {inspector}
      </aside>
      <section className="rounded-3xl border border-white/10 bg-black/70 p-4 lg:col-start-2" aria-label="Terminal">
        {terminal}
      </section>
    </div>
  );
}
