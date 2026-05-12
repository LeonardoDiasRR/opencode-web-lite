import { useApprovalStore } from '../store/approvalStore.js';

export function ApprovalPanel() {
  const { events, approve, deny } = useApprovalStore();
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Runtime</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Aprovações de ferramentas</h2>
        <p className="mt-2 text-sm text-zinc-400">Chamadas `ask` ficam pendentes e chamadas `deny` não podem ser executadas.</p>
      </div>
      {events.length === 0 && <p className="text-sm text-zinc-500">Nenhuma chamada de ferramenta registrada.</p>}
      <div className="grid gap-3">
        {events.map((event) => (
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm" key={event.call.id}>
            <div className="flex items-center justify-between gap-3">
              <strong className="text-zinc-100">{event.call.name}</strong>
              <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-300">{event.result?.status ?? event.call.status}</span>
            </div>
            <pre className="mt-3 max-h-32 overflow-auto rounded-xl bg-black/30 p-3 text-xs text-zinc-300">{JSON.stringify(event.call.arguments, null, 2)}</pre>
            {event.result && <p className="mt-3 whitespace-pre-wrap text-zinc-300">{event.result.error ?? event.result.preview}</p>}
            {event.call.permission === 'ask' && !event.result && (
              <div className="mt-3 flex gap-2">
                <button className="rounded-xl border border-emerald-400/40 px-3 py-2 text-emerald-200" onClick={() => approve(event.call.id)} type="button">Aprovar</button>
                <button className="rounded-xl border border-red-400/40 px-3 py-2 text-red-200" onClick={() => deny(event.call.id)} type="button">Negar</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
