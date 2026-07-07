import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Pencil, Paperclip } from 'lucide-react'
import Modal from '../crm/Modal'
import { CONTENT_TYPES, CONTENT_CHANNELS, CONTENT_STATUSES } from '../../data/marketingData'
import { parseLocalDate, todayLocal } from '../../utils/date'

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

// The content IS the copy + media; the title is just an internal reference.
const emptyForm = { title: '', type: CONTENT_TYPES[0], channel: CONTENT_CHANNELS[0], date: '', owner: '', relatedProjectId: '', copy: '', media: '', notes: '' }

// Display label for calendar cells and list rows — title if given, else the copy.
const refLabel = (c) => c.title || c.copy || '(untitled)'

// Relative age/countdown for the list's right-aligned date column.
const relDays = (iso) => {
  const n = Math.round((parseLocalDate(iso) - todayLocal()) / (1000 * 60 * 60 * 24))
  return n === 0 ? 'today' : n > 0 ? `in ${n}d` : `${-n}d ago`
}

const fmtShort = (iso) => parseLocalDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

export default function ContentCalendar({ items, projects = [], user, onAdd, onUpdate }) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7)) // YYYY-MM
  const [range, setRange] = useState('month') // 'month' | 'custom'
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
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

  // Search matches title, copy, and owner — applied to both the calendar grid and the list.
  const matchesSearch = (c) => {
    const q = search.trim().toLowerCase()
    return !q || (c.title || '').toLowerCase().includes(q) || (c.copy || '').toLowerCase().includes(q) || (c.owner || '').toLowerCase().includes(q)
  }

  const itemsOn = (day) => items.filter((c) => c.date === `${month}-${String(day).padStart(2, '0')}`).filter(matchesSearch)

  // Custom From/To range — same pattern as CRM Pipeline/Reports.
  const inRange = (c) => {
    if (range === 'month') return c.date.startsWith(month)
    if (customStart && c.date < customStart) return false
    if (customEnd && c.date > customEnd) return false
    return true
  }

  const listItems = items
    .filter(inRange)
    .filter((c) => !statusFilter || c.status === statusFilter)
    .filter(matchesSearch)
    .sort((a, b) => a.date.localeCompare(b.date))

  const listLabel = range === 'month'
    ? monthLabel
    : (customStart || customEnd) ? `${customStart || '…'} to ${customEnd || '…'}` : 'All dates'

  const openEditor = (item) => {
    if (item) {
      setForm({
        title: item.title || '', type: item.type, channel: item.channel, date: item.date,
        owner: item.owner, relatedProjectId: item.relatedProjectId ?? '',
        copy: item.copy || '', media: item.media || '', notes: item.notes || '',
      })
      setEditing(item)
    } else {
      setForm({ ...emptyForm, owner: user?.username || 'Marketing', date: range === 'month' ? `${month}-15` : '' })
      setEditing('new')
    }
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const save = (e) => {
    e.preventDefault()
    // Copy and media are the content — but an early idea may have neither yet,
    // so require a date plus at least the copy or a reference title.
    if (!form.date || (!form.copy.trim() && !form.title.trim())) return
    const record = {
      title: form.title.trim(),
      type: form.type,
      channel: form.channel,
      date: form.date,
      owner: form.owner.trim() || 'Marketing',
      relatedProjectId: form.relatedProjectId ? Number(form.relatedProjectId) : null,
      copy: form.copy.trim(),
      media: form.media.trim(),
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
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <CalendarDays size={15} className="text-brand" /> Content calendar
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, copy, owner…" className="text-sm border border-gray-300 rounded-md px-2.5 py-1.5 bg-white w-52 focus:outline-none focus:ring-1 focus:ring-brand" />
            <select
              value={range}
              onChange={(e) => { setRange(e.target.value); if (e.target.value !== 'custom') { setCustomStart(''); setCustomEnd('') } }}
              className="border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="month">Month view</option>
              <option value="custom">Custom range</option>
            </select>
            {range === 'month' ? (
              <>
                <button onClick={() => moveMonth(-1)} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronLeft size={16} /></button>
                <span className="text-sm font-medium text-gray-700 w-32 text-center">{monthLabel}</span>
                <button onClick={() => moveMonth(1)} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ChevronRight size={16} /></button>
              </>
            ) : (
              <>
                <label className="text-xs text-gray-500">From</label>
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand" />
                <label className="text-xs text-gray-500">To</label>
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand" />
              </>
            )}
            <button
              onClick={() => openEditor(null)}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-white hover:bg-brand-dark transition"
            >
              <Plus size={13} /> New content
            </button>
          </div>
        </div>

        {range === 'month' && (
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
                          title={refLabel(c)}
                        >
                          {refLabel(c)}
                        </button>
                      ))}
                      {dayItems.length > 2 && <div className="text-[10px] text-gray-400">+{dayItems.length - 2} more</div>}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">{listLabel} — {listItems.length} item{listItems.length !== 1 ? 's' : ''}</h3>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand">
            <option value="">All statuses</option>
            {Object.entries(CONTENT_STATUSES).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
          </select>
        </div>
        {listItems.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Nothing planned {range === 'month' ? 'this month' : 'in this range'}.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Fixed-width columns (type+status / content / date / actions) — Batch 5 house style */}
            {listItems.map((c) => {
              const project = projects.find((p) => p.id === c.relatedProjectId)
              const action = NEXT_ACTION[c.status]
              return (
                <div key={c.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-32 shrink-0 flex flex-col items-start gap-1">
                    <span className="max-w-full px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 truncate">{c.type}</span>
                    <span className={`max-w-full px-2 py-0.5 rounded text-[10px] font-medium truncate ${CONTENT_STATUSES[c.status].chip}`}>{CONTENT_STATUSES[c.status].label}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{refLabel(c)}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {c.channel} • {c.owner}
                      {project && <span className="text-brand"> • {project.projectNo} {project.name}</span>}
                    </div>
                    {c.media && (
                      <div className="text-xs text-gray-400 truncate flex items-center gap-1"><Paperclip size={10} className="shrink-0" /> {c.media}</div>
                    )}
                  </div>
                  <div className="w-20 shrink-0 text-right">
                    <div className="text-xs text-gray-600 whitespace-nowrap">{fmtShort(c.date)}</div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">{relDays(c.date)}</div>
                  </div>
                  <div className="w-36 shrink-0 flex items-center justify-end gap-3">
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
              <label className={labelCls}>Copy — the content itself</label>
              <textarea rows={4} value={form.copy} onChange={set('copy')} placeholder="Write the post / article / email copy here…" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Media — attached image/asset (file name only until Phase 2 storage)</label>
              <input value={form.media} onChange={set('media')} placeholder="e.g. project-hero.jpg" className={`${inputCls} font-mono text-xs`} />
            </div>
            <div>
              <label className={labelCls}>Title (optional — internal reference only)</label>
              <input value={form.title} onChange={set('title')} className={inputCls} />
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
            {!form.copy.trim() && !form.title.trim() && (
              <p className="text-[11px] text-amber-600">Add the copy (or at least a reference title) before saving.</p>
            )}
            <button type="submit" className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark">
              {editing === 'new' ? 'Add to calendar' : 'Save changes'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
