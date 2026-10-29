import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LockKey,
  Key,
  GitBranch,
  Fingerprint,
  Target,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  WarningCircle,
  UserPlus,
  SignIn,
  Eye,
  EyeSlash,
  Sparkle,
  Buildings,
  EnvelopeSimple,
  User,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { SentinelLogo } from '../SentinelLogo';
import { AppView, RoleId } from '../../types/role';
import { useRole } from '../../context/RoleContext';

interface LoginAuthViewProps {
  onLoginSuccess: (redirectView: AppView, role: RoleId) => void;
  onBackToHome: () => void;
}

export const LoginAuthView: React.FC<LoginAuthViewProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  const { login, register, roles } = useRole();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<RoleId>('dev');
  const [regDept, setRegDept] = useState('Ingénierie & Microservices');
  const [regError, setRegError] = useState<string | null>(null);

  // Fast demo accounts for instant 1-click test
  const demoAccounts = [
    {
      name: 'Mohammed',
      email: 'mohammed@corp.sentinel',
      password: 'dev123',
      roleId: 'dev' as RoleId,
      roleName: 'Lead Développeur Core',
      icon: GitBranch,
      targetView: 'role-dev' as AppView,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      name: 'Tasnim',
      email: 'tasnim@corp.sentinel',
      password: 'sec123',
      roleId: 'sec' as RoleId,
      roleName: 'Lead Sécurité & SecOps',
      icon: Fingerprint,
      targetView: 'role-sec' as AppView,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      name: 'Aymane',
      email: 'aymane@corp.sentinel',
      password: 'qa123',
      roleId: 'qa' as RoleId,
      roleName: 'Lead Testeur & QA',
      icon: Target,
      targetView: 'role-qa' as AppView,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    {
      name: 'Mourad',
      email: 'mourad@corp.sentinel',
      password: 'admin123',
      roleId: 'admin' as RoleId,
      roleName: 'Admin SRE & Infra',
      icon: ShieldCheck,
      targetView: 'role-admin' as AppView,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
  ];

  const handleQuickLogin = (acc: typeof demoAccounts[0]) => {
    setLoginEmail(acc.email);
    setLoginPassword(acc.password);
    setLoginError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(acc.email, acc.password);
      setIsSubmitting(false);
      if (res.success && res.user) {
        onLoginSuccess(acc.targetView, acc.roleId);
      } else {
        setLoginError(res.error || 'Erreur de connexion');
      }
    }, 400);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Veuillez saisir votre adresse e-mail et votre mot de passe.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = login(loginEmail, loginPassword);
      setIsSubmitting(false);
      if (res.success && res.user) {
        const target = `role-${res.user.roleId}` as AppView;
        onLoginSuccess(target, res.user.roleId);
      } else {
        setLoginError(res.error || 'Identifiants invalides');
      }
    }, 500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Tous les champs requis doivent être renseignés.');
      return;
    }

    if (regPassword.length < 5) {
      setRegError('Le mot de passe doit comporter au moins 5 caractères.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = register({
        name: regName,
        email: regEmail,
        password: regPassword,
        roleId: regRole,
        department: regDept,
      });
      setIsSubmitting(false);
      if (res.success && res.user) {
        const target = `role-${res.user.roleId}` as AppView;
        onLoginSuccess(target, res.user.roleId);
      } else {
        setRegError(res.error || 'Erreur lors de l’inscription');
      }
    }, 600);
  };

  return (
    <div className="pt-24 pb-20 min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      {/* Return home link */}
      <div className="mb-6">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Retour au portail d'accueil public</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-xs text-zinc-400 tracking-wider uppercase font-semibold">
                Authentification RBAC & Base Utilisateurs
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Accès aux Cockpits Métiers Sentinel
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
              Connectez-vous ou créez votre compte pour être automatiquement aiguillé vers les pages de votre rôle opérationnel.
            </p>
          </div>

          {/* Tab Selector: Connexion vs Inscription */}
          <div className="p-1 rounded-xl bg-zinc-900 border border-white/10 flex font-mono text-xs max-w-md">
            <button
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <SignIn size={15} weight="bold" />
              <span>Se Connecter</span>
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setRegError(null);
              }}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserPlus size={15} weight="bold" />
              <span>Créer un Compte</span>
            </button>
          </div>

          {/* FORM 1: LOGIN */}
          {authMode === 'login' && (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleLoginSubmit}
              className="p-6 sm:p-7 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-2xl space-y-4"
            >
              <div className="border-b border-white/5 pb-3">
                <h2 className="text-base font-bold text-white font-sans">
                  Connexion à votre compte
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  L'authentification charge automatiquement les droits et la page de votre rôle
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-2.5">
                  <WarningCircle size={16} className="text-rose-400 shrink-0" weight="fill" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5 font-mono text-xs">
                <label className="block text-zinc-300 font-semibold">
                  Adresse E-mail professionnelle :
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="ex: mohammed@corp.sentinel"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
                  />
                  <EnvelopeSimple size={16} className="absolute left-3 top-3 text-zinc-500" />
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 font-semibold">
                    Mot de passe :
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    Démo: dev123 / sec123 / qa123 / admin123
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
                  />
                  <Key size={16} className="absolute left-3 top-3 text-zinc-500" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <ArrowsClockwise size={16} className="animate-spin" />
                    <span>Vérification dans la base de données...</span>
                  </>
                ) : (
                  <>
                    <SignIn size={16} weight="bold" />
                    <span>Se Connecter & Accéder à Mon Rôle</span>
                  </>
                )}
              </button>
            </motion.form>
          )}

          {/* FORM 2: REGISTER */}
          {authMode === 'register' && (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleRegisterSubmit}
              className="p-6 sm:p-7 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-2xl space-y-4"
            >
              <div className="border-b border-white/5 pb-3">
                <h2 className="text-base font-bold text-white font-sans">
                  Inscription d'un Nouveau Collaborateur
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Choisissez votre rôle métier pour configurer vos droits d'accès initiaux
                </p>
              </div>

              {regError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-2.5">
                  <WarningCircle size={16} className="text-rose-400 shrink-0" weight="fill" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="block text-zinc-300 font-semibold">Nom complet :</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Bilal Tazi"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500/60"
                    />
                    <User size={15} className="absolute left-3 top-2.5 text-zinc-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-zinc-300 font-semibold">Adresse e-mail :</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="bilal@corp.sentinel"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500/60"
                    />
                    <EnvelopeSimple size={15} className="absolute left-3 top-2.5 text-zinc-500" />
                  </div>
                </div>
              </div>

              {/* Role Picker Radio Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold text-zinc-300">
                  Sélectionnez Votre Rôle Métier :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(['dev', 'sec', 'qa', 'admin'] as RoleId[]).map((rId) => {
                    const r = roles[rId];
                    const isSelected = regRole === rId;
                    return (
                      <div
                        key={rId}
                        onClick={() => setRegRole(rId)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-zinc-800 border-emerald-500/60 ring-1 ring-emerald-500/30'
                            : 'bg-zinc-900/80 border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white font-sans">{r.name}</div>
                          <div className="text-[10px] font-mono text-zinc-400">{r.tag}</div>
                        </div>
                        {isSelected && (
                          <CheckCircle size={16} className="text-emerald-400" weight="fill" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="block text-zinc-300 font-semibold">Mot de passe :</label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 5 caractères"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-zinc-300 font-semibold">Confirmation :</label>
                  <input
                    type="password"
                    required
                    placeholder="Répétez mot de passe"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <label className="block text-zinc-300 font-semibold">Département d'affectation :</label>
                <input
                  type="text"
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <ArrowsClockwise size={16} className="animate-spin" />
                    <span>Création du compte dans la base...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} weight="bold" />
                    <span>Créer Mon Compte & Accéder à Mon Espace</span>
                  </>
                )}
              </button>
            </motion.form>
          )}
        </div>

        {/* Right Column: Instant 1-Click Demo Logins & Role Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-2xl space-y-4">
            <div className="border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Sparkle size={16} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white font-sans">
                  Connexions Rapides de Démo (1-Clic)
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Testez immédiatement l'isolation des pages en cliquant sur un des 4 profils préconfigurés dans la base :
              </p>
            </div>

            <div className="space-y-2.5">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <div
                    key={acc.roleId}
                    onClick={() => handleQuickLogin(acc)}
                    className="p-3.5 rounded-xl bg-zinc-900/70 border border-white/5 hover:border-emerald-500/40 hover:bg-zinc-800/60 transition-all cursor-pointer group space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-sans font-bold text-xs text-white">
                        <Icon size={16} className="text-emerald-400" />
                        <span>{acc.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400 font-normal">
                          ({acc.roleName})
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border uppercase ${acc.badgeColor}`}>
                        {acc.roleId.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-white/5">
                      <span className="text-zinc-500">{acc.email}</span>
                      <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>Entrer</span>
                        <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5 text-[11px] font-mono text-zinc-400 space-y-1">
              <div className="text-zinc-300 font-semibold">🔒 Politique RBAC Stricte :</div>
              <div>
                Une fois authentifié, l'utilisateur n'a accès <strong>qu'aux pages autorisées de son rôle</strong>. Tout accès direct à une URL d'un autre profil est automatiquement bloqué.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
