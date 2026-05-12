import { FormEvent, useState } from 'react';
import { useConnectionStore } from '../store/connectionStore.js';

export function ConnectionForm() {
  const { baseUrl, token, status, error, serviceVersion, connect } = useConnectionStore();
  const [draftBaseUrl, setDraftBaseUrl] = useState(baseUrl);
  const [draftToken, setDraftToken] = useState(token);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void connect(draftBaseUrl, draftToken);
  };

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Etapa 1</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Conectar ao serviço local</h2>
        <p className="mt-2 text-sm text-zinc-400">Informe a URL e o token exibido pelo serviço da Fase 1.</p>
      </div>

      <form className="space-y-4" onSubmit={submit}>
        <label className="block text-sm font-medium text-zinc-200">
          URL do serviço
          <input
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
            value={draftBaseUrl}
            onChange={(event) => setDraftBaseUrl(event.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-zinc-200">
          Token
          <input
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
            value={draftToken}
            onChange={(event) => setDraftToken(event.target.value)}
            type="password"
          />
        </label>
        <button
          className="w-full rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={status === 'connecting'}
          type="submit"
        >
          {status === 'connecting' ? 'Conectando...' : 'Conectar'}
        </button>
      </form>

      {status === 'connected' && (
        <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Serviço conectado. Versão {serviceVersion}.
        </p>
      )}
      {status === 'error' && error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
      )}
    </section>
  );
}
