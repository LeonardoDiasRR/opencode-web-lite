import { Route, Routes } from 'react-router-dom';
import { ChatPanel } from './features/chat/components/ChatPanel.js';
import { CompactionPanel } from './features/compaction/components/CompactionPanel.js';
import { ConnectionForm } from './features/connection/components/ConnectionForm.js';
import { useConnectionStore } from './features/connection/store/connectionStore.js';
import { FileExplorerPanel } from './features/file-explorer/components/FileExplorerPanel.js';
import { McpPanel } from './features/mcps/components/McpPanel.js';
import { PluginPanel } from './features/plugins/components/PluginPanel.js';
import { ProviderPanel } from './features/providers/components/ProviderPanel.js';
import { SessionPanel } from './features/sessions/components/SessionPanel.js';
import { SkillPanel } from './features/skills/components/SkillPanel.js';
import { TerminalPanel } from './features/terminal-ui/components/TerminalPanel.js';
import { WorkspacePanel } from './features/workspace/components/WorkspacePanel.js';
import { WorkspaceSettingsPanel } from './features/workspace-settings/components/WorkspaceSettingsPanel.js';
import { AppShell } from './shared/ui/AppShell.js';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

function HomePage() {
  const connectionStatus = useConnectionStore((state) => state.status);

  if (connectionStatus !== 'connected') {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#164e63,transparent_35%),radial-gradient(circle_at_bottom_right,#4c1d95,transparent_35%),#09090b] px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl gap-6">
          <Header />
          <ConnectionForm />
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="text-xl font-semibold text-white">Checklist inicial</h2>
            <p className="mt-2 text-sm text-zinc-400">Conecte ao serviço local, selecione o workspace, configure provider e comece pelo chat.</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      sidebar={<Sidebar />}
      main={<MainArea />}
      inspector={<Inspector />}
      terminal={<TerminalPanel />}
    />
  );
}

function Header() {
  return (
    <header className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur md:p-10">
      <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">OpenCode Web Lite</p>
      <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">IDE local para agentes.</h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">Arquivos, terminal, chat, sessões e configurações em um shell responsivo.</p>
    </header>
  );
}

function Sidebar() {
  return (
    <div className="space-y-4">
      <nav aria-label="Painéis principais" className="grid gap-2 text-sm text-zinc-300">
        {['Chat', 'Arquivos', 'Terminal', 'Sessões', 'Providers', 'Skills', 'Plugins', 'MCPs', 'Configurações'].map((item) => (
          <a className="rounded-xl border border-zinc-800 px-3 py-2 hover:bg-white/10" href={`#${item.toLowerCase()}`} key={item}>{item}</a>
        ))}
      </nav>
      <WorkspacePanel />
      <SessionPanel />
    </div>
  );
}

function MainArea() {
  return (
    <div className="grid gap-4">
      <div id="chat"><ChatPanel /></div>
      <div id="arquivos"><FileExplorerPanel /></div>
    </div>
  );
}

function Inspector() {
  return (
    <div className="grid gap-4">
      <ProviderPanel />
      <SkillPanel />
      <PluginPanel />
      <McpPanel />
      <CompactionPanel />
      <div id="configurações"><WorkspaceSettingsPanel /></div>
    </div>
  );
}
