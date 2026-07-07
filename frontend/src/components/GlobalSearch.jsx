import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useNotifications } from './NotificationsBell'
import { EMPLOYEES } from '../data/hrData'
import { INITIAL_COMPANIES, INITIAL_CONTACTS } from '../data/crmData'
import { INITIAL_RFPS } from '../data/rfpData'

// Global search (Ctrl/Cmd-K or the magnifier) — one box over people, projects,
// companies, contacts, RFPs and module screens. Projects come from the LIVE
// lifted state (via the notifications context), so a project created this
// session is findable; the other sources are the seed registers. Full-text
// search over register contents (letters, invoices, tasks…) is Phase 2.

const MODULE_SCREENS = [
  { label: 'CRM — Pipeline', to: '/crm' }, { label: 'CRM — Companies', to: '/crm' }, { label: 'CRM — Proposals (RFPs)', to: '/crm' },
  { label: 'HR — People', to: '/hr' }, { label: 'HR — My timesheet', to: '/hr' }, { label: 'HR — Leave planner', to: '/hr' }, { label: 'HR — Payroll', to: '/hr' },
  { label: 'Projects — My Work', to: '/projects' }, { label: 'Projects — Management dashboard', to: '/projects' }, { label: 'Projects — Resource planner', to: '/projects' },
  { label: 'IT & Assets', to: '/it' }, { label: 'Marketing', to: '/marketing' }, { label: 'Financials', to: '/finance' },
  { label: 'Office Administration — Correspondence', to: '/office' }, { label: 'Admin Center', to: '/admin' },
]

export default function GlobalSearch() {
  const ctx = useNotifications()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(true) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 0) }, [open])

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (query.length < 2) return []
    const has = (...fields) => fields.some((f) => (f || '').toLowerCase().includes(query))
    const out = []
    const projects = ctx?.sources?.projects || []
    projects.filter((p) => has(p.name, p.projectNo, p.employer)).slice(0, 5).forEach((p) => out.push({ kind: 'Project', label: `${p.projectNo} — ${p.name}`, sub: p.employer, to: `/projects/${p.id}` }))
    EMPLOYEES.filter((e) => has(e.name, e.title, e.dept)).slice(0, 5).forEach((e) => out.push({ kind: 'Person', label: e.name, sub: `${e.title || ''} · ${e.dept || ''}`, to: '/hr' }))
    INITIAL_COMPANIES.filter((c) => has(c.name, c.industry)).slice(0, 4).forEach((c) => out.push({ kind: 'Company', label: c.name, sub: c.industry, to: '/crm' }))
    INITIAL_CONTACTS.filter((c) => has(c.name, c.email)).slice(0, 4).forEach((c) => out.push({ kind: 'Contact', label: c.name, sub: c.email, to: '/crm' }))
    INITIAL_RFPS.filter((r) => has(r.shortName, r.name, r.refNo, r.employer)).slice(0, 4).forEach((r) => out.push({ kind: 'RFP', label: `${r.refNo} — ${r.shortName}`, sub: r.employer, to: '/crm' }))
    MODULE_SCREENS.filter((m) => has(m.label)).slice(0, 5).forEach((m) => out.push({ kind: 'Screen', label: m.label, sub: 'Go to screen', to: m.to }))
    return out.slice(0, 16)
  }, [q, ctx])

  const KIND_COLOR = {
    Project: 'bg-indigo-100 text-indigo-700', Person: 'bg-emerald-100 text-emerald-700', Company: 'bg-blue-100 text-blue-700',
    Contact: 'bg-cyan-100 text-cyan-700', RFP: 'bg-amber-100 text-amber-700', Screen: 'bg-gray-200 text-gray-600',
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-gray-400 hover:text-brand transition p-2 rounded-lg hover:bg-brand-light" title="Search everything (Ctrl+K)">
        <Search size={18} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center pt-[12vh] px-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <Search size={16} className="text-gray-400" />
              <input
                ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search people, projects, companies, RFPs, screens…"
                className="flex-1 text-sm outline-none placeholder:text-gray-400"
              />
              <kbd className="text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">Esc</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {q.trim().length < 2 && <div className="px-4 py-6 text-center text-xs text-gray-400">Type at least two characters. Tip: Ctrl+K opens this from anywhere.</div>}
              {q.trim().length >= 2 && results.length === 0 && <div className="px-4 py-6 text-center text-xs text-gray-400">No matches. Full-text search inside registers (letters, invoices, tasks) arrives with the Phase 2 backend.</div>}
              {results.map((r, i) => (
                <button key={`${r.kind}:${r.label}:${i}`} onClick={() => { setOpen(false); setQ(''); navigate(r.to) }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium w-16 text-center flex-shrink-0 ${KIND_COLOR[r.kind]}`}>{r.kind}</span>
                  <span className="min-w-0">
                    <span className="block text-sm text-gray-800 truncate">{r.label}</span>
                    {r.sub && <span className="block text-[11px] text-gray-500 truncate">{r.sub}</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
