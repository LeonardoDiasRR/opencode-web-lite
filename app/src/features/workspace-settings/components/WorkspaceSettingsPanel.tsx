import { useState } from 'react';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';

export function WorkspaceSettingsPanel() {
  const { path, status, config } = useWorkspaceStore();
  const [draft, setDraft] = useState(JSON.stringify(config ?? { version: '1' }, null, 2));
  const [message, setMessage] = useState('');

  function validate() {
    try {
      JSON.parse(draft) as unknown;
      setMessage('Configuração JSON válida.');
    } catch {
      setMessage('JSON inválido.');
    }
  }

  return (
    <section className="space-y-3 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6" aria-label="Configurações do workspace">
      <h2 className="text-xl font-semibold text-white">Configurações</h2>
      <p className="text-sm text-zinc-400">Path: {path || 'não selecionado'}</p>
      <p className="text-sm text-zinc-400">Status: {status}</p>
      <p className="text-sm text-zinc-400">AGENTS.md: {path ? 'esperado na raiz do workspace' : 'aguardando workspace'}</p>
      <textarea aria-label="Preview opencode.json" className="h-40 w-full rounded-2xl border border-zinc-800 bg-black/50 p-3 font-mono text-sm text-zinc-100" onChange={(event) => setDraft(event.target.value)} value={draft} />
      <button className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-zinc-950" onClick={validate} type="button">
        Validar JSON
      </button>
      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
    </section>
  );
}
