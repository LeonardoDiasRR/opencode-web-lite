import { create } from 'zustand';
import { getPrimaryAgent } from '../../agents/services/primaryAgents.js';
import type { PrimaryAgentId } from '../../agents/types/agent.js';
import type { ProviderSelection } from '../../providers/types/provider.js';
import { buildSkillPromptContext } from '../../skills/services/skillPromptContext.js';
import { useSkillStore } from '../../skills/store/skillStore.js';
import { parseSubagentMention } from '../../subagents/services/mentionParser.js';
import { buildSubagentPrompt } from '../../subagents/services/subagentPromptBuilder.js';
import type { WorkspaceConfig } from '../../workspace/types/workspace.js';
import { streamChatCompletion } from '../services/chatClient.js';
import { buildSystemPrompt } from '../services/promptBuilder.js';
import type { ChatMessage, ChatStatus } from '../types/chat.js';

interface ChatState {
  activeAgent: PrimaryAgentId;
  messages: ChatMessage[];
  status: ChatStatus;
  error: string | null;
  setActiveAgent: (agent: PrimaryAgentId) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => ChatMessage;
  appendAssistantDelta: (messageId: string, delta: string) => void;
  clear: () => void;
  restore: (messages: ChatMessage[], activeAgent?: PrimaryAgentId) => void;
  sendMessage: (content: string, config: WorkspaceConfig | null) => Promise<boolean>;
}

function createMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>): ChatMessage {
  return { ...message, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeAgent: 'build',
  messages: [],
  status: 'idle',
  error: null,
  setActiveAgent(activeAgent) {
    set({ activeAgent });
  },
  addMessage(message) {
    const next = createMessage(message);
    set({ messages: [...get().messages, next] });
    return next;
  },
  appendAssistantDelta(messageId, delta) {
    set({ messages: get().messages.map((message) => (message.id === messageId ? { ...message, content: message.content + delta } : message)) });
  },
  clear() {
    set({ messages: [], status: 'idle', error: null, activeAgent: 'build' });
  },
  restore(messages, activeAgent = 'build') {
    set({ messages, activeAgent, status: 'idle', error: null });
  },
  async sendMessage(content, config) {
    const provider = config?.provider as ProviderSelection | undefined;
    if (!provider?.apiKey || !provider.model || !provider.baseUrl) {
      set({ status: 'error', error: 'Configure um provider e modelo antes de enviar mensagens.' });
      return false;
    }

    const agent = getPrimaryAgent(get().activeAgent, config);
    const parsed = parseSubagentMention(content);
    const messageContent = parsed.content || content;
    const skillContext = buildSkillPromptContext(useSkillStore.getState().getPromptSkills(config));
    const basePrompt = parsed.subagent ? buildSubagentPrompt(parsed.subagent, agent) : buildSystemPrompt(agent);
    const systemPrompt = skillContext ? `${basePrompt}\n\n${skillContext}` : basePrompt;
    const previousMessages = get().messages;
    const metadata = parsed.subagent ? { subagentId: parsed.subagent.id } : undefined;
    const userMessage = get().addMessage({ role: 'user', content: messageContent, agentId: agent.id, metadata });
    const assistantMessage = get().addMessage({ role: 'assistant', content: '', agentId: agent.id, metadata });
    const requestMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...previousMessages.map(({ role, content }) => ({ role, content })),
      { role: userMessage.role, content: userMessage.content },
    ];

    set({ status: 'streaming', error: null });
    try {
      await streamChatCompletion(provider, requestMessages, (delta) => get().appendAssistantDelta(assistantMessage.id, delta));
      set({ status: 'idle' });
      return true;
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  },
}));
