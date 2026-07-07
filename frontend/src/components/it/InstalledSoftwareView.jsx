import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, AlertTriangle } from 'lucide-react'

// Software deployment per asset — which licensed software is installed where.
// Flags any license whose install count exceeds its purchased seats.

export default function InstalledSoftwareView({ installs, onChange, assets, licenses }) {
  const [openAsset, setOpenAsset] = useState(null)
  const [addFor, setAddFor] = useState(null)
  const [pick, setPick] = useState('')

  const activeAssets = assets.filter((a) => a.status !== 'retired')
  const installCount = (licenseId) => installs.filter((i) => i.licenseId === licenseId).length
  const overDeployed = licenses.filter((l) => installCount(l.id) > l.seats)

  const addInstall = (assetId) => {
    if (!pick) return
    onChange([...installs, {
      id: Math.max(0, ...installs.map((i) => i.id)) + 1,
      assetId, licenseId: Number(pick), installedDate: new Date().toISOString().slice(0, 10),
    }])
    setPick(''); setAddFor(null)
  }

  const remove = (id) => onChange(installs.filter((i) => i.id !== id))

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">Installed software</h2>
        <p className="text-xs text-gray-500">Which licensed software sits on which machine — audit view against seat counts.</p>
      </div>

      {overDeployed.length > 0 && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 flex items-start gap-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>
            {overDeployed.map((l) => `${l.name}: ${installCount(l.id)} installs on ${l.seats} seats`).join(' · ')} — uninstall or buy seats before the vendor audit.
          </span>
        </div>
      )}

      <div className="space-y-2">
        {activeAssets.map((a) => {
          const items = installs.filter((i) => i.assetId === a.id)
          const open = openAsset === a.id
          return (
            <div key={a.id} className="bg-white rounded-lg border border-gray-200">
              <button onClick={() => setOpenAsset(open ? null : a.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                {open ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                <span className="font-mono text-xs text-gray-500 w-16 shrink-0">{a.tag}</span>
                <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{a.model}</span>
                <span className="text-[11px] text-gray-400 shrink-0">{items.length} package(s)</span>
              </button>
              {open && (
                <div className="px-4 pb-3 pl-11 space-y-1.5">
                  {items.map((i) => {
                    const lic = licenses.find((l) => l.id === i.licenseId)
                    const over = lic && installCount(lic.id) > lic.seats
                    return (
                      <div key={i.id} className="flex items-center gap-2 text-xs">
                        <span className={`flex-1 min-w-0 truncate ${over ? 'text-red-600' : 'text-gray-700'}`}>
                          {lic?.name || 'Unknown license'}{over && ' — over seat count'}
                        </span>
                        <span className="text-gray-400 shrink-0">installed {i.installedDate}</span>
                        <button onClick={() => remove(i.id)} className="text-[11px] text-gray-400 hover:text-red-500 hover:underline shrink-0">Uninstall</button>
                      </div>
                    )
                  })}
                  {items.length === 0 && <div className="text-[11px] text-gray-400">Nothing recorded on this machine.</div>}
                  {addFor === a.id ? (
                    <div className="flex items-center gap-2 pt-1">
                      <select value={pick} onChange={(e) => setPick(e.target.value)} className="border border-gray-200 rounded-md px-2 py-1 text-xs bg-white flex-1">
                        <option value="">Pick a license…</option>
                        {licenses.filter((l) => !items.some((i) => i.licenseId === l.id)).map((l) => (
                          <option key={l.id} value={l.id}>{l.name} ({installCount(l.id)}/{l.seats} deployed)</option>
                        ))}
                      </select>
                      <button onClick={() => addInstall(a.id)} className="text-xs bg-brand text-white px-2.5 py-1 rounded-md">Add</button>
                      <button onClick={() => setAddFor(null)} className="text-xs text-gray-500 border rounded-md px-2.5 py-1">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => { setAddFor(a.id); setPick('') }} className="flex items-center gap-1 text-[11px] text-brand hover:underline pt-1">
                      <Plus size={11} /> Record install
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {activeAssets.length === 0 && <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No active assets in the registry.</div>}
      </div>

      <p className="text-[11px] text-gray-400">Phase 2: automatic install inventory via an endpoint agent — this register is maintained by hand until then.</p>
    </div>
  )
}
