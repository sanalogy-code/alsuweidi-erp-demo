import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Pencil } from 'lucide-react'
import Modal from '../crm/Modal'
import { CONTENT_TYPES, CONTENT_CHANNELS, CONTENT_STATUSES } from '../../data/marketingData'
import { parseLocalDate } from '../../utils/date'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

// Status workflow: idea → draft → pending_approval → approved → published.
// Approval is by top management / marketing lead — in the demo anyone in the
// Marketing workspace can action every step.
const NEXT_ACTION = {
  idea: { next: 'draft', label: 'Start draft' },
  draft: { next: 'pending_approval', label: 'Submit for approval' },
  pending_approval: { next: 'approved', label: 'Approve' },
  approved: { next: 'published', label: 'Mark published' },
}

const emptyForm = { title: '', type: CONTENT_TYPES[0], channel: CONTENT_CHANNELS[0], date: '', owner: '', relatedProjectId: '', notes: '' }

export default function ContentCalendar({ items, projects = [], user, onAdd, onUpdate }) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7)) // YYYY-MM
  const [statusFilter, setStatusFilter] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | item
  const [form, setForm] = useState(emptyForm)

  const [year, monthNum] = month.split('-').map(Number)
  const monthLabel = new Date(year, monthNum - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  const moveMonth = (delta) => {
    const d = new Date(year, monthNum - 1 + delta, 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  // Calendar grid — weeks starting Monday
  const firstDay = new Date(year, monthNum - 1, 1)
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  const leadBlanks = (firstDay.getDay() + 6) % 7
  const cells = [...Array(leadBlanks).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const itemsOn = (day) => items.filter((c) => c.date === `${month}-${String(day).padStart(2, '0')}`)

  const monthItems = items
    .filter((c) => c.date.startsWith(month))
    .filter((c) => !statusFilter || c.status === statusFilter)
    .sort((a, b) => a.date.localeCompare(b.date))

  const openEditor = (item) => {
    if (item) {
      setForm({ title: item.title, type: item.type, channel: item.channel, date: item.date, owner: item.owner, relatedProjectId: item.relatedProjectId ?? '', notes: item.notes || '' })
      setEditing(item)
    } else {
      setForm({ ...emptyForm, owner: user?.username || 'Marketing', date: `${month}-15` })
      setEditing('new')
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const save = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) return
    const record = {
      title: form.title.trim(),
      type: form.type,
      channel: form.channel,
      date: form.date,
      owner: form.owner.trim() || 'Marketing',
      relatedProjectId: form.relatedProjectId ? Number(form.relatedProjectId) : null,
      notes: form.notes.trim(),
    }
    if (editing === 'new') onAdd({ ...record, status: 'idea' })
    else onUpdate({ ...editing, ...record })
    setEditing(null)
  }

  const advance = (item) => {
    const action = NEXT_ACTION[item.status]
    if (action) onUpdate({ ...item, status: action.next })
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <CalendarDays size={15} className="text-brand" /> Content calendar
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => moveMonth(-1)} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium text-gray-700 w-32 text-center">{monthLabel}</span>
            <button onClick={() => moveMonth(1)} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronRight size={16} /></button>
            <button
              onClick={() => openEditor(null)}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-white hover:bg-brand-dark transition"
            >
              <Plus size={13} /> New content
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-md overflow-hidden text-xs">
          {WEEKDAYS.map((d) => (
            <div key={d} className="bg-gray-50 px-2 py-1.5 font-semibold text-gray-500 text-center">{d}</div>
          ))}
          {cells.map((day, idx) => {
            const dayItems = day ? itemsOn(day) : []
            const isWeekend = idx % 7 >= 5
            return (
              <div key={idx} className={`min-h-[64px] p-1.5 ${day ? (isWeekend ? 'bg-gray-50' : 'bg-white') : 'bg-gray-50'}`}>
                {day && (
                  <>
                    <div className="text-[10px] text-gray-400 mb-1">{day}</div>
                    {dayItems.slice(0, 2).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => openEditor(c)}
                        className={`w-full text-left truncate rounded px-1 py-0.5 mb-0.5 text-[10px] font-medium ${CONTENT_STATUSES[c.status].chip} hover:opacity-75`}
                        title={c.title}
                      >
                        {c.title}
                      </button>
                    ))}
                    {dayItems.length > 2 && <div className="text-[10px] text-gray-400">+{dayItems.length - 2} more</div>}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">{monthLabel} — {monthItems.length} item{monthItems.length !== 1 ? 's' : ''}</h3>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand">
            <option value="">All statuses</option>
            {Object.entries(CONTENT_STATUSES).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
          </select>
        </div>
        {monthItems.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Nothing planned this month.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {monthItems.map((c) => {
              const project = projects.find((p) => p.id === c.relatedProjectId)
              const action = NEXT_ACTION[c.status]
              return (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 truncate">{c.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${CONTENT_STATUSES[c.status].chip}`}>{CONTENT_STATUSES[c.status].label}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {parseLocalDate(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} • {c.type} • {c.channel} • {c.owner}
                      {project && <span className="text-brand"> • {project.projectNo} {project.name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {action && (
                      <button onClick={() => advance(c)} className={`text-xs font-medium hover:underline ${c.status === 'pending_approval' ? 'text-green-700' : 'text-brand'}`}>
                        {action.label}
                      </button>
                    )}
                    <button onClick={() => openEditor(c)} className="text-gray-400 hover:text-gray-600"><Pencil size={13} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'New content item' : 'Edit content item'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-3">
            <div>
              <label className={labelCls}>Title *</label>
              <input required value={form.title} onChange={set('title')} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Type</label>
                <select value={form.type} onChange={set('type')} className={inputCls}>
                  {CONTENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Channel</label>
                <select value={form.channel} onChange={set('channel')} className={inputCls}>
                  {CONTENT_CHANNELS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Publish date *</label>
                <input required type="date" value={form.date} onChange={set('date')} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Owner</label>
                <input value={form.owner} onChange={set('owner')} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Related project (optional)</label>
              <select value={form.relatedProjectId} onChange={set('relatedProjectId')} className={inputCls}>
                <option value="">None</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.projectNo} — {p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <textarea rows={2} value={form.notes} onChange={set('notes')} className={inputCls} />
            </div>
            <button type="submit" className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark">
              {editing === 'new' ? 'Add to calendar' : 'Save changes'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
