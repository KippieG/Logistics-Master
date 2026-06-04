import type { RiskLevel } from '../data/shipments';

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'critical': return 'text-red-400';
    case 'high':     return 'text-orange-400';
    case 'medium':   return 'text-yellow-400';
    case 'low':      return 'text-green-400';
  }
}

export function getRiskBadge(level: RiskLevel): string {
  switch (level) {
    case 'critical': return 'bg-red-500/15 text-red-300 border border-red-500/40';
    case 'high':     return 'bg-orange-500/15 text-orange-300 border border-orange-500/40';
    case 'medium':   return 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/40';
    case 'low':      return 'bg-green-500/15 text-green-300 border border-green-500/40';
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'critical': return '🔴 Kritiek';
    case 'high':     return '🟠 Hoog';
    case 'medium':   return '🟡 Gemiddeld';
    case 'low':      return '🟢 Laag';
  }
}

/* Score bar: ECS burgundy → orange → ECS yellow → green */
export function getScoreBarColor(score: number): string {
  if (score >= 80) return '#8D1D45';
  if (score >= 60) return '#c44d2c';
  if (score >= 40) return '#F8CE3E';
  return '#22c55e';
}

export function formatDelay(days: number): string {
  if (days === 0) return 'Op tijd';
  if (days < 1)   return `+${Math.round(days * 24)}u`;
  return `+${days.toFixed(1)}d`;
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'weather':        return '🌊';
    case 'customs':        return '🛃';
    case 'capacity':       return '📦';
    case 'supplier':       return '🏭';
    case 'ferry':          return '⛴️';
    case 'infrastructure': return '🚧';
    default:               return '⚠️';
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'weather':        return 'text-blue-400';
    case 'customs':        return 'text-purple-400';
    case 'capacity':       return 'text-orange-400';
    case 'supplier':       return 'text-yellow-300';
    case 'ferry':          return 'text-teal-400';
    case 'infrastructure': return 'text-red-400';
    default:               return 'text-slate-400';
  }
}
