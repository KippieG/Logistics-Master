import clsx from 'clsx'
import { Severity } from '../../types/warehouse'

interface Props { severity: Severity; label?: string; size?: 'sm' | 'md' }

const map: Record<Severity, { bg: string; text: string; dot: string; default: string }> = {
  critical: { bg: 'bg-red-900/40',    text: 'text-red-400',    dot: 'bg-red-500',    default: 'Critical' },
  warning:  { bg: 'bg-amber-900/40',  text: 'text-amber-400',  dot: 'bg-amber-500',  default: 'Warning' },
  info:     { bg: 'bg-blue-900/40',   text: 'text-blue-400',   dot: 'bg-blue-500',   default: 'Info' },
  good:     { bg: 'bg-emerald-900/40',text: 'text-emerald-400',dot: 'bg-emerald-500',default: 'Good' },
}

export function SeverityBadge({ severity, label, size = 'sm' }: Props) {
  const c = map[severity]
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      c.bg, c.text,
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      <span className={clsx('rounded-full', c.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      {label ?? c.default}
    </span>
  )
}
