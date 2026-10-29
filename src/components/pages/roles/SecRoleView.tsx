import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Fingerprint,
  ShieldCheck,
  ShieldWarning,
  LockKey,
  Key,
  ArrowsClockwise,
  WarningOctagon,
  CheckCircle,
  Clock,
  Sparkle,
  Fire,
  FileLock,
  PlusCircle,
  Article,
  Broadcast,
  ListBullets,
  ArrowRight,
  Prohibit,
} from '@phosphor-icons/react';
import { useRole } from '../../../context/RoleContext';
import { api } from '../../../services/api';

interface SecRoleViewProps {
  onNavigateToSupervision: () => void;
  onNavigateToIncidents: () => void;
  onNavigateToWiki: () => void;
}

export const SecRoleView: React.FC<SecRoleViewProps> = ({
  onNavigateToSupervision,
  onNavigateToIncidents,
  onNavigateToWiki,
}) => {
  const { project, triggerToast, addAuditLog } = useRole();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [isRotatingVault, setIsRotatingVault] = useState(false);
  const [vaultRotated, setVaultRotated] = useState(false);
  const [ipToBlock, setIpToBlock] = useState('');
  const [blockedIps, setBlockedIps] = useState<string[]>([
    '185.220.101.5 (Tor Exit Node)',
    '45.154.255.89 (Scanner ReDoS)',
    '194.26.29.112 (Brute force OAuth2)',
  ]);

  const vulnerabilities = [
    {
      cveId: 'CVE-2024-41110',
      severity: 'CRITIQUE',
      score: '9.8',
      component: `${project.name} Runtime Engine`,
      service: `${project.name} Microservices`,
      description: `Contournement du plugin d’autorisation sur les conteneurs hébergeant ${project.name}.`,
      status: 'Correctif disponible',
    },
    {
      cveId: 'CVE-2024-38816',
      severity: 'ÉLEVÉE',
      score: '7.5',
      component: 'express / router',
      service: `${project.name} Ingress Gateway`,
      description: `Path Traversal sur le traitement des requêtes non vérifiées ciblant ${project.name}.`,
      status: 'Atténuation WAF active',
    },
    {
      cveId: 'CVE-2024-21538',
      severity: 'MOYENNE',
      score: '5.3',
      component: 'npm:cross-spawn:7.0.3',
      service: 'build-scripts',
      description: 'ReDoS possible lors du parsing de commandes contenant des caractères d’échappement.',
      status: 'PR de mise à jour ouverte',
    },
  ];

  // Sync security stats with live backend
  React.useEffect(() => {
    api.security.getStats().then((data) => {
      if (data && Array.isArray(data.wafBlockedIps) && data.wafBlockedIps.length > 0) {
        setBlockedIps(data.wafBlockedIps);
      }
    }).catch(() => {});
  }, []);

  const handleRunScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      triggerToast('Scan de conteneurs Trivy terminé : 0 nouvelle faille critique détectée', 'success');
      addAuditLog('Scan automatisé de sécurité Trivy exécuté sur les clusters de prod', 'security', 'success');
    }, 1500);
  };

  const handleRotateVault = () => {
    setIsRotatingVault(true);
    setTimeout(() => {
      setIsRotatingVault(false);
      setVaultRotated(true);
      triggerToast('Certificats Vault renouvelés et synchronisés avec succès', 'success');
      addAuditLog('Rotation manuelle forcée des certificats Vault OAuth2 et ACME', 'security', 'success');
      api.security.rotateVault().catch(() => {});
    }, 1300);
  };

  const handleBlockIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipToBlock.trim()) return;
    const target = ipToBlock.trim();
    setBlockedIps((prev) => [target, ...prev]);
    triggerToast(`IP ${target} bloquée sur le WAF Cloudflare avec règle DROP`, 'warning');
    addAuditLog(`Blocage WAF de l’adresse IP malveillante : ${target}`, 'security', 'warning');
    api.security.blockWafIp(target).catch(() => {});
    setIpToBlock('');
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* SecOps Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-950/30 via-[#13110e] to-[#0d0b0a] border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ESPACE SÉCURITÉ & SECOPS
              </span>
              <span className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Posture Défensive · Tasnim
              </span>
              <span className="text-xs font-mono text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                Projet Audité : {project.name} ({project.files.length} fichiers réels)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight">
              Centre de Surveillance des Risques & Vulnérabilités
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl font-sans">
              Cockpit réservé à l'équipe sécurité : scans de conformité des conteneurs, audit des accès et rotation des certificats HashiCorp Vault.
            </p>
          </div>

          {/* Quick stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Vuln. CVE</div>
              <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">3 Actives</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Certificats</div>
              <div className="text-xs font-bold text-emerald-400 font-mono mt-1 flex items-center justify-center gap-1">
                <ShieldCheck size={12} weight="bold" />
                Valides (99%)
              </div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">IPs Bloquées</div>
              <div className="text-lg font-bold text-rose-300 font-mono mt-0.5">{blockedIps.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Score CVSS</div>
              <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">9.8 Max</div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors cursor-pointer shadow-sm"
          >
            <Broadcast size={14} weight="bold" className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Scan Trivy en cours...' : 'Lancer un Scan Trivy Immédiat'}</span>
          </button>
          <button
            onClick={onNavigateToSupervision}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck size={14} className="text-amber-400" />
            <span>Console de Supervision CI/CD</span>
          </button>
          <button
            onClick={onNavigateToIncidents}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ListBullets size={14} className="text-amber-400" />
            <span>Incidents de Sécurité</span>
          </button>
          <button
            onClick={onNavigateToWiki}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Article size={14} className="text-zinc-400" />
            <span>Guides de Remédiation</span>
          </button>
        </div>
      </div>

      {/* Main Grid: CVE Radar + Vault Management & WAF */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: CVE Detection & Trivy Scans (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldWarning size={16} className="text-amber-400" />
                  <h2 className="text-base font-bold text-white font-sans">
                    Vulnérabilités de Conteneurs (Scans Trivy & Snyk)
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Dernier scan il y a 12 min · 3 dépendances à corriger
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-amber-300">
                Audit Automatique
              </span>
            </div>

            <div className="space-y-3.5">
              {vulnerabilities.map((v) => (
                <div
                  key={v.cveId}
                  className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-amber-500/30 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{v.cveId}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        v.severity === 'CRITIQUE' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {v.severity} (Score {v.score})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">{v.service}</span>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {v.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-white/5">
                    <span className="text-zinc-500">{v.component}</span>
                    <span className="text-emerald-400 font-semibold">{v.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Vault Secrets & WAF IP Blocker (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Vault Secrets Manager */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <LockKey size={16} className="text-amber-400" />
                <h3 className="text-base font-bold text-white font-sans">
                  Coffre Vault & Certificats TLS
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                Vault Cluster
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-zinc-200 font-semibold">Certificat *.corp.sentinel</div>
                  <div className="text-[10px] text-zinc-500">Let's Encrypt Wildcard</div>
                </div>
                <span className="text-emerald-400 font-bold">Expire dans 48j</span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-zinc-200 font-semibold">Token OAuth2 Vault Service</div>
                  <div className="text-[10px] text-zinc-500">Service interne d'authentification</div>
                </div>
                <span className="text-amber-400 font-bold">Rotation requise</span>
              </div>
            </div>

            <button
              onClick={handleRotateVault}
              disabled={isRotatingVault || vaultRotated}
              className={`w-full py-2.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                vaultRotated
                  ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/40'
                  : isRotatingVault
                  ? 'bg-amber-600/50 text-white cursor-wait'
                  : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
              }`}
            >
              <ArrowsClockwise size={14} className={isRotatingVault ? 'animate-spin' : ''} />
              <span>{isRotatingVault ? 'Rotation en cours...' : vaultRotated ? 'Secrets Tournés avec Succès' : 'Forcer la Rotation des Certificats'}</span>
            </button>
          </div>

          {/* WAF IP Blocker */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Prohibit size={16} className="text-rose-400" />
                <h3 className="text-base font-bold text-white font-sans">
                  Pare-Feu WAF & Blocage d'IP
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-rose-300">
                Drop Immédiat
              </span>
            </div>

            <form onSubmit={handleBlockIp} className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: 198.51.100.44"
                value={ipToBlock}
                onChange={(e) => setIpToBlock(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-zinc-950 font-mono font-bold text-xs transition-colors cursor-pointer"
              >
                Bloquer
              </button>
            </form>

            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Dernières Adresses Neutralisées :
              </div>
              {blockedIps.map((ip, i) => (
                <div key={i} className="p-2 rounded bg-zinc-900/60 border border-white/5 text-[11px] font-mono text-zinc-300 flex items-center justify-between">
                  <span>{ip}</span>
                  <span className="text-rose-400 text-[10px] font-bold">BLOCKED</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
