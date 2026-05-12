import { FormEvent, useState } from 'react';
import { AgentSwitcher } from '../../agents/components/AgentSwitcher.js';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { useChatStore } from '../store/chatStore.js';

export function ChatPanel() {
  const connection = useConnectionStore();
  const workspace = useWorkspaceStore();
  const chat = useChatStore();
  const [draft, setDraft] = useState('');
  const ready = connection.status === 'connected' && workspace.status === 'ready' && Boolean(workspace.config?.provider);
  const disabled = !ready || chat.status === 'streaming';

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) return;
    const content = draft;
    setDraft('');
    void chat.sendMessage(content, workspace.config);
  };

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Etapa 4</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Chat com agentes primários</h2>
          <p className="mt-2 text-sm text-zinc-400">Use Build para executar e Plan para planejar com permissões em modo ask.</p>
        </div>
        <AgentSwitcher activeAgent={chat.activeAgent} onChange={chat.setActiveAgent} />
      </div>

      <div className="min-h-48 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        {chat.messages.length === 0 && <p className="text-sm text-zinc-500">Nenhuma mensagem ainda.</p>}
        {chat.messages.map((message) => (
          <article className="rounded-2xl bg-zinc-950 p-4" key={message.id}>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{message.role === 'user' ? 'Você' : message.agentId ?? 'assistant'}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-100">{message.content || (chat.status === 'streaming' ? 'Digitando...' : '')}</p>
          </article>
        ))}
      </div>

      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
        <input
          className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-300 disabled:opacity-50"
          disabled={disabled}
          placeholder="Peça uma alteração ou plano..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          className="rounded-xl bg-orange-300 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled || !draft.trim()}
          type="submit"
        >
          {chat.status === 'streaming' ? 'Enviando...' : 'Enviar'}
        </button>
      </form>

      {!ready && <p className="mt-4 text-sm text-zinc-500">Conecte, inicialize o workspace e salve um provider para habilitar o chat.</p>}
      {chat.status === 'error' && chat.error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{chat.error}</p>
      )}
    </section>
  );
}
