import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Users,
  Key,
  LockKey,
  UserPlus,
  Trash,
  Check,
  CheckCircle,
  WarningCircle,
  Cpu,
  ArrowsClockwise,
  SlidersHorizontal,
  Article,
  ChartLineUp,
  Broadcast,
  Lightning,
  Sparkle,
  Fingerprint,
  Target,
  GitBranch,
  X,
  Buildings,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import { useRole } from '../../../context/RoleContext';
import { RoleId, PermissionKey, UserMember } from '../../../types/role';

interface AdminRoleViewProps {
  onNavigateToDashboard: () => void;
  onNavigateToReporting: () => void;
}

export const AdminRoleView: React.FC<AdminRoleViewProps> = ({
  onNavigateToDashboard,
  onNavigateToReporting,
}) => {
  const {
    roles,
    users,
    auditLogs,
    allPermissions,
    currentRole,
    project,
    selectRole,
    toggleRolePermission,
    assignUserRole,
    addUser,
    toggleUserStatus,
    deleteUser,
    triggerToast,
  } = useRole();

  const [activeTab, setActiveTab] = useState<'rbac' | 'users' | 'audit' | 'cluster'>('rbac');
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState<RoleId>('dev');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<RoleId>('dev');
  const [newDept, setNewDept] = useState('Ingénierie & Microservices');
  const [newSso, setNewSso] = useState('Okta SSO');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    addUser({
      name: newName.trim(),
      email: newEmail.trim(),
      roleId: newRole,
      department: newDept,
      ssoProvider: newSso,
      mfaActive: true,
      active: true,
      avatarColor: roles[newRole].badgeColor,
    });

    setNewName('');
    setNewEmail('');
    setIsAddUserModalOpen(false);
  };

  const roleIcons: Record<RoleId, any> = {
    dev: GitBranch,
    sec: Fingerprint,
    qa: Target,
    admin: ShieldCheck,
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Admin SRE Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-rose-950/30 via-[#140e10] to-[#0d090a] border border-rose-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                ESPACE ADMIN SRE & GOUVERNANCE
              </span>
              <span className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                Contrôle Total RBAC · Mourad
              </span>
              <span className="text-xs font-mono text-rose-300 font-bold bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/30">
                Projet Déployé : {project.name} ({project.files.length} fichiers réels)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight">
              Gestion des Rôles & Supervision de Plateforme
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl font-sans">
              Gouvernance intégrale : matrice des droits RBAC en temps réel, attribution des rôles aux collaborateurs, santé des clusters K8s et traçabilité immuable.
            </p>
          </div>

          {/* Quick stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Collaborateurs</div>
              <div className="text-lg font-bold text-white font-mono mt-0.5">{users.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Rôles RBAC</div>
              <div className="text-lg font-bold text-rose-300 font-mono mt-0.5">4 Rôles</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Permissions</div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{allPermissions.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Audit Logs</div>
              <div className="text-lg font-bold text-teal-300 font-mono mt-0.5">{auditLogs.length}</div>
            </div>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-white/5 text-xs font-mono">
            <button
              onClick={() => setActiveTab('rbac')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'rbac' ? 'bg-rose-500 text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LockKey size={14} weight={activeTab === 'rbac' ? 'bold' : 'regular'} />
              <span>Matrice des Rôles (RBAC)</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'users' ? 'bg-rose-500 text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users size={14} weight={activeTab === 'users' ? 'bold' : 'regular'} />
              <span>Gestion des Collaborateurs</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'audit' ? 'bg-rose-500 text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Article size={14} weight={activeTab === 'audit' ? 'bold' : 'regular'} />
              <span>Piste d'Audit Immuable</span>
            </button>
            <button
              onClick={() => setActiveTab('cluster')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'cluster' ? 'bg-rose-500 text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Cpu size={14} weight={activeTab === 'cluster' ? 'bold' : 'regular'} />
              <span>Santé Clusters K8s</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToDashboard}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChartLineUp size={13} className="text-rose-400" />
              <span>Tableau de Bord Global</span>
            </button>
            <button
              onClick={onNavigateToReporting}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Article size={13} className="text-zinc-400" />
              <span>Rapports Comex</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: GESTION DES RÔLES & MATRICE RBAC */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          {/* 4 Roles Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['dev', 'sec', 'qa', 'admin'] as RoleId[]).map((rId) => {
              const r = roles[rId];
              const Icon = roleIcons[rId];
              const isSelected = selectedRoleForDetail === rId;
              const isCurrentSessionRole = currentRole === rId;
              const roleUsers = users.filter((u) => u.roleId === rId);

              return (
                <div
                  key={rId}
                  onClick={() => setSelectedRoleForDetail(rId)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                    isSelected
                      ? 'bg-zinc-900/90 border-white/30 shadow-xl shadow-black/50 ring-1 ring-white/10'
                      : 'bg-[#0f0f13] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${r.badgeColor}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white font-sans">{r.name}</div>
                        <div className="text-[10px] font-mono text-zinc-400">{r.defaultUserName} (Lead)</div>
                      </div>
                    </div>
                    {isCurrentSessionRole && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Rôle Actif Actuel" />
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 font-sans leading-relaxed">
                    {r.description}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-500">{roleUsers.length} membre(s)</span>
                    <span className="text-white font-semibold">{r.permissions.length} perms actives</span>
                  </div>

                  {/* Switch to this role button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      selectRole(rId);
                    }}
                    className={`w-full py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      isCurrentSessionRole
                        ? 'bg-zinc-800 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                    }`}
                  >
                    {isCurrentSessionRole ? '✓ Votre Rôle Actuel' : 'Tester en tant que ce Rôle'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Granular Permissions Interactive Matrix for the selected role */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-rose-400" />
                  <h2 className="text-base font-bold text-white font-sans">
                    Matrice des Habilitations RBAC pour :{' '}
                    <span className="text-rose-300">{roles[selectedRoleForDetail].name}</span>
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Cliquez sur n'importe quel commutateur pour activer ou révoquer une permission en temps réel
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-white/5 text-xs font-mono text-zinc-300">
                  {roles[selectedRoleForDetail].permissions.length} / {allPermissions.length} activées
                </span>
              </div>
            </div>

            {/* Grouped Permissions Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['Opérations', 'Sécurité & Vault', 'Tests & QA', 'Gouvernance & RBAC'] as const).map((cat) => {
                const permsInCat = allPermissions.filter((p) => p.category === cat);
                return (
                  <div key={cat} className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 space-y-3">
                    <div className="text-xs font-bold text-zinc-300 font-mono tracking-wider uppercase flex items-center justify-between">
                      <span>{cat}</span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        {permsInCat.filter((p) => roles[selectedRoleForDetail].permissions.includes(p.key)).length} / {permsInCat.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {permsInCat.map((perm) => {
                        const isGranted = roles[selectedRoleForDetail].permissions.includes(perm.key);
                        return (
                          <div
                            key={perm.key}
                            onClick={() => toggleRolePermission(selectedRoleForDetail, perm.key)}
                            className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isGranted
                                ? 'bg-zinc-800/80 border-emerald-500/30 text-white'
                                : 'bg-black/20 border-white/5 text-zinc-400 hover:border-white/10'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="text-xs font-semibold flex items-center gap-1.5">
                                <span className={isGranted ? 'text-emerald-300' : 'text-zinc-500'}>
                                  {perm.label}
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-500 font-sans leading-tight">
                                {perm.description}
                              </div>
                            </div>

                            {/* Toggle switch visual */}
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
        </div>
      )}

      {/* TAB 2: GESTION DES UTILISATEURS */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-rose-400" />
                <h2 className="text-base font-bold text-white font-sans">
                  Annuaire des Collaborateurs & Affectation des Rôles
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Modifiez le rôle attribué à chaque utilisateur ou ajoutez un nouveau membre
              </p>
            </div>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus size={14} weight="bold" />
              <span>Ajouter un Collaborateur</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/5 text-zinc-500 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">Collaborateur</th>
                  <th className="pb-3">Département</th>
                  <th className="pb-3">Fournisseur SSO</th>
                  <th className="pb-3">Rôle Assigné</th>
                  <th className="pb-3">Statut</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => {
                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 pl-2">
                        <div className="font-semibold text-white font-sans">{u.name}</div>
                        <div className="text-[11px] text-zinc-500">{u.email}</div>
                      </td>
                      <td className="py-3 text-zinc-400 font-sans">{u.department}</td>
                      <td className="py-3 text-zinc-400">{u.ssoProvider}</td>
                      <td className="py-3">
                        <select
                          value={u.roleId}
                          onChange={(e) => assignUserRole(u.id, e.target.value as RoleId)}
                          className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-rose-500 cursor-pointer"
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
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Supprimer ce compte"
                        >
                          <Trash size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PISTE D'AUDIT IMMUABLE */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                Journal d'Audit Trail Immuable (SecOps & RBAC)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Historique temps réel des modifications de rôles, connexions et déploiements
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
              Chiffré SHA-256
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    log.status === 'success' ? 'bg-emerald-400' : log.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'
                  }`} />
                  <div>
                    <div className="text-zinc-200 font-semibold">{log.action}</div>
                    <div className="text-[10px] text-zinc-500">
                      Par <strong className="text-zinc-300">{log.actor}</strong> ({log.role}) · IP {log.ipAddress}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 sm:text-right shrink-0">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SANTÉ INFRASTRUCTURE K8S */}
      {activeTab === 'cluster' && (
        <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                Santé des Nœuds & Clusters Kubernetes
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Surveillance de la flotte de pods et métriques de charge
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              CLUSTER NOMINAL (99.98%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 space-y-2">
              <div className="text-zinc-400">k8s-prod-eu1 (Cluster Maître)</div>
              <div className="text-xl font-bold text-white">48 Pods Actifs</div>
              <div className="text-[11px] text-emerald-400">CPU: 42% · RAM: 61%</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 space-y-2">
              <div className="text-zinc-400">k8s-stage-eu1 (Environnement Test)</div>
              <div className="text-xl font-bold text-white">18 Pods Actifs</div>
              <div className="text-[11px] text-emerald-400">CPU: 18% · RAM: 32%</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 space-y-2">
              <div className="text-zinc-400">security-core (Vault & WAF)</div>
              <div className="text-xl font-bold text-white">8 Pods Isolés</div>
              <div className="text-[11px] text-emerald-400">CPU: 12% · RAM: 24%</div>
            </div>
          </div>
        </div>
      )}

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
                  <UserPlus size={18} className="text-rose-400" />
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

              <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="block text-zinc-400 mb-1">Nom complet :</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Hicham Alami"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Adresse E-mail :</label>
                  <input
                    type="email"
                    required
                    placeholder="hicham@corp.sentinel"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Rôle Métier Initial :</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as RoleId)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-rose-500"
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
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-rose-500"
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
                    className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold"
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
