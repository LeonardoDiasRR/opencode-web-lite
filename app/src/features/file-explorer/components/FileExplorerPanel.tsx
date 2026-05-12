import { useEffect, useState } from 'react';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { createFileClient } from '../services/fileClient.js';
import { useFileExplorerStore } from '../store/fileExplorerStore.js';

export function FileExplorerPanel() {
  const { baseUrl, token } = useConnectionStore();
  const workspacePath = useWorkspaceStore((state) => state.path);
  const { entries, selectedPath, content, status, error, list, open, save } = useFileExplorerStore();
  const [draft, setDraft] = useState(content);

  useEffect(() => setDraft(content), [content]);

  useEffect(() => {
    if (workspacePath) void list(baseUrl, token, workspacePath);
  }, [baseUrl, list, token, workspacePath]);

  useEffect(() => {
    if (!workspacePath) return undefined;
    const watcher = createFileClient({ baseUrl, token }).watch(workspacePath, { onEvent: () => void list(baseUrl, token, workspacePath) });
    return () => watcher.close();
  }, [baseUrl, list, token, workspacePath]);

  if (!workspacePath) {
    return <section className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">Selecione um workspace para listar arquivos.</section>;
  }

  return (
    <section className="grid gap-4" aria-label="Explorador de arquivos">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Arquivos</h2>
        <button className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-zinc-950" onClick={() => void list(baseUrl, token, workspacePath)} type="button">
          Atualizar
        </button>
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="space-y-2 rounded-2xl border border-zinc-800 p-3">
          {entries.map((entry) => (
            <button className="block w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/10" disabled={entry.type === 'directory'} key={entry.path} onClick={() => void open(baseUrl, token, workspacePath, entry.path)} type="button">
              {entry.type === 'directory' ? '📁' : '📄'} {entry.name}
            </button>
          ))}
          {status === 'loading' ? <p className="text-sm text-zinc-500">Carregando...</p> : null}
        </div>
        <div className="space-y-3">
          <p className="truncate text-sm text-zinc-400">{selectedPath ?? 'Nenhum arquivo aberto'}</p>
          <textarea aria-label="Conteúdo do arquivo" className="h-72 w-full rounded-2xl border border-zinc-800 bg-black/50 p-3 font-mono text-sm text-zinc-100" onChange={(event) => setDraft(event.target.value)} value={draft} />
          <button className="rounded-full bg-violet-300 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50" disabled={!selectedPath || status === 'saving'} onClick={() => void save(baseUrl, token, workspacePath, draft)} type="button">
            Salvar arquivo
          </button>
        </div>
      </div>
    </section>
  );
}
