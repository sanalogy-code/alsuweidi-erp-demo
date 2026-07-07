import { useState } from 'react'
import { Plus, Car } from 'lucide-react'
import { VEHICLES } from '../../data/officeData'

// Company vehicles — booking log (with km out/in) and a Salik/fines register
// per vehicle. Payroll deduction is display-only; the RTA/Salik feed is
// Phase 2 (entries keyed by hand until then).

export default function VehiclesView({ bookings, onChangeBookings, salik, onChangeSalik, user }) {
  const [tab, setTab] = useState('bookings')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ vehicleId: VEHICLES[0].id, driver: user?.name || '', date: new Date().toISOString().slice(0, 10), purpose: '', kmOut: '' })
  const [salikForm, setSalikForm] = useState({ vehicleId: VEHICLES[0].id, date: new Date().toISOString().slice(0, 10), type: 'salik', amountAed: 4, driver: '', deductFromPayroll: false, note: '' })

  const vehicle = (id) => VEHICLES.find((v) => v.id === id)

  const addBooking = () => {
    if (!form.driver.trim() || !form.purpose.trim()) return
    onChangeBookings([{
      id: Math.max(0, ...bookings.map((b) => b.id)) + 1,
      ...form, vehicleId: Number(form.vehicleId), kmOut: form.kmOut ? Number(form.kmOut) : null, kmIn: null,
    }, ...bookings])
    setForm({ vehicleId: VEHICLES[0].id, driver: user?.name || '', date: new Date().toISOString().slice(0, 10), purpose: '', kmOut: '' })
    setShowAdd(false)
  }

  const addSalik = () => {
    if (!salikForm.driver.trim() || !salikForm.amountAed) return
    onChangeSalik([{
      id: Math.max(0, ...salik.map((s) => s.id)) + 1,
      ...salikForm, vehicleId: Number(salikForm.vehicleId), amountAed: Number(salikForm.amountAed), note: salikForm.note.trim() || null,
    }, ...salik])
    setSalikForm({ vehicleId: VEHICLES[0].id, date: new Date().toISOString().slice(0, 10), type: 'salik', amountAed: 4, driver: '', deductFromPayroll: false, note: '' })
    setShowAdd(false)
  }

  const returnVehicle = (b) => {
    const km = window.prompt('Km reading on return?', b.kmOut ? String(b.kmOut + 50) : '')
    if (km === null) return
    onChangeBookings(bookings.map((x) => (x.id === b.id ? { ...x, kmIn: Number(km) || null } : x)))
  }

  const salikTotal = salik.reduce((sum, s) => sum + s.amountAed, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Company vehicles</h2>
          <p className="text-xs text-gray-500">Pool car bookings plus the Salik &amp; fines register (AED {salikTotal.toLocaleString()} logged this period).</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium bg-brand text-white px-2.5 py-1.5 rounded-md hover:bg-brand-dark transition">
          <Plus size={13} /> {tab === 'bookings' ? 'Book a vehicle' : 'Log Salik / fine'}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {VEHICLES.map((v) => (
          <div key={v.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
            <Car size={16} className="text-gray-400 shrink-0" />
            <span className="flex-1 min-w-0">
              <span className="block text-sm text-gray-800">{v.model} <span className="text-gray-400">· {v.color}</span></span>
              <span className="text-xs text-gray-400">{v.assignment}</span>
            </span>
            <span className="font-mono text-xs text-gray-600 bg-gray-100 rounded px-2 py-0.5 shrink-0">{v.plate}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 text-xs">
        {[['bookings', 'Booking log'], ['salik', 'Salik & fines']].map(([k, label]) => (
          <button key={k} onClick={() => { setTab(k); setShowAdd(false) }} className={`px-2.5 py-1 rounded-md border ${tab === k ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-500'}`}>{label}</button>
        ))}
      </div>

      {showAdd && tab === 'bookings' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <div className="grid sm:grid-cols-2 gap-2">
            <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className="border rounded-md px-2 py-1.5">
              {VEHICLES.map((v) => <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>)}
            </select>
            <input value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} placeholder="Driver *" className="border rounded-md px-2.5 py-1.5" />
            <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Purpose *" className="border rounded-md px-2.5 py-1.5" />
            <div className="flex gap-2">
              <label className="text-gray-500 flex-1">Date <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border rounded-md px-2 py-1 w-full" /></label>
              <label className="text-gray-500 flex-1">Km out <input type="number" value={form.kmOut} onChange={(e) => setForm({ ...form, kmOut: e.target.value })} className="border rounded-md px-2 py-1 w-full" /></label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={addBooking} className="px-3 py-1.5 rounded-md bg-brand text-white">Book</button>
          </div>
        </div>
      )}

      {showAdd && tab === 'salik' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <div className="grid sm:grid-cols-2 gap-2">
            <select value={salikForm.vehicleId} onChange={(e) => setSalikForm({ ...salikForm, vehicleId: e.target.value })} className="border rounded-md px-2 py-1.5">
              {VEHICLES.map((v) => <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>)}
            </select>
            <select value={salikForm.type} onChange={(e) => setSalikForm({ ...salikForm, type: e.target.value })} className="border rounded-md px-2 py-1.5">
              <option value="salik">Salik (toll)</option><option value="fine">Traffic fine</option>
            </select>
            <input value={salikForm.driver} onChange={(e) => setSalikForm({ ...salikForm, driver: e.target.value })} placeholder="Driver *" className="border rounded-md px-2.5 py-1.5" />
            <div className="flex gap-2">
              <label className="text-gray-500 flex-1">Date <input type="date" value={salikForm.date} onChange={(e) => setSalikForm({ ...salikForm, date: e.target.value })} className="border rounded-md px-2 py-1 w-full" /></label>
              <label className="text-gray-500 flex-1">AED <input type="number" value={salikForm.amountAed} onChange={(e) => setSalikForm({ ...salikForm, amountAed: e.target.value })} className="border rounded-md px-2 py-1 w-full" /></label>
            </div>
            <input value={salikForm.note} onChange={(e) => setSalikForm({ ...salikForm, note: e.target.value })} placeholder="Note (gate / violation)" className="border rounded-md px-2.5 py-1.5" />
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" checked={salikForm.deductFromPayroll} onChange={(e) => setSalikForm({ ...salikForm, deductFromPayroll: e.target.checked })} />
              Deduct from payroll (display-only — Phase 2 payroll link)
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={addSalik} className="px-3 py-1.5 rounded-md bg-brand text-white">Log</button>
          </div>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="space-y-2">
          {[...bookings].sort((a, b) => b.date.localeCompare(a.date)).map((b) => {
            const v = vehicle(b.vehicleId)
            const out = b.kmIn === null || b.kmIn === undefined
            return (
              <div key={b.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs text-gray-500 w-24 shrink-0">{v?.plate}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-gray-800 truncate">{b.purpose}</span>
                    <span className="text-xs text-gray-400">
                      {b.driver}{b.kmOut != null ? ` · out ${b.kmOut.toLocaleString()} km` : ''}{b.kmIn != null ? ` · in ${b.kmIn.toLocaleString()} km (${(b.kmIn - b.kmOut).toLocaleString()} driven)` : ''}
                    </span>
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{b.date}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${out ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{out ? 'Out / booked' : 'Returned'}</span>
                  {out && <button onClick={() => returnVehicle(b)} className="text-[11px] text-brand hover:underline shrink-0">Log return</button>}
                </div>
              </div>
            )
          })}
          {bookings.length === 0 && <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No vehicle bookings yet.</div>}
        </div>
      )}

      {tab === 'salik' && (
        <div className="space-y-2">
          {[...salik].sort((a, b) => b.date.localeCompare(a.date)).map((s) => {
            const v = vehicle(s.vehicleId)
            return (
              <div key={s.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs text-gray-500 w-24 shrink-0">{v?.plate}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-gray-800">{s.type === 'salik' ? 'Salik toll' : 'Traffic fine'} — AED {s.amountAed.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">{s.driver}{s.note ? ` · ${s.note}` : ''}</span>
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{s.date}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${s.type === 'fine' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{s.type === 'fine' ? 'Fine' : 'Salik'}</span>
                  {s.deductFromPayroll && <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">Payroll deduction</span>}
                </div>
              </div>
            )
          })}
          {salik.length === 0 && <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">No Salik or fine entries.</div>}
          <p className="text-[11px] text-gray-400">Phase 2: automatic RTA / Salik feed per plate — entries here are keyed by hand until then. Payroll deduction flag is display-only.</p>
        </div>
      )}
    </div>
  )
}
