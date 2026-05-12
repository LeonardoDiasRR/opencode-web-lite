import type { PrimaryAgentId } from '../types/agent.js';

interface AgentSwitcherProps {
  activeAgent: PrimaryAgentId;
  onChange: (agent: PrimaryAgentId) => void;
}

export function AgentSwitcher({ activeAgent, onChange }: AgentSwitcherProps) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-900 p-1">
      {(['build', 'plan'] as const).map((agent) => (
        <button
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeAgent === agent ? 'bg-orange-300 text-zinc-950' : 'text-zinc-300 hover:bg-zinc-800'
          }`}
          key={agent}
          onClick={() => onChange(agent)}
          type="button"
        >
          {agent === 'build' ? 'Build' : 'Plan'}
        </button>
      ))}
    </div>
  );
}
