import { useState } from 'react';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { useTerminalStore } from '../store/terminalStore.js';

export function TerminalPanel() {
  const { baseUrl, token } = useConnectionStore();
  const cwd = useWorkspaceStore((state) => state.path);
  const { history, output, status, error, run } = useTerminalStore();
  const [command, setCommand] = useState('npm test --workspace=app');

  return (
    <section className="space-y-3" aria-label="Terminal integrado">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Terminal</h2>
        <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{status}</span>
      </div>
      <div className="flex gap-2">
        <input aria-label="Comando" className="min-w-0 flex-1 rounded-full border border-zinc-800 bg-black/50 px-4 py-2 text-sm text-zinc-100" onChange={(event) => setCommand(event.target.value)} value={command} />
        <button className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50" disabled={!cwd || status === 'running'} onClick={() => void run(baseUrl, token, cwd, command)} type="button">
          Executar
        </button>
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <pre className="min-h-32 overflow-auto rounded-2xl border border-zinc-800 bg-black p-3 text-xs text-emerald-100">{output || 'Saída aparecerá aqui.'}</pre>
      <p className="text-xs text-zinc-500">{history.length} comando(s) executado(s)</p>
    </section>
  );
}
