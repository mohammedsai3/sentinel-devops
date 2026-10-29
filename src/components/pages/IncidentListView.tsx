import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MagnifyingGlass,
  Funnel,
  WarningCircle,
  Clock,
  Sparkle,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  CheckCircle,
  Timer,
  ArrowsDownUp,
  X,
  Buildings,
  Cpu,
  User,
  CaretRight,
} from '@phosphor-icons/react';
import { ScrollReveal } from '../ScrollReveal';

import { useRole } from '../../context/RoleContext';

export interface IncidentRecord {
  id: string;
  title: string;
  service: string;
  cluster: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'open' | 'investigating' | 'mitigated' | 'resolved';
  team: string;
  assignee: string;
  slaMinutesRemaining: number;
  reportedAt: string;
  rcaTimeMs?: number;
  rootCauseSummary: string;
}

interface IncidentListViewProps {
  onSelectTicket: (ticketId: string) => void;
  onNavigateToCreate: () => void;
}

export const IncidentListView: React.FC<IncidentListViewProps> = ({
  onSelectTicket,
  onNavigateToCreate,
}) => {
  const { incidents } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'sla' | 'priority'>('recent');

  // Convert context incidents to IncidentRecord
  const combinedIncidents = useMemo(() => {
    return incidents.map((inc) => ({
      id: inc.id,
      title: inc.title,
      service: inc.service,
      cluster: inc.cluster,
      priority: inc.priority,
      status: inc.status,
      team: inc.team,
      assignee: inc.assignee,
      slaMinutesRemaining: inc.slaMinutesRemaining,
      reportedAt: inc.reportedAt,
      rcaTimeMs: 42,
      rootCauseSummary: inc.rcaSummary,
    }));
  }, [incidents]);

  // Filtered and sorted incidents
  const filteredIncidents = useMemo(() => {
    return combinedIncidents.filter((item) => {
      // Search text match
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesQuery =
          Boolean(item.id?.toLowerCase().includes(query)) ||
          Boolean(item.title?.toLowerCase().includes(query)) ||
          Boolean(item.service?.toLowerCase().includes(query)) ||
          Boolean(item.assignee?.toLowerCase().includes(query)) ||
          Boolean(item.team?.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }

      // Status match
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Priority match
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;

      // Team match
      if (teamFilter !== 'all' && item.team !== teamFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'sla') {
        return a.slaMinutesRemaining - b.slaMinutesRemaining;
      }
      if (sortBy === 'priority') {
        const pMap = { P1: 1, P2: 2, P3: 3, P4: 4 };
        return pMap[a.priority] - pMap[b.priority];
      }
      return 0; // default recent
    });
  }, [combinedIncidents, searchQuery, statusFilter, priorityFilter, teamFilter, sortBy]);

  const countByStatus = {
    all: combinedIncidents.length,
    open: combinedIncidents.filter((i: IncidentRecord) => i.status === 'open').length,
    investigating: combinedIncidents.filter((i: IncidentRecord) => i.status === 'investigating').length,
    mitigated: combinedIncidents.filter((i: IncidentRecord) => i.status === 'mitigated').length,
    resolved: combinedIncidents.filter((i: IncidentRecord) => i.status === 'resolved').length,
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs text-zinc-400 tracking-wider uppercase font-semibold">
              Annuaire Central · Registre des Pannes
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Liste & Triage des Incidents
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Index exhaustif des pannes de production, filtrage temps réel multi-critères et analyse immédiate des causes racines par IA Groq LPU.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onNavigateToCreate}
          className="px-4 py-2.5 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-semibold hover:bg-emerald-400 transition-colors cursor-pointer flex items-center gap-2 shrink-0 shadow-sm"
        >
          <Plus size={15} weight="bold" />
          <span>Déclarer un incident</span>
        </motion.button>
      </div>

      {/* Search and Filters Hub */}
      <div className="p-5 rounded-xl bg-[#0f0f13] border border-white/[0.08] space-y-4">
        
        {/* Search input with shortcut hint */}
        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, identifiant (#892), service impacté ou ingénieur assigné..."
            className="w-full pl-10 pr-24 py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-1"
            >
              <X size={14} />
            </button>
          )}
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800 border border-white/5 pointer-events-none hidden sm:inline">
            Filtre live
          </span>
        </div>

        {/* Multi-criteria filter controls */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/[0.05] text-xs font-mono">
          
          {/* Status chips */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 uppercase tracking-wider text-[11px] mr-1">Statut:</span>
            {[
              { id: 'all', label: 'Tous', count: countByStatus.all },
              { id: 'open', label: 'Ouvert', count: countByStatus.open },
              { id: 'investigating', label: 'En cours', count: countByStatus.investigating },
              { id: 'mitigated', label: 'Atténué', count: countByStatus.mitigated },
              { id: 'resolved', label: 'Résolu', count: countByStatus.resolved },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setStatusFilter(chip.id)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === chip.id
                    ? 'bg-zinc-800 text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <span>{chip.label}</span>
                <span className="text-[10px] text-zinc-500 font-normal">({chip.count})</span>
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-white/10 hidden lg:block" />

          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 uppercase tracking-wider text-[11px] mr-1">Priorité:</span>
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'P1', label: 'P1 Critique' },
              { id: 'P2', label: 'P2 Élevée' },
              { id: 'P3', label: 'P3 Standard' },
            ].map((pri) => (
              <button
                key={pri.id}
                onClick={() => setPriorityFilter(pri.id)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  priorityFilter === pri.id
                    ? 'bg-zinc-800 text-zinc-100 font-semibold border border-white/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {pri.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-white/10 hidden xl:block" />

          {/* Team filter dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Équipe:</span>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="bg-zinc-900 border border-white/10 text-zinc-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">Toutes les équipes</option>
              <option value="Core Backend">Core Backend</option>
              <option value="SecOps">SecOps</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Frontend & API">Frontend & API</option>
            </select>

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-900 border border-white/10 text-zinc-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500/50"
            >
              <option value="recent">Tri : Plus récents</option>
              <option value="sla">Tri : Risque SLA imminent</option>
              <option value="priority">Tri : Sévérité P1 → P4</option>
            </select>
          </div>

        </div>

      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
          <span>{filteredIncidents.length} incident(s) correspondant(s)</span>
          <span className="hidden sm:inline">Cliquez sur une ligne pour ouvrir l'espace de diagnostic</span>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#0f0f13] border border-white/[0.08] space-y-3">
            <CheckCircle size={32} className="mx-auto text-emerald-400" />
            <h3 className="text-zinc-200 font-semibold text-sm">Aucun incident trouvé</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Aucun incident ne correspond à votre filtre actuel. Essayez de réinitialiser la recherche.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setTeamFilter('all');
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-mono text-emerald-400 hover:bg-zinc-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredIncidents.map((ticket, index) => {
              const isCrit = ticket.priority === 'P1';
              const isResolved = ticket.status === 'resolved';

              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  whileHover={{ y: -1 }}
                  onClick={() => onSelectTicket(ticket.id)}
                  className={`p-4 rounded-xl bg-[#0f0f13] border transition-all cursor-pointer group ${
                    isCrit && !isResolved
                      ? 'border-rose-500/30 hover:border-rose-500/60 bg-gradient-to-r from-rose-950/15 via-[#0f0f13] to-[#0f0f13]'
                      : 'border-white/[0.08] hover:border-white/[0.16]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left: ID, Priority, Title, Service */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                          {ticket.id}
                        </span>

                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                            ticket.priority === 'P1'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : ticket.priority === 'P2'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-300 border border-white/5'
                          }`}
                        >
                          {ticket.priority}
                        </span>

                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-zinc-400">
                          {ticket.service}
                        </span>

                        <span className="font-mono text-[11px] text-zinc-500">
                          {ticket.cluster}
                        </span>

                        {ticket.rcaTimeMs && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-950/40 border border-teal-500/30 text-[10px] font-mono text-teal-300">
                            <Sparkle size={10} weight="fill" className="text-teal-400" />
                            <span>Groq {ticket.rcaTimeMs}ms</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                        {ticket.title}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-1 font-sans">
                        <strong className="text-zinc-300 font-mono text-[11px]">RCA IA:</strong> {ticket.rootCauseSummary}
                      </p>
                    </div>

                    {/* Right: Team, SLA, Status, Action */}
                    <div className="flex items-center gap-4 lg:gap-6 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/[0.05]">
                      
                      {/* Assignee & Team */}
                      <div className="hidden sm:block text-right font-mono text-xs">
                        <div className="text-zinc-300 flex items-center justify-end gap-1.5">
                          <User size={13} className="text-zinc-500" />
                          <span>{ticket.assignee}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {ticket.team}
                        </div>
                      </div>

                      {/* SLA Gauge */}
                      <div className="text-right font-mono text-xs min-w-[80px]">
                        {isResolved ? (
                          <div className="text-emerald-400 flex items-center justify-end gap-1 font-semibold">
                            <CheckCircle size={13} weight="fill" />
                            <span>Résolu</span>
                          </div>
                        ) : (
                          <div>
                            <div className={`font-bold ${ticket.slaMinutesRemaining < 30 ? 'text-rose-400' : 'text-amber-400'}`}>
                              {ticket.slaMinutesRemaining}m restants
                            </div>
                            <div className="text-[10px] text-zinc-500">SLA contractuel</div>
                          </div>
                        )}
                      </div>

                      {/* Direct War Room Link button */}
                      <div className="pl-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 group-hover:bg-emerald-500 group-hover:text-zinc-950 text-xs font-mono text-zinc-300 transition-all font-semibold shadow-sm">
                          <span>War Room</span>
                          <ArrowUpRight size={13} weight="bold" />
                        </span>
                      </div>

                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
