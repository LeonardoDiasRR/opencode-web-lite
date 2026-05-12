import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { usePluginStore } from '../store/pluginStore.js';

export function PluginPanel() {
  const connection = useConnectionStore();
  const workspace = useWorkspaceStore();
  const plugins = usePluginStore();
  const ready = connection.status === 'connected' && workspace.status === 'ready' && Boolean(workspace.path);
  const busy = plugins.status === 'discovering' || plugins.status === 'saving';
  const serviceConnection = { baseUrl: connection.baseUrl, token: connection.token };

  const toggle = async (name: string, enabled: boolean) => {
    const nextConfig = await plugins.setEnabled(serviceConnection, workspace.path, workspace.config, name, enabled);
    if (nextConfig) useWorkspaceStore.setState({ config: nextConfig });
  };

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Etapa 8</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Plugins</h2>
        <p className="mt-2 text-sm text-zinc-400">Descubra plugins do workspace, revise hooks e habilite ferramentas customizadas.</p>
      </div>

      <button className="w-full rounded-xl bg-sky-300 px-4 py-3 font-semibold text-zinc-950 disabled:opacity-50" disabled={!ready || busy} onClick={() => void plugins.discover(serviceConnection, workspace.path, workspace.config)} type="button">
        {plugins.status === 'discovering' ? 'Descobrindo plugins...' : 'Descobrir plugins'}
      </button>

      <div className="mt-4 space-y-3">
        {plugins.plugins.length === 0 && <p className="text-sm text-zinc-500">Nenhum plugin descoberto ainda.</p>}
        {plugins.plugins.map((plugin) => (
          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4" key={plugin.name}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-white">{plugin.name}</h3>
                <p className="text-sm text-zinc-400">{plugin.manifest.description ?? 'Sem descrição'} · {plugin.manifest.version ?? 'sem versão'}</p>
                <p className="mt-2 text-xs text-zinc-500">Hooks: {plugin.manifest.hooks.join(', ') || 'nenhum'}</p>
                <p className="text-xs text-zinc-500">Ferramentas: {plugin.manifest.tools.map((tool) => tool.name).join(', ') || 'nenhuma'}</p>
                {plugin.manifest.permissions.length > 0 && <p className="mt-2 text-xs text-amber-200">Requer permissões: {plugin.manifest.permissions.join(', ')}</p>}
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-200">
                <input checked={plugin.enabled} onChange={(event) => void toggle(plugin.name, event.target.checked)} type="checkbox" />
                Habilitar plugin
              </label>
            </div>
          </article>
        ))}
      </div>

      {!ready && <p className="mt-4 text-sm text-zinc-500">Conecte ao serviço e inicialize um workspace para descobrir plugins.</p>}
      {plugins.status === 'error' && plugins.error && <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{plugins.error}</p>}
    </section>
  );
}
