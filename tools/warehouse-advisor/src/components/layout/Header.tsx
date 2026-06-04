import { Building2, RefreshCw } from 'lucide-react'
import { useWarehouseStore } from '../../store/warehouseStore'

interface Props { title: string; subtitle?: string }

export function Header({ title, subtitle }: Props) {
  const { config, resetToDefault } = useWarehouseStore()

  return (
    <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur border-b border-gray-800 px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
          <Building2 className="w-4 h-4 text-brand-400" />
          <div>
            <p className="text-xs font-medium text-white leading-tight">{config.name}</p>
            <p className="text-xs text-gray-500 leading-tight">{config.client}</p>
          </div>
        </div>
        <button
          onClick={resetToDefault}
          title="Reset to sample data"
          className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
