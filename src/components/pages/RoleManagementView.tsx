import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LockKey,
  Users,
  ShieldCheck,
  Check,
  GitBranch,
  Fingerprint,
  Target,
  SlidersHorizontal,
  UserPlus,
  Trash,
  ArrowRight,
  Sparkle,
  Article,
  X,
  Info,
} from '@phosphor-icons/react';
import { useRole } from '../../context/RoleContext';
import { RoleId, PermissionKey } from '../../types/role';

interface RoleManagementViewProps {
  onNavigateToRole?: (roleId: RoleId) => void;
}

export const RoleManagementView: React.FC<RoleManagementViewProps> = ({ onNavigateToRole }) => {
  const {
    roles,
    users,
    allPermissions,
    currentRole,
    selectRole,
    toggleRolePermission,
    assignUserRole,
    addUser,
    toggleUserStatus,
    deleteUser,
    triggerToast,
  } = useRole();

  const [activeRoleTab, setActiveRoleTab] = useState<RoleId>(currentRole || 'dev');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Add user modal inputs
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<RoleId>('dev');
  const [deptInput, setDeptInput] = useState('Ingénierie Logicielle');

  const roleIcons: Record<RoleId, any> = {
    dev: GitBranch,
    sec: Fingerprint,
    qa: Target,
    admin: ShieldCheck,
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !emailInput.trim()) return;

    addUser({
      name: nameInput.trim(),
      email: emailInput.trim(),
      roleId: roleInput,
      department: deptInput,
      ssoProvider: 'Okta SSO',
      mfaActive: true,
      active: true,
      avatarColor: roles[roleInput].badgeColor,
    });

    setNameInput('');
    setEmailInput('');
    setIsAddUserModalOpen(false);
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Title & Introduction */}
      <div className="space-y-3 pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-xs text-zinc-400 tracking-wider uppercase font-semibold">
            Gouvernance de Sécurité & Droits d'Accès
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
              Gestion des Rôles & Matrice RBAC
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-3xl font-sans">
              Configurez dynamiquement les habilitations des 4 rôles techniques (Développeur, Sécurité, QA, Admin).
              Chaque rôle dispose de son propre cockpit et de droits spécifiques modifiables en direct.
            </p>
          </div>

          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 shrink-0"
          >
            <UserPlus size={15} weight="bold" />
            <span>Nouveau Collaborateur</span>
          </button>
        </div>
      </div>

      {/* 4 Role Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['dev', 'sec', 'qa', 'admin'] as RoleId[]).map((rId) => {
          const r = roles[rId];
          const Icon = roleIcons[rId];
          const isSelected = activeRoleTab === rId;
          const isCurrentSession = currentRole === rId;
          const memberCount = users.filter((u) => u.roleId === rId).length;

          return (
            <div
              key={rId}
              onClick={() => setActiveRoleTab(rId)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                isSelected
                  ? 'bg-zinc-900 border-emerald-500/50 shadow-xl shadow-black/50 ring-1 ring-emerald-500/30'
                  : 'bg-[#0f0f13] border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${r.badgeColor}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-white font-sans">{r.name}</h2>
                    <span className="text-[10px] font-mono text-zinc-400">{r.defaultUserName} (Lead)</span>
                  </div>
                </div>
                {isCurrentSession && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Session active" />
                )}
              </div>

              <p className="text-xs text-zinc-400 font-sans line-clamp-2">
                {r.description}
              </p>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">{memberCount} membre(s)</span>
                <span className="text-emerald-400 font-semibold">{r.permissions.length} perms</span>
              </div>

              {/* Direct Link to Role Page + Switch Button */}
              <div className="pt-1 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectRole(rId);
                    if (onNavigateToRole) onNavigateToRole(rId);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-[11px] font-mono font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Tester ce Rôle</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix for the selected role */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-emerald-400" />
              <h2 className="text-lg font-bold text-white font-sans">
                Permissions Détaillées pour : <span className="text-emerald-300">{roles[activeRoleTab].name}</span>
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              {roles[activeRoleTab].mission}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-md bg-zinc-900 border border-white/5 text-xs font-mono text-emerald-400 font-semibold">
              {roles[activeRoleTab].permissions.length} sur {allPermissions.length} accordées
            </span>
            <button
              onClick={() => {
                selectRole(activeRoleTab);
                if (onNavigateToRole) onNavigateToRole(activeRoleTab);
              }}
              className="px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              Aller à la page {roles[activeRoleTab].name}
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(['Opérations', 'Sécurité & Vault', 'Tests & QA', 'Gouvernance & RBAC'] as const).map((cat) => {
            const catPerms = allPermissions.filter((p) => p.category === cat);
            return (
              <div key={cat} className="p-5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  <span>{cat}</span>
                  <span className="text-[10px] text-zinc-500 font-normal">
                    {catPerms.filter((p) => roles[activeRoleTab].permissions.includes(p.key)).length} / {catPerms.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {catPerms.map((perm) => {
                    const isGranted = roles[activeRoleTab].permissions.includes(perm.key);
                    return (
                      <div
                        key={perm.key}
                        onClick={() => toggleRolePermission(activeRoleTab, perm.key)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isGranted
                            ? 'bg-zinc-800/90 border-emerald-500/30 text-white'
                            : 'bg-black/20 border-white/5 text-zinc-400 hover:border-white/10'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className={`text-xs font-semibold ${isGranted ? 'text-emerald-300' : 'text-zinc-400'}`}>
                            {perm.label}
                          </div>
                          <div className="text-[11px] text-zinc-500 font-sans leading-tight">
                            {perm.description}
                          </div>
                        </div>

                        {/* Switch UI */}
                        <div
                          className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 shrink-0 ${
                            isGranted ? 'bg-emerald-500 justify-end' : 'bg-zinc-800 justify-start'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Assignment Table */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <h2 className="text-base font-bold text-white font-sans">
              Affectation des Collaborateurs aux Rôles
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-sans">
              Attribuez un nouveau rôle à un membre pour adapter instantanément son cockpit et ses habilitations
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {users.length} Utilisateurs Enregistrés
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500 uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Nom & Email</th>
                <th className="pb-3">Département</th>
                <th className="pb-3">Rôle Actif</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="font-semibold text-white font-sans">{u.name}</div>
                    <div className="text-[11px] text-zinc-500">{u.email}</div>
                  </td>
                  <td className="py-3 text-zinc-400 font-sans">{u.department}</td>
                  <td className="py-3">
                    <select
                      value={u.roleId}
                      onChange={(e) => assignUserRole(u.id, e.target.value as RoleId)}
                      className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="dev">Développeur Core</option>
                      <option value="sec">Sécurité & SecOps</option>
                      <option value="qa">Testeur & QA Lead</option>
                      <option value="admin">Admin SRE & Infra</option>
                    </select>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        u.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {u.active ? 'Actif' : 'Suspendu'}
                    </button>
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Supprimer l'accès"
                    >
                      <Trash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add User */}
      <AnimatePresence>
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl bg-[#131318] border border-white/10 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <UserPlus size={18} className="text-emerald-400" />
                  <h3 className="text-base font-bold text-white font-sans">
                    Nouveau Collaborateur
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="p-1 rounded text-zinc-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddUserSubmit} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="block text-zinc-400 mb-1">Nom complet :</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Hicham Alami"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Adresse E-mail :</label>
                  <input
                    type="email"
                    required
                    placeholder="hicham@corp.sentinel"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Rôle Métier Initial :</label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value as RoleId)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="dev">Développeur Core</option>
                    <option value="sec">Sécurité & SecOps</option>
                    <option value="qa">Testeur & QA Lead</option>
                    <option value="admin">Admin SRE & Infra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Département :</label>
                  <input
                    type="text"
                    value={deptInput}
                    onChange={(e) => setDeptInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
