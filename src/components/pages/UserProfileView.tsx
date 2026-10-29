import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  ShieldCheck,
  LockKey,
  Bell,
  Sun,
  Moon,
  Desktop,
  CheckCircle,
  Fingerprint,
  EnvelopeSimple,
  DeviceMobile,
  ChatsCircle,
  Clock,
  Key,
  ArrowLeft,
  Sparkle,
  Check,
} from '@phosphor-icons/react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  avatarColor: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'mohammed',
    name: 'Mohammed',
    role: 'Lead Développeur Core',
    department: 'Ingénierie & Microservices',
    email: 'mohammed@corp.sentinel',
    avatarColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'tasnim',
    name: 'Tasnim',
    role: 'Lead Sécurité & SecOps',
    department: 'Gouvernance & SSI',
    email: 'tasnim@corp.sentinel',
    avatarColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    id: 'mourad',
    name: 'Mourad',
    role: 'Administrateur SRE & Infra',
    department: 'Cloud & Plateforme K8s',
    email: 'mourad@corp.sentinel',
    avatarColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  {
    id: 'aymane',
    name: 'Aymane',
    role: 'Lead Testeur & QA',
    department: 'Qualité logicielle & Chaos Testing',
    email: 'aymane@corp.sentinel',
    avatarColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
];

interface UserProfileViewProps {
  onBackToDashboard: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  onBackToDashboard,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('mohammed');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Appearance theme state
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>('dark');

  // Granular notification settings
  const [notifications, setNotifications] = useState({
    emailCriticalP1: true,
    emailAllTickets: false,
    pushBrowser: true,
    slackDirectWarRoom: true,
    quietHoursOffDuty: true,
    weeklyExecutiveReport: false,
  });

  const [onDutyStart, setOnDutyStart] = useState('08:00');
  const [onDutyEnd, setOnDutyEnd] = useState('19:00');
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  const currentMember = TEAM_MEMBERS.find((m) => m.id === selectedMemberId) || TEAM_MEMBERS[0];

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) return;

    setPasswordSaved(true);
    setTimeout(() => {
      setPasswordSaved(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 2500);
  };

  const handleToggleNotif = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2000);
  };

  return (
    <div className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Return link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Retour au tableau de bord</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs text-zinc-400 tracking-wider uppercase font-semibold">
              Espace Individuel · Préférences Personnelles
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Profil Utilisateur & Paramètres Personnels
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
            Gérez vos identifiants, vos clés d'authentification, vos canaux d'alertes et vos créneaux d'astreinte personnalisés.
          </p>
        </div>

        {/* Member Profile Switcher (Mohammed, Tasnim, Mourad, Aymane) */}
        <div className="p-2 rounded-xl bg-[#0f0f13] border border-white/10 space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 block">
            Changer de profil actif :
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TEAM_MEMBERS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMemberId(m.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedMemberId === m.id
                    ? 'bg-zinc-800 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Notification Toast */}
      <AnimatePresence>
        {settingsSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-emerald-400" />
              <span>Préférences sauvegardées automatiquement pour {currentMember.name}.</span>
            </div>
            <span className="text-[10px] text-zinc-400">Instantané</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Member Card & Theme Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Member Card */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-bold text-xl font-mono ${currentMember.avatarColor}`}>
                {currentMember.name[0]}
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-base text-zinc-100 font-sans">
                  {currentMember.name}
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  {currentMember.role}
                </p>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {currentMember.department}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] space-y-2 text-xs font-mono text-zinc-400">
              <div className="flex items-center justify-between">
                <span>E-mail :</span>
                <span className="text-zinc-200">{currentMember.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fournisseur SSO :</span>
                <span className="text-zinc-200">Okta Enterprise</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Clé YubiKey FIDO2 :</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Fingerprint size={13} />
                  <span>Actif</span>
                </span>
              </div>
            </div>
          </div>

          {/* Theme Selector (Clair / Sombre / Système) */}
          <div className="p-5 rounded-2xl bg-[#0f0f13] border border-white/[0.08] space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Apparence & Thème de l'interface
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Personnalisez le contraste de votre espace selon vos conditions d'environnement.
            </p>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
              {[
                { id: 'dark', label: 'Sombre', icon: Moon },
                { id: 'light', label: 'Clair', icon: Sun },
                { id: 'system', label: 'Système', icon: Desktop },
              ].map((theme) => {
                const Icon = theme.icon;
                const isSelected = themeMode === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setThemeMode(theme.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'bg-zinc-800 text-emerald-400 border-emerald-500/40 shadow-sm'
                        : 'bg-zinc-900/60 text-zinc-400 border-white/5 hover:border-white/10 hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{theme.label}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-mono text-zinc-500 block text-center">
              Recommandé : Mode Sombre Obsidian (optimisé fatigue visuelle)
            </span>
          </div>

        </div>

        {/* Right Column: Security/Password + Granular Notifications (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Notifications Management Card */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-amber-400" />
                <h3 className="font-bold text-sm text-zinc-100 font-sans">
                  Gestion des Alertes & Notifications d'Astreinte
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Canaux configurables
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Choisissez précisément comment {currentMember.name} doit être notifié(e) lors du déclenchement d'une panne ou d'une alerte SLA.
            </p>

            <div className="space-y-3 font-mono text-xs">
              
              {/* Alert Channel 1: P1 Critical by email */}
              <div
                onClick={() => handleToggleNotif('emailCriticalP1')}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-white/10 transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-sans font-semibold text-zinc-200">
                    <EnvelopeSimple size={15} className="text-rose-400" />
                    <span>Alertes E-mail d'Urgence P1 (Arrêt de service)</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Envoi instantané dès détection d'une rupture de disponibilité
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailCriticalP1}
                  onChange={() => {}}
                  className="rounded border-white/20 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
              </div>

              {/* Alert Channel 2: All tickets */}
              <div
                onClick={() => handleToggleNotif('emailAllTickets')}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-white/10 transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-sans font-semibold text-zinc-200">
                    <EnvelopeSimple size={15} className="text-zinc-400" />
                    <span>Récapitulatif de tous les tickets assignés (P2 / P3 / P4)</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Notification par e-mail pour les anomalies non bloquantes
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailAllTickets}
                  onChange={() => {}}
                  className="rounded border-white/20 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
              </div>

              {/* Alert Channel 3: Browser Push */}
              <div
                onClick={() => handleToggleNotif('pushBrowser')}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-white/10 transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-sans font-semibold text-zinc-200">
                    <DeviceMobile size={15} className="text-cyan-400" />
                    <span>Notifications Push Navigateur & Mobile</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Bannières temps réel lors des réponses du copilote et diagnostics RCA
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.pushBrowser}
                  onChange={() => {}}
                  className="rounded border-white/20 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
              </div>

              {/* Alert Channel 4: Slack */}
              <div
                onClick={() => handleToggleNotif('slackDirectWarRoom')}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-white/10 transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-sans font-semibold text-zinc-200">
                    <ChatsCircle size={15} className="text-emerald-400" />
                    <span>Notification directe sur Slack (#war-room-sentinel)</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Ping automatique lorsque votre nom ou rôle est mentionné dans un ticket
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.slackDirectWarRoom}
                  onChange={() => {}}
                  className="rounded border-white/20 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
              </div>

              {/* Quiet Hours / Out of hours silence */}
              <div className="p-4 rounded-xl bg-zinc-900/90 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-sans font-semibold text-zinc-200 text-xs">
                    <Clock size={16} className="text-amber-400" />
                    <span>Mode "Ne pas déranger hors des heures d'astreinte"</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.quietHoursOffDuty}
                    onChange={() => handleToggleNotif('quietHoursOffDuty')}
                    className="rounded border-white/20 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
                  />
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  Désactive les notifications non critiques en dehors de votre plage de garde programmée. Seules les alertes P1 majeures de production passeront.
                </p>

                {notifications.quietHoursOffDuty && (
                  <div className="flex items-center gap-3 pt-2 text-xs font-mono">
                    <span className="text-zinc-500">Créneau d'astreinte actif :</span>
                    <input
                      type="time"
                      value={onDutyStart}
                      onChange={(e) => setOnDutyStart(e.target.value)}
                      className="px-2 py-1 rounded bg-zinc-950 border border-white/10 text-zinc-200"
                    />
                    <span className="text-zinc-500">à</span>
                    <input
                      type="time"
                      value={onDutyEnd}
                      onChange={(e) => setOnDutyEnd(e.target.value)}
                      className="px-2 py-1 rounded bg-zinc-950 border border-white/10 text-zinc-200"
                    />
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Security & Password Change Card */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <LockKey size={18} className="text-emerald-400" />
                <h3 className="font-bold text-sm text-zinc-100 font-sans">
                  Sécurité & Changement de Mot de Passe
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Politique NIST 800-63
              </span>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400 text-[11px] block mb-1">Mot de passe actuel</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 text-[11px] block mb-1">Nouveau mot de passe</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 14 caractères"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 text-[11px] block mb-1">Confirmer mot de passe</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Min. 14 caractères"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-zinc-500">
                  Exige majuscule, chiffre et symbole spécial
                </span>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!newPassword || newPassword !== confirmPassword}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-sans transition-all disabled:opacity-40 cursor-pointer"
                >
                  {passwordSaved ? 'Mot de passe mis à jour !' : 'Mettre à jour mot de passe'}
                </motion.button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
