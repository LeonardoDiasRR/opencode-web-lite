import { useState } from 'react';
import { useChatStore } from '../../chat/store/chatStore.js';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { useSessionStore } from '../store/sessionStore.js';

export function SessionPanel() {
  const connection = useConnectionStore();
  const workspace = useWorkspaceStore();
  const chat = useChatStore();
  const sessions = useSessionStore();
  const [resumeId, setResumeId] = useState('');
  const ready = connection.status === 'connected' && workspace.status === 'ready' && Boolean(workspace.path);
  const busy = sessions.status === 'loading' || sessions.status === 'saving' || sessions.status === 'closing';

  const serviceConnection = { baseUrl: connection.baseUrl, token: connection.token };
  const resume = async (sessionId: string) => {
    const session = await sessions.resumeSession(serviceConnection, workspace.path, sessionId);
    if (session) chat.restore(session.messages, session.activeAgent);
  };

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Etapa 5</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Gerenciar sessões</h2>
        <p className="mt-2 text-sm text-zinc-400">Crie, encerre e retome conversas salvas no workspace.</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm">
        {sessions.activeSession ? (
          <div>
            <p className="font-semibold text-white">{sessions.activeSession.summary?.title ?? 'Sessão sem título'}</p>
            <p className="mt-1 text-zinc-400">ID: {sessions.activeSession.id}</p>
            {sessions.activeSession.summary?.summary && <p className="mt-2 text-zinc-300">{sessions.activeSession.summary.summary}</p>}
          </div>
        ) : (
          <p className="text-zinc-500">Nenhuma sessão ativa.</p>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          className="rounded-xl bg-amber-300 px-4 py-3 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!ready || busy}
          onClick={() => sessions.createSession(workspace.path, chat.activeAgent)}
          type="button"
        >
          Nova sessão
        </button>
        <button
          className="rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!ready || busy || !sessions.activeSession}
          onClick={() => void sessions.closeActiveSession(serviceConnection, workspace.path, chat.messages, chat.activeAgent)}
          type="button"
        >
          {sessions.status === 'closing' ? 'Encerrando...' : 'Encerrar sessão'}
        </button>
      </div>

      <div className="mt-5">
        <h3 className="font-semibold text-white">Sessões anteriores</h3>
        <div className="mt-3 space-y-2">
          {sessions.sessions.length === 0 && <p className="text-sm text-zinc-500">Nenhuma sessão salva ainda.</p>}
          {sessions.sessions.map((session) => (
            <button
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left text-sm text-zinc-100 hover:border-amber-300"
              disabled={!ready || busy}
              key={session.id}
              onClick={() => void resume(session.id)}
              type="button"
            >
              <span className="block font-semibold">{session.title ?? session.id}</span>
              <span className="text-zinc-500">{session.id}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label className="min-w-0 flex-1 text-sm font-medium text-zinc-200">
          ID da sessão
          <input
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-amber-300 disabled:opacity-50"
            disabled={!ready || busy}
            value={resumeId}
            onChange={(event) => setResumeId(event.target.value)}
          />
        </label>
        <button
          className="self-end rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!ready || busy || !resumeId}
          onClick={() => void resume(resumeId)}
          type="button"
        >
          Retomar por ID
        </button>
      </div>

      {!ready && <p className="mt-4 text-sm text-zinc-500">Conecte ao serviço e inicialize um workspace para gerenciar sessões.</p>}
      {sessions.status === 'error' && sessions.error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{sessions.error}</p>
      )}
    </section>
  );
}
