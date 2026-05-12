import { create } from 'zustand';
import type { PrimaryAgentId } from '../../agents/types/agent.js';
import type { ChatMessage } from '../../chat/types/chat.js';
import type { ServiceConnection } from '../../connection/types/service.js';
import { getPluginRegistry } from '../../plugins/services/pluginRegistry.js';
import { createSessionId } from '../services/sessionId.js';
import { createFallbackSessionSummary } from '../services/sessionAgents.js';
import { readSession, readSessionIndex, saveSession, saveSessionIndex } from '../services/sessionStorage.js';
import type { SessionIndexEntry, SessionRecord } from '../types/session.js';

type SessionStoreStatus = 'idle' | 'loading' | 'saving' | 'closing' | 'error';

interface SessionState {
  activeSession: SessionRecord | null;
  sessions: SessionIndexEntry[];
  status: SessionStoreStatus;
  error: string | null;
  createSession: (workspacePath: string, activeAgent?: PrimaryAgentId) => SessionRecord;
  ensureActiveSession: (workspacePath: string, activeAgent?: PrimaryAgentId) => SessionRecord;
  saveActiveSession: (connection: ServiceConnection, workspacePath: string, messages: ChatMessage[], activeAgent: PrimaryAgentId) => Promise<void>;
  loadIndex: (connection: ServiceConnection, workspacePath: string) => Promise<void>;
  resumeSession: (connection: ServiceConnection, workspacePath: string, sessionId: string) => Promise<SessionRecord | null>;
  closeActiveSession: (connection: ServiceConnection, workspacePath: string, messages: ChatMessage[], activeAgent: PrimaryAgentId) => Promise<void>;
}

function toIndexEntry(session: SessionRecord): SessionIndexEntry {
  return { id: session.id, title: session.summary?.title, status: session.status, createdAt: session.createdAt, updatedAt: session.updatedAt, closedAt: session.closedAt };
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSession: null,
  sessions: [],
  status: 'idle',
  error: null,
  createSession(workspacePath, activeAgent = 'build') {
    const now = new Date().toISOString();
    const session: SessionRecord = { id: createSessionId(), workspacePath, messages: [], activeAgent, status: 'active', createdAt: now, updatedAt: now };
    set({ activeSession: session, error: null });
    return session;
  },
  ensureActiveSession(workspacePath, activeAgent = 'build') {
    return get().activeSession ?? get().createSession(workspacePath, activeAgent);
  },
  async saveActiveSession(connection, workspacePath, messages, activeAgent) {
    const current = get().ensureActiveSession(workspacePath, activeAgent);
    const session: SessionRecord = { ...current, messages, activeAgent, updatedAt: new Date().toISOString() };
    set({ status: 'saving', error: null, activeSession: session });
    try {
      await saveSession(connection, workspacePath, session);
      const entries = [toIndexEntry(session), ...get().sessions.filter((entry) => entry.id !== session.id)];
      await saveSessionIndex(connection, workspacePath, entries);
      set({ sessions: entries, status: 'idle' });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },
  async loadIndex(connection, workspacePath) {
    set({ status: 'loading', error: null });
    try {
      set({ sessions: await readSessionIndex(connection, workspacePath), status: 'idle' });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },
  async resumeSession(connection, workspacePath, sessionId) {
    set({ status: 'loading', error: null });
    try {
      const session = await readSession(connection, workspacePath, sessionId);
      set({ activeSession: session, status: 'idle' });
      return session;
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  },
  async closeActiveSession(connection, workspacePath, messages, activeAgent) {
    const current = get().activeSession;
    if (!current) return;
    const now = new Date().toISOString();
    let session: SessionRecord = { ...current, messages, activeAgent, status: 'closed', updatedAt: now, closedAt: now, summary: createFallbackSessionSummary(messages) };
    set({ status: 'closing', error: null, activeSession: session });
    try {
      const pluginResult = await getPluginRegistry().runSessionClose({ session });
      if (pluginResult.summary) session = { ...session, summary: pluginResult.summary };
      set({ activeSession: session });
      await saveSession(connection, workspacePath, session);
      const entries = [toIndexEntry(session), ...get().sessions.filter((entry) => entry.id !== session.id)];
      await saveSessionIndex(connection, workspacePath, entries);
      set({ sessions: entries, status: 'idle' });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },
}));
