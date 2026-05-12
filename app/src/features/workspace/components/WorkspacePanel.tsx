import { FormEvent, useState } from 'react';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { useWorkspaceStore } from '../store/workspaceStore.js';

export function WorkspacePanel() {
  const connection = useConnectionStore();
  const { path, status, config, error, checkStatus, initialize } = useWorkspaceStore();
  const [draftPath, setDraftPath] = useState(path);
  const connected = connection.status === 'connected';
  const busy = status === 'checking' || status === 'initializing';

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void checkStatus(connection.baseUrl, connection.token, draftPath);
  };

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Etapa 2</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Selecionar workspace</h2>
        <p className="mt-2 text-sm text-zinc-400">Informe o caminho local do projeto que será inicializado.</p>
      </div>

      <form className="space-y-4" onSubmit={submit}>
        <label className="block text-sm font-medium text-zinc-200">
          Caminho do workspace
          <input
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-violet-300 disabled:opacity-50"
            disabled={!connected}
            placeholder="C:\\Users\\voce\\projeto"
            value={draftPath}
            onChange={(event) => setDraftPath(event.target.value)}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            className="rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-100 transition hover:border-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!connected || busy || !draftPath}
            type="submit"
          >
            {status === 'checking' ? 'Verificando...' : 'Verificar'}
          </button>
          <button
            className="rounded-xl bg-violet-300 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!connected || busy || !draftPath}
            onClick={() => void initialize(connection.baseUrl, connection.token, draftPath)}
            type="button"
          >
            {status === 'initializing' ? 'Inicializando...' : 'Inicializar'}
          </button>
        </div>
      </form>

      {!connected && <p className="mt-4 text-sm text-zinc-500">Conecte ao serviço local para habilitar o workspace.</p>}
      {status === 'not-initialized' && (
        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Workspace ainda não inicializado.
        </p>
      )}
      {status === 'ready' && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <p>Workspace pronto.</p>
          <p className="mt-1 text-emerald-200/80">Configuração v{config?.version ?? 'desconhecida'} carregada.</p>
        </div>
      )}
      {status === 'error' && error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
      )}
    </section>
  );
}
