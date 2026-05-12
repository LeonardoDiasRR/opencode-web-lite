import { useChatStore } from '../../chat/store/chatStore.js';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import type { ProviderSelection } from '../../providers/types/provider.js';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { useCompactionStore } from '../store/compactionStore.js';
import { needsCompaction } from '../types/compaction.js';

export function CompactionPanel() {
  const connection = useConnectionStore(); const workspace = useWorkspaceStore(); const chat = useChatStore(); const compaction = useCompactionStore();
  const ready = connection.status === 'connected' && workspace.status === 'ready' && Boolean(workspace.path);
  const provider = workspace.config?.provider as ProviderSelection | undefined;
  return <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30"><div className="mb-5"><p className="text-sm uppercase tracking-[0.3em] text-rose-300">Etapa 9</p><h2 className="mt-2 text-2xl font-semibold text-white">Compaction</h2><p className="mt-2 text-sm text-zinc-400">Compacte contexto longo em memória local do workspace.</p></div><p className="text-sm text-zinc-400">Mensagens atuais: {chat.messages.length}. {needsCompaction(chat.messages) ? 'Compactação recomendada.' : 'Contexto dentro do limite.'}</p>{compaction.summary && <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-200"><p>{compaction.summary.summary}</p><p className="mt-2 text-xs text-zinc-500">Última compactação: {compaction.summary.createdAt}</p></div>}<button className="mt-4 w-full rounded-xl bg-rose-300 px-4 py-3 font-semibold text-zinc-950 disabled:opacity-50" disabled={!ready || compaction.status === 'compacting'} onClick={() => void compaction.compact({ baseUrl: connection.baseUrl, token: connection.token }, workspace.path, provider, chat.messages)} type="button">{compaction.status === 'compacting' ? 'Compactando...' : 'Compactar manualmente'}</button>{!ready && <p className="mt-4 text-sm text-zinc-500">Conecte ao serviço e inicialize um workspace para compactar contexto.</p>}</section>;
}
