import { create } from 'zustand';
import type { ServiceConnection } from '../../connection/types/service.js';
import type { ProviderSelection } from '../../providers/types/provider.js';
import type { ChatMessage } from '../../chat/types/chat.js';
import { compactMessages } from '../services/compactionAgent.js';
import { saveCompaction } from '../services/compactionStorage.js';
import type { CompactionStatus, CompactionSummary } from '../types/compaction.js';

interface CompactionState { summary: CompactionSummary | null; status: CompactionStatus; error: string | null; compact: (connection: ServiceConnection, workspacePath: string, provider: ProviderSelection | undefined, messages: ChatMessage[]) => Promise<void> }
export const useCompactionStore = create<CompactionState>((set, get) => ({ summary: null, status: 'idle', error: null, async compact(connection, workspacePath, provider, messages) { set({ status: 'compacting', error: null }); try { const snapshot = await compactMessages(provider, messages, 6, get().summary?.summary); const summary = { summary: snapshot.summary, createdAt: snapshot.createdAt, messageCount: messages.length }; await saveCompaction(connection, workspacePath, summary); set({ summary, status: 'idle' }); } catch (error) { set({ status: 'error', error: error instanceof Error ? error.message : String(error) }); } } }));
