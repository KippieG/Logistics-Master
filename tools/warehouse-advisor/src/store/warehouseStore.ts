import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WarehouseConfig, Zone, StaffConfig, OperationsConfig } from '../types/warehouse'
import { defaultWarehouse } from '../data/sampleData'

interface WarehouseStore {
  config: WarehouseConfig
  activeScenarioId: string | null
  setConfig: (config: WarehouseConfig) => void
  updateZone: (zoneId: string, updates: Partial<Zone>) => void
  updateStaff: (updates: Partial<StaffConfig>) => void
  updateOperations: (updates: Partial<OperationsConfig>) => void
  updateMeta: (updates: Partial<Pick<WarehouseConfig, 'name' | 'client' | 'location' | 'totalArea'>>) => void
  setActiveScenario: (id: string | null) => void
  resetToDefault: () => void
}

export const useWarehouseStore = create<WarehouseStore>()(
  persist(
    (set) => ({
      config: defaultWarehouse,
      activeScenarioId: null,

      setConfig: (config) => set({ config }),

      updateZone: (zoneId, updates) =>
        set(state => ({
          config: {
            ...state.config,
            zones: state.config.zones.map(z => z.id === zoneId ? { ...z, ...updates } : z),
          },
        })),

      updateStaff: (updates) =>
        set(state => ({
          config: { ...state.config, staff: { ...state.config.staff, ...updates } },
        })),

      updateOperations: (updates) =>
        set(state => ({
          config: { ...state.config, operations: { ...state.config.operations, ...updates } },
        })),

      updateMeta: (updates) =>
        set(state => ({ config: { ...state.config, ...updates } })),

      setActiveScenario: (id) => set({ activeScenarioId: id }),

      resetToDefault: () => set({ config: defaultWarehouse, activeScenarioId: null }),
    }),
    { name: 'woa-warehouse-config' }
  )
)
