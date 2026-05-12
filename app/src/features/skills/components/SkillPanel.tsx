import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { getSkillPermission } from '../services/skillPermissions.js';
import { useSkillStore } from '../store/skillStore.js';
import type { SkillPermission } from '../types/skill.js';

export function SkillPanel() {
  const connection = useConnectionStore();
  const workspace = useWorkspaceStore();
  const skills = useSkillStore();
  const ready = connection.status === 'connected' && workspace.status === 'ready' && Boolean(workspace.path);
  const busy = skills.status === 'discovering' || skills.status === 'saving';
  const serviceConnection = { baseUrl: connection.baseUrl, token: connection.token };

  const savePermission = async (name: string, permission: SkillPermission) => {
    const nextConfig = await skills.savePermission(serviceConnection, workspace.path, workspace.config, name, permission);
    if (nextConfig) useWorkspaceStore.setState({ config: nextConfig });
  };

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-lime-300">Etapa 7</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Skills</h2>
        <p className="mt-2 text-sm text-zinc-400">Descubra instruções reutilizáveis do workspace e controle permissões de carregamento.</p>
      </div>

      <button
        className="w-full rounded-xl bg-lime-300 px-4 py-3 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!ready || busy}
        onClick={() => void skills.discover(serviceConnection, workspace.path)}
        type="button"
      >
        {skills.status === 'discovering' ? 'Descobrindo skills...' : 'Descobrir skills'}
      </button>

      <div className="mt-4 space-y-3">
        {skills.skills.length === 0 && <p className="text-sm text-zinc-500">Nenhuma skill descoberta ainda.</p>}
        {skills.skills.map((skill) => {
          const permission = getSkillPermission(workspace.config, skill.name);
          return (
            <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4" key={`${skill.origin}:${skill.name}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-white">{skill.name}</h3>
                  <p className="text-sm text-zinc-400">{skill.metadata.description ?? 'Sem descrição'} · {skill.origin}</p>
                </div>
                <select
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                  value={permission}
                  onChange={(event) => void savePermission(skill.name, event.target.value as SkillPermission)}
                >
                  <option value="ask">ask</option>
                  <option value="allow">allow</option>
                  <option value="deny">deny</option>
                </select>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
                <input
                  checked={skills.approvedSkills.includes(skill.name)}
                  disabled={permission === 'deny'}
                  onChange={(event) => skills.setApproved(skill.name, event.target.checked)}
                  type="checkbox"
                />
                Aprovar para o próximo prompt
              </label>
            </article>
          );
        })}
      </div>

      {!ready && <p className="mt-4 text-sm text-zinc-500">Conecte ao serviço e inicialize um workspace para descobrir skills.</p>}
      {skills.status === 'error' && skills.error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{skills.error}</p>
      )}
    </section>
  );
}
