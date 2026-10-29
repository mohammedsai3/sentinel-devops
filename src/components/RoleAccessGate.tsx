import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldWarning,
  LockKey,
  ArrowRight,
  SignIn,
  UserCircle,
  CheckCircle,
  WarningOctagon,
  House,
} from '@phosphor-icons/react';
import { useRole } from '../context/RoleContext';
import { PermissionKey, RoleId, AppView } from '../types/role';

interface RoleAccessGateProps {
  requiredPermission?: PermissionKey;
  allowedRoles?: RoleId[];
  targetViewName?: string;
  children: React.ReactNode;
  onNavigate?: (view: AppView) => void;
}

export const RoleAccessGate: React.FC<RoleAccessGateProps> = ({
  requiredPermission,
  allowedRoles,
  targetViewName,
  children,
  onNavigate,
}) => {
  const { currentRole, currentUser, roles, selectRole, hasPermission, allPermissions } = useRole();

  // If role is null (Public) or doesn't have permission/role
  const isRoleAllowed = allowedRoles ? (currentRole ? allowedRoles.includes(currentRole) : false) : true;
  const isPermAllowed = requiredPermission ? hasPermission(requiredPermission) : true;

  if (isRoleAllowed && isPermAllowed) {
    return <>{children}</>;
  }

  const permDef = requiredPermission ? allPermissions.find((p) => p.key === requiredPermission) : null;
  const myRoleDef = currentRole ? roles[currentRole] : null;

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 sm:p-10 rounded-2xl bg-[#0f0f13] border border-rose-500/30 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-white/[0.08]">
          <div className="w-14 h-14 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <LockKey size={30} weight="duotone" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                CLOISONNEMENT RBAC STRICT
              </span>
              <span className="text-xs font-mono text-zinc-500">Périmètre Restreint</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Accès Non Autorisé : {targetViewName || 'Page Réservée'}
            </h2>
          </div>
        </div>

        <div className="py-6 space-y-5">
          {currentRole ? (
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/5 space-y-2">
              <p className="text-sm text-zinc-300 leading-relaxed">
                Vous êtes connecté en tant que <strong className="text-white">{currentUser?.name || myRoleDef?.defaultUserName}</strong> avec le rôle{' '}
                <strong className="text-emerald-300">{myRoleDef?.name}</strong>.
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Par politique de sécurité opérationnelle, vous avez uniquement accès aux pages relatives à votre profil métier. Cette vue est restreinte aux profils :{' '}
                <span className="text-rose-300 font-mono font-semibold">
                  {allowedRoles?.map((r) => roles[r]?.name || r).join(', ') || 'Rôles spécifiques'}
                </span>.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/5 space-y-2">
              <p className="text-sm text-zinc-300 leading-relaxed">
                Vous êtes actuellement en <strong>Mode Public</strong> (non authentifié).
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Pour accéder à cet espace technique, veuillez vous connecter avec vos identifiants ou créer un compte avec le rôle approprié.
              </p>
            </div>
          )}

          {permDef && (
            <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-white/5 flex items-center gap-3">
              <ShieldWarning size={20} className="text-amber-400 shrink-0" />
              <div className="text-xs font-mono">
                <span className="text-zinc-400">Habilitation requise : </span>
                <span className="text-amber-300 font-semibold">{permDef.label}</span>
                <span className="text-zinc-500 block text-[11px] mt-0.5 font-sans">{permDef.description}</span>
              </div>
            </div>
          )}

          {/* Quick Action Navigation */}
          <div className="pt-2 flex flex-wrap gap-3">
            {currentRole ? (
              <button
                onClick={() => {
                  if (onNavigate) onNavigate(myRoleDef?.dedicatedRoute as AppView);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <ArrowRight size={15} weight="bold" />
                <span>Retourner à Mon Cockpit Dédié ({myRoleDef?.name})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('login');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <SignIn size={15} weight="bold" />
                <span>Se Connecter / Créer un Compte</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onNavigate) onNavigate('landing');
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer border border-white/10"
            >
              <House size={15} />
              <span>Retour à l'Accueil</span>
            </button>
          </div>

          {/* Test switcher for demo / debug */}
          <div className="pt-4 border-t border-white/5">
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2.5">
              Tester en tant qu'un autre collaborateur (Changer de rôle) :
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {(['dev', 'sec', 'qa', 'admin'] as RoleId[]).map((rId) => {
                const r = roles[rId];
                const isSelected = currentRole === rId;
                return (
                  <button
                    key={rId}
                    onClick={() => {
                      selectRole(rId);
                      if (onNavigate) onNavigate(r.dedicatedRoute as AppView);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800 border-emerald-500/50'
                        : 'bg-zinc-900/60 border-white/10 hover:border-white/20 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">{r.defaultUserName}</div>
                    <div className="text-[10px] font-mono text-zinc-400">{r.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
