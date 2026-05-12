import { useEffect } from 'react';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { providerCatalog } from '../services/providerCatalog.js';
import { useProviderStore } from '../store/providerStore.js';

export function ProviderPanel() {
  const connection = useConnectionStore();
  const workspace = useWorkspaceStore();
  const provider = useProviderStore();
  const ready = connection.status === 'connected' && workspace.status === 'ready' && Boolean(workspace.path);
  const busy = provider.status === 'loading-models' || provider.status === 'saving';

  useEffect(() => {
    if (workspace.status === 'ready') {
      provider.hydrateFromConfig(workspace.config);
    }
  }, [workspace.status, workspace.config]);

  const save = async () => {
    const nextConfig = await provider.save({ baseUrl: connection.baseUrl, token: connection.token }, workspace.path, workspace.config);
    if (nextConfig) {
      useWorkspaceStore.setState({ config: nextConfig });
    }
  };

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">Etapa 3</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Configurar provedor LLM</h2>
        <p className="mt-2 text-sm text-zinc-400">Selecione um provedor, carregue modelos e salve a escolha no workspace.</p>
      </div>

      <fieldset className="space-y-4 disabled:opacity-50" disabled={!ready || busy}>
        <label className="block text-sm font-medium text-zinc-200">
          Provedor
          <select
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-fuchsia-300"
            value={provider.providerId}
            onChange={(event) => provider.setProviderId(event.target.value as typeof provider.providerId)}
          >
            {providerCatalog.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-zinc-200">
          API key
          <input
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-fuchsia-300"
            type="password"
            value={provider.apiKey}
            onChange={(event) => provider.setApiKey(event.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-zinc-200">
          Base URL
          <input
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-fuchsia-300"
            value={provider.baseUrl}
            onChange={(event) => provider.setBaseUrl(event.target.value)}
          />
        </label>
        <button
          className="w-full rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-100 transition hover:border-fuchsia-300 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!provider.apiKey || provider.status === 'loading-models'}
          onClick={() => void provider.loadModels()}
          type="button"
        >
          {provider.status === 'loading-models' ? 'Carregando modelos...' : 'Listar modelos'}
        </button>
        <label className="block text-sm font-medium text-zinc-200">
          Modelo ativo
          <select
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-fuchsia-300"
            value={provider.selectedModel}
            onChange={(event) => provider.setSelectedModel(event.target.value)}
          >
            <option value="">Selecione um modelo</option>
            {provider.models.map((model) => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        </label>
        <button
          className="w-full rounded-xl bg-fuchsia-300 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!provider.selectedModel || provider.status === 'saving'}
          onClick={() => void save()}
          type="button"
        >
          {provider.status === 'saving' ? 'Salvando...' : 'Salvar provider'}
        </button>
      </fieldset>

      {!ready && <p className="mt-4 text-sm text-zinc-500">Conecte ao serviço e inicialize um workspace para configurar provedores.</p>}
      {provider.status === 'saved' && (
        <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Provider salvo no workspace.
        </p>
      )}
      {provider.status === 'error' && provider.error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{provider.error}</p>
      )}
    </section>
  );
}
