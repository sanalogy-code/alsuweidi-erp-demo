import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { MEETING_ROOMS } from '../../data/officeData'

// Meeting-room bookings — day view per room with clash detection on the form.
// The Office module is gated to admin staff for now; "any employee books their
// own room" lands with the notifications/home phase (noted on-screen).

const today = () => new Date().toISOString().slice(0, 10)

export default function RoomBookingsView({ bookings, onChange, user }) {
  const [date, setDate] = useState(today())
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ roomId: MEETING_ROOMS[0].id, date: today(), from: '09:00', to: '10:00', bookedBy: user?.name || '', purpose: '' })

  const clash = (f) => bookings.find((b) =>
    b.roomId === Number(f.roomId) && b.date === f.date && f.from < b.to && f.to > b.from
  )

  const add = () => {
    if (!form.bookedBy.trim() || !form.purpose.trim()) { setError('Booked-by and purpose are both needed.'); return }
    if (form.to <= form.from) { setError('End time must be after start time.'); return }
    const hit = clash(form)
    if (hit) {
      const room = MEETING_ROOMS.find((r) => r.id === Number(form.roomId))
      setError(`${room?.name} is already booked ${hit.from}–${hit.to} that day (${hit.bookedBy} — ${hit.purpose}). Pick another slot or room.`)
      return
    }
    onChange([...bookings, { ...form, id: Math.max(0, ...bookings.map((b) => b.id)) + 1, roomId: Number(form.roomId) }])
    setError('')
    setShowAdd(false)
    setDate(form.date)
    setForm({ roomId: MEETING_ROOMS[0].id, date: today(), from: '09:00', to: '10:00', bookedBy: user?.name || '', purpose: '' })
  }

  const dayBookings = (roomId) => bookings
    .filter((b) => b.roomId === roomId && b.date === date)
    .sort((a, b) => a.from.localeCompare(b.from))

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Meeting rooms</h2>
          <p className="text-xs text-gray-500">Day view per room. Clashing bookings are blocked at entry.</p>
        </div>
        <button onClick={() => { setShowAdd((v) => !v); setError('') }} className="flex items-center gap-1 text-xs font-medium bg-brand text-white px-2.5 py-1.5 rounded-md hover:bg-brand-dark transition">
          <Plus size={13} /> Book a room
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <label className="text-gray-500">Day <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-gray-200 rounded-md px-2 py-1 ml-1 bg-white" /></label>
        <span className="text-gray-400 ml-auto">{bookings.filter((b) => b.date === date).length} booking(s) on this day</span>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <div className="grid sm:grid-cols-2 gap-2">
            <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} className="border rounded-md px-2 py-1.5">
              {MEETING_ROOMS.map((r) => <option key={r.id} value={r.id}>{r.name} (seats {r.capacity})</option>)}
            </select>
            <label className="text-gray-500">Date <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
            <div className="flex gap-2">
              <label className="text-gray-500 flex-1">From <input type="time" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} className="border rounded-md px-2 py-1 w-full" /></label>
              <label className="text-gray-500 flex-1">To <input type="time" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} className="border rounded-md px-2 py-1 w-full" /></label>
            </div>
            <input value={form.bookedBy} onChange={(e) => setForm({ ...form, bookedBy: e.target.value })} placeholder="Booked by *" className="border rounded-md px-2.5 py-1.5" />
            <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Purpose *" className="border rounded-md px-2.5 py-1.5 sm:col-span-2" />
          </div>
          {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded-md px-2.5 py-1.5">{error}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={add} className="px-3 py-1.5 rounded-md bg-brand text-white">Book</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-3">
        {MEETING_ROOMS.map((room) => {
          const items = dayBookings(room.id)
          return (
            <div key={room.id} className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{room.name}</span>
                <span className="text-[11px] text-gray-400 flex items-center gap-1"><Users size={11} /> {room.capacity}</span>
              </div>
              <p className="text-[11px] text-gray-400 mb-2">{room.features}</p>
              <div className="space-y-1.5">
                {items.map((b) => (
                  <div key={b.id} className="rounded-md bg-brand/5 border border-brand/20 px-2 py-1.5">
                    <div className="text-[11px] font-mono text-brand">{b.from}–{b.to}</div>
                    <div className="text-xs text-gray-700 truncate">{b.purpose}</div>
                    <div className="text-[11px] text-gray-400">{b.bookedBy}</div>
                  </div>
                ))}
                {items.length === 0 && <div className="text-[11px] text-gray-400 border border-dashed border-gray-200 rounded-md px-2 py-2 text-center">Free all day</div>}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-gray-400">
        Phase 2: booking opens to every employee from the home screen (with notifications) — for now the Office module is admin-staff, so the ODC books on colleagues&apos; behalf.
      </p>
    </div>
  )
}
