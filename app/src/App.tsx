import { Route, Routes } from 'react-router-dom';
import { ChatPanel } from './features/chat/components/ChatPanel.js';
import { ConnectionForm } from './features/connection/components/ConnectionForm.js';
import { PluginPanel } from './features/plugins/components/PluginPanel.js';
import { ProviderPanel } from './features/providers/components/ProviderPanel.js';
import { SessionPanel } from './features/sessions/components/SessionPanel.js';
import { SkillPanel } from './features/skills/components/SkillPanel.js';
import { WorkspacePanel } from './features/workspace/components/WorkspacePanel.js';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#164e63,transparent_35%),radial-gradient(circle_at_bottom_right,#4c1d95,transparent_35%),#09090b] px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur md:p-10">
          <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">OpenCode Web Lite</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Conecte ao serviço local e prepare seu workspace.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
                Configure a conexão local, inicialize o workspace e selecione o provedor LLM que será usado pelos agentes.
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm text-cyan-100">
              <p className="font-semibold text-cyan-50">Fase 4</p>
              <p className="mt-2 text-cyan-100/80">MVP Chat + Agentes</p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <ConnectionForm />
          <WorkspacePanel />
        </div>

        <ProviderPanel />

        <SkillPanel />

        <PluginPanel />

        <ChatPanel />

        <SessionPanel />

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Próxima fase</p>
          <h2 className="mt-2 text-xl font-semibold text-white">MCPs + Compaction</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Com plugins declarativos, a Fase 9 adiciona MCPs por projeto e compactação de contexto.
          </p>
        </section>
      </div>
    </main>
  );
}
