import type { ChatMessage } from '../../chat/types/chat.js';
import type { SessionRecord, SessionSummary } from '../../sessions/types/session.js';
import type { DiscoveredPlugin, PluginHookName } from '../types/plugin.js';

export interface MessageBeforeInput { content: string; metadata?: Record<string, unknown> }
export interface MessageBeforeResult { content: string; metadata?: Record<string, unknown>; cancelled?: boolean; error?: string }
export interface MessageAfterInput { userMessage: ChatMessage; assistantMessage?: ChatMessage; messages: ChatMessage[] }
export interface SessionCloseInput { session: SessionRecord }
export interface SessionCloseResult { summary?: SessionSummary }

export interface PluginRegistry {
  hooks: Array<{ pluginName: string; hook: PluginHookName }>;
  register: (plugin: DiscoveredPlugin) => void;
  listHooks: (hook: PluginHookName) => Array<{ pluginName: string; hook: PluginHookName }>;
  runMessageBefore: (input: MessageBeforeInput) => Promise<MessageBeforeResult>;
  runMessageAfter: (input: MessageAfterInput) => Promise<void>;
  runSessionClose: (input: SessionCloseInput) => Promise<SessionCloseResult>;
}

function createRegistry(): PluginRegistry {
  return {
    hooks: [],
    register(plugin) { for (const hook of plugin.manifest.hooks) this.hooks.push({ pluginName: plugin.name, hook }); },
    listHooks(hook) { return this.hooks.filter((entry) => entry.hook === hook); },
    async runMessageBefore(input) { return input; },
    async runMessageAfter() {},
    async runSessionClose() { return {}; },
  };
}

let registry = createRegistry();
export function getPluginRegistry(): PluginRegistry { return registry; }
export function setPluginRegistry(next: PluginRegistry): void { registry = next; }
export function resetPluginRegistry(): void { registry = createRegistry(); }
