import { create } from 'zustand';
import type { RuntimeEvent, ToolCall, ToolResult } from '../types/toolCall.js';

interface ApprovalState {
  events: RuntimeEvent[];
  addPending: (call: ToolCall) => void;
  recordResult: (result: ToolResult) => void;
  approve: (toolCallId: string) => void;
  deny: (toolCallId: string) => void;
  clear: () => void;
}

export const useApprovalStore = create<ApprovalState>((set, get) => ({
  events: [],
  addPending(call) {
    set({ events: [...get().events, { call }] });
  },
  recordResult(result) {
    set({ events: get().events.map((event) => (event.call.id === result.toolCallId ? { ...event, result, call: { ...event.call, status: result.status } } : event)) });
  },
  approve(toolCallId) {
    set({ events: get().events.map((event) => (event.call.id === toolCallId ? { ...event, call: { ...event.call, status: 'approved' }, result: { toolCallId, toolName: event.call.name, status: 'approved', preview: 'Aprovado para a próxima execução controlada.' } } : event)) });
  },
  deny(toolCallId) {
    set({ events: get().events.map((event) => (event.call.id === toolCallId ? { ...event, call: { ...event.call, status: 'denied' }, result: { toolCallId, toolName: event.call.name, status: 'denied', preview: 'Negado pelo usuário.' } } : event)) });
  },
  clear() {
    set({ events: [] });
  },
}));
