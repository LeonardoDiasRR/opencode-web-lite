import type { ServiceConnection } from '../../connection/types/service.js';
import type { PrimaryAgent } from '../../agents/types/agent.js';
import type { Subagent } from '../../subagents/types/subagent.js';
import { getPluginRegistry } from '../../plugins/services/pluginRegistry.js';
import { executeNativeTool, nativeToolDefinitions } from './nativeTools.js';
import { parseToolCalls, stripToolCallBlocks } from './toolCallParser.js';
import { resolveToolPermission } from './permissionResolver.js';
import { useApprovalStore } from '../store/approvalStore.js';
import type { RuntimeEvent } from '../types/toolCall.js';

export interface RuntimeInput {
  content: string;
  connection: ServiceConnection;
  workspacePath: string;
  agent: PrimaryAgent;
  subagent?: Subagent;
}

export async function processRuntimeToolCalls(input: RuntimeInput): Promise<{ content: string; events: RuntimeEvent[] }> {
  const calls = parseToolCalls(input.content).map((call) => ({ ...call, permission: resolveToolPermission(call.name, input.agent, input.subagent) }));
  const events: RuntimeEvent[] = [];
  for (const call of calls) {
    if (call.permission === 'deny') {
      const result = { toolCallId: call.id, toolName: call.name, status: 'denied' as const, preview: 'Permissão negada.' };
      events.push({ call: { ...call, status: 'denied' }, result });
      useApprovalStore.getState().addPending({ ...call, status: 'denied' });
      useApprovalStore.getState().recordResult(result);
      continue;
    }
    if (call.permission === 'ask') {
      useApprovalStore.getState().addPending(call);
      events.push({ call });
      continue;
    }
    await getPluginRegistry().runToolBefore?.({ call });
    const definition = nativeToolDefinitions.find((tool) => tool.name === call.name);
    const result = definition?.source === 'native'
      ? await executeNativeTool({ ...call, connection: input.connection, workspacePath: input.workspacePath })
      : { toolCallId: call.id, toolName: call.name, status: 'failed' as const, preview: '', error: 'Executor indisponível.' };
    await getPluginRegistry().runToolAfter?.({ call, result });
    useApprovalStore.getState().addPending({ ...call, status: result.status });
    useApprovalStore.getState().recordResult(result);
    events.push({ call: { ...call, status: result.status }, result });
  }
  return { content: stripToolCallBlocks(input.content), events };
}
