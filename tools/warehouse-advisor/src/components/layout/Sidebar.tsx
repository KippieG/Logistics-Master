import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Settings, AlertTriangle, Lightbulb,
  FlaskConical, FileText, Package, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

const nav = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard',      sub: 'Live KPIs' },
  { to: '/setup',        icon: Settings,        label: 'Warehouse Setup', sub: 'Configure' },
  { to: '/analysis',     icon: AlertTriangle,   label: 'Analysis',        sub: 'Bottlenecks' },
  { to: '/optimization', icon: Lightbulb,       label: 'Optimization',    sub: 'Recommendations' },
  { to: '/simulation',   icon: FlaskConical,    label: 'Simulation',      sub: 'What-If Scenarios' },
  { to: '/report',       icon: FileText,        label: 'Report',          sub: 'Export PDF' },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gray-950 border-r border-gray-800 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">WOA</p>
          <p className="text-gray-500 text-xs">Optimization Advisor</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label, sub }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-sm font-medium truncate', isActive ? 'text-white' : '')}>{label}</p>
                  <p className={clsx('text-xs truncate', isActive ? 'text-brand-200' : 'text-gray-600 group-hover:text-gray-500')}>{sub}</p>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-brand-300" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">v1.0 · Consultant Edition</p>
      </div>
    </aside>
  )
}
