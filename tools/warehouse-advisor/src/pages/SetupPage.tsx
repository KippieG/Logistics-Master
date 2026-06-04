import { useState } from 'react'
import { Settings2, Users, Package2, Building2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { SeverityBadge } from '../components/shared/SeverityBadge'
import { WarehouseMap } from '../components/shared/WarehouseMap'
import { useWarehouseStore } from '../store/warehouseStore'
import { Zone, ZoneType } from '../types/warehouse'
import clsx from 'clsx'

const zoneTypeLabels: Record<ZoneType, string> = {
  receiving: 'Receiving', staging: 'Staging', storage: 'Storage',
  picking: 'Picking', packing: 'Packing', shipping: 'Shipping', returns: 'Returns',
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <label className="w-48 text-sm text-gray-400 flex-shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function NumInput({ value, onChange, min = 0, max = 100000, step = 1, unit }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number" value={value} min={min} max={max} step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-brand-500 tabular-nums"
      />
      {unit && <span className="text-gray-500 text-sm">{unit}</span>}
    </div>
  )
}

function Section({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-brand-400" />
          <span className="font-semibold text-white">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="px-6 pb-6 space-y-4">{children}</div>}
    </div>
  )
}

export function SetupPage() {
  const { config, updateZone, updateStaff, updateOperations, updateMeta } = useWarehouseStore()
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const utilSev = (u: number) => u >= 0.92 ? 'critical' as const : u >= 0.8 ? 'warning' as const : 'good' as const

  return (
    <div className="flex flex-col flex-1">
      <Header title="Warehouse Setup" subtitle="Configure zones, staff, and operational parameters" />

      <div className="flex-1 p-8 space-y-6">
        {/* Meta */}
        <Section title="Warehouse Identity" icon={Building2}>
          <div className="grid grid-cols-2 gap-4">
            {([
              ['Warehouse Name', 'name', config.name],
              ['Client', 'client', config.client],
              ['Location', 'location', config.location],
            ] as [string, string, string][]).map(([label, key, val]) => (
              <FieldRow key={key} label={label}>
                <input value={val} onChange={e => updateMeta({ [key]: e.target.value } as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-brand-500" />
              </FieldRow>
            ))}
            <FieldRow label="Total Area">
              <NumInput value={config.totalArea} onChange={v => updateMeta({ totalArea: v })} unit="m²" step={100} />
            </FieldRow>
          </div>
        </Section>

        {/* Zone config + map */}
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-2 space-y-4">
            <Section title="Zone Configuration" icon={Package2}>
              <div className="space-y-2">
                {config.zones.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone.id === selectedZone?.id ? null : zone)}
                    className={clsx(
                      'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left',
                      zone.id === selectedZone?.id
                        ? 'border-brand-600 bg-brand-950/40'
                        : 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{zone.name}</p>
                      <p className="text-xs text-gray-500">{zoneTypeLabels[zone.type]} · {zone.area} m²</p>
                    </div>
                    <SeverityBadge severity={utilSev(zone.currentUtilization)} label={`${Math.round(zone.currentUtilization * 100)}%`} />
                  </button>
                ))}
              </div>
            </Section>
          </div>

          <div className="col-span-3 space-y-4">
            {/* Map */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <h3 className="text-white font-semibold mb-3 px-2">Layout Preview</h3>
              <WarehouseMap
                zones={config.zones}
                onZoneClick={z => setSelectedZone(z.id === selectedZone?.id ? null : z)}
                selectedZoneId={selectedZone?.id}
              />
            </div>

            {/* Zone detail editor */}
            {selectedZone && (
              <div className="bg-gray-900 border border-brand-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-white font-semibold">Edit: {selectedZone.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FieldRow label="Area (m²)">
                    <NumInput value={selectedZone.area} step={50}
                      onChange={v => { updateZone(selectedZone.id, { area: v }); setSelectedZone(z => z ? { ...z, area: v } : z) }} />
                  </FieldRow>
                  <FieldRow label="Capacity">
                    <NumInput value={selectedZone.capacity} step={10}
                      onChange={v => { updateZone(selectedZone.id, { capacity: v }); setSelectedZone(z => z ? { ...z, capacity: v } : z) }} />
                  </FieldRow>
                  <FieldRow label="Utilisation (0–1)">
                    <NumInput value={selectedZone.currentUtilization} step={0.01} min={0} max={1}
                      onChange={v => { updateZone(selectedZone.id, { currentUtilization: v }); setSelectedZone(z => z ? { ...z, currentUtilization: v } : z) }} />
                  </FieldRow>
                  <FieldRow label="Staff Assigned">
                    <NumInput value={selectedZone.staffAssigned}
                      onChange={v => { updateZone(selectedZone.id, { staffAssigned: v }); setSelectedZone(z => z ? { ...z, staffAssigned: v } : z) }} />
                  </FieldRow>
                  <FieldRow label="Processing Rate">
                    <NumInput value={selectedZone.processingRate} unit="orders/h"
                      onChange={v => { updateZone(selectedZone.id, { processingRate: v }); setSelectedZone(z => z ? { ...z, processingRate: v } : z) }} />
                  </FieldRow>
                  <FieldRow label="Travel Distance">
                    <NumInput value={selectedZone.travelDistance} unit="m"
                      onChange={v => { updateZone(selectedZone.id, { travelDistance: v }); setSelectedZone(z => z ? { ...z, travelDistance: v } : z) }} />
                  </FieldRow>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Staff */}
        <Section title="Workforce Configuration" icon={Users}>
          <div className="grid grid-cols-3 gap-4">
            <FieldRow label="Total Headcount"><NumInput value={config.staff.totalHeadcount} onChange={v => updateStaff({ totalHeadcount: v })} unit="FTE" /></FieldRow>
            <FieldRow label="Shifts/Day"><NumInput value={config.staff.shifts} min={1} max={3} onChange={v => updateStaff({ shifts: v })} /></FieldRow>
            <FieldRow label="Pickers/Shift"><NumInput value={config.staff.pickersPerShift} onChange={v => updateStaff({ pickersPerShift: v })} /></FieldRow>
            <FieldRow label="Packers/Shift"><NumInput value={config.staff.packersPerShift} onChange={v => updateStaff({ packersPerShift: v })} /></FieldRow>
            <FieldRow label="Receiving/Shift"><NumInput value={config.staff.receivingPerShift} onChange={v => updateStaff({ receivingPerShift: v })} /></FieldRow>
            <FieldRow label="Shipping/Shift"><NumInput value={config.staff.shippingPerShift} onChange={v => updateStaff({ shippingPerShift: v })} /></FieldRow>
          </div>
        </Section>

        {/* Operations */}
        <Section title="Operations Parameters" icon={Settings2}>
          <div className="grid grid-cols-3 gap-4">
            <FieldRow label="Daily Order Volume"><NumInput value={config.operations.dailyOrderVolume} step={50} onChange={v => updateOperations({ dailyOrderVolume: v })} unit="orders" /></FieldRow>
            <FieldRow label="Peak Multiplier"><NumInput value={config.operations.peakMultiplier} step={0.1} min={1} max={5} onChange={v => updateOperations({ peakMultiplier: v })} unit="×" /></FieldRow>
            <FieldRow label="Avg Order Lines"><NumInput value={config.operations.averageOrderLines} step={0.1} onChange={v => updateOperations({ averageOrderLines: v })} /></FieldRow>
            <FieldRow label="SKU Count"><NumInput value={config.operations.skuCount} step={100} onChange={v => updateOperations({ skuCount: v })} /></FieldRow>
            <FieldRow label="Fast-Mover SKUs %"><NumInput value={config.operations.fastMoverPercent} step={1} max={100} onChange={v => updateOperations({ fastMoverPercent: v })} unit="%" /></FieldRow>
            <FieldRow label="Fast-Mover Volume %"><NumInput value={config.operations.fastMoverVolumePercent} step={1} max={100} onChange={v => updateOperations({ fastMoverVolumePercent: v })} unit="%" /></FieldRow>
            <FieldRow label="Return Rate"><NumInput value={config.operations.returnRate} step={0.1} max={50} onChange={v => updateOperations({ returnRate: v })} unit="%" /></FieldRow>
            <FieldRow label="Picks/Hour (avg)"><NumInput value={config.operations.avgPicksPerHour} onChange={v => updateOperations({ avgPicksPerHour: v })} /></FieldRow>
            <FieldRow label="Packs/Hour (avg)"><NumInput value={config.operations.avgPacksPerHour} onChange={v => updateOperations({ avgPacksPerHour: v })} /></FieldRow>
          </div>
        </Section>

        <button onClick={handleSave}
          className={clsx(
            'flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all',
            saved ? 'bg-emerald-600 text-white' : 'bg-brand-600 hover:bg-brand-500 text-white'
          )}>
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Configuration'}
        </button>
      </div>
    </div>
  )
}
