import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HelpCircle, X, Search, ArrowRight, Compass, ListChecks, LayoutGrid } from 'lucide-react'
import { HELP_MODULES, HELP_TASKS, ROLE_GUIDE, moduleForPath } from '../data/helpData'

// The in-app Guide — a single help hub opened from the ? in every navbar,
// contextual to the current module. Three lenses: your role, "How do I…" task
// recipes (with deep-link jump buttons), and the module map. One content source
// (data/helpData.js), maintained at module granularity — see the note there.

const moduleLabel = (key) => HELP_MODULES.find((m) => m.key === key)?.label || key
const taskVisibleTo = (t, role) => !t.roles || t.roles.includes('*') || t.roles.includes(role)

export default function HelpHub() {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [lens, setLens] = useState('tasks')
  const [scope, setScope] = useState('all') // module key or 'all' for the How-do-I list
  const [q, setQ] = useState('')

  let user = null
  try { user = JSON.parse(localStorage.getItem('erp_demo_user') || 'null') } catch { /* ignore */ }
  const role = user?.role
  const currentModule = moduleForPath(location.pathname)

  // Opening the hub defaults its scope to the module you're currently in.
  const openHub = () => { setScope(currentModule); setLens('tasks'); setQ(''); setOpen(true) }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
      // Shift+? (i.e. "?") opens help, but not while typing in a field.
      if (e.key === '?' && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) { e.preventDefault(); openHub() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }) // eslint-disable-line react-hooks/exhaustive-deps

  const tasks = useMemo(() => {
    const query = q.trim().toLowerCase()
    return HELP_TASKS
      .filter((t) => taskVisibleTo(t, role))
      .filter((t) => scope === 'all' || t.module === scope)
      .filter((t) => !query || t.label.toLowerCase().includes(query) || t.steps.some((s) => s.toLowerCase().includes(query)) || moduleLabel(t.module).toLowerCase().includes(query))
  }, [q, scope, role])

  const roleGuide = role && ROLE_GUIDE[role]
  const orderedModules = useMemo(() => {
    const pref = roleGuide?.modules || []
    return [...HELP_MODULES].sort((a, b) => {
      const ai = pref.indexOf(a.key), bi = pref.indexOf(b.key)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  }, [roleGuide])

  const go = (to) => {
    setOpen(false)
    if (to) navigate(to.path, to.view ? { state: { view: to.view } } : undefined)
  }

  const LENSES = [
    { key: 'role', label: 'For my role', icon: Compass },
    { key: 'tasks', label: 'How do I…', icon: ListChecks },
    { key: 'modules', label: 'Modules', icon: LayoutGrid },
  ]

  return (
    <>
      <button onClick={openHub} className="text-gray-400 hover:text-brand transition p-2 rounded-lg hover:bg-brand-light" title="Help & guide (?)">
        <HelpCircle size={18} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center pt-[8vh] px-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[82vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <HelpCircle size={17} className="text-brand" />
                <span className="text-sm font-semibold text-gray-800">Guide</span>
                <span className="text-[11px] text-gray-400">how to use this ERP</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>

            {/* lens tabs */}
            <div className="flex gap-1 px-4 pt-3">
              {LENSES.map((l) => (
                <button key={l.key} onClick={() => setLens(l.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${lens === l.key ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <l.icon size={13} /> {l.label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto px-5 py-4 flex-1">
              {/* ---- For my role ---- */}
              {lens === 'role' && (
                <div className="space-y-4">
                  {roleGuide ? (
                    <div className="rounded-lg bg-brand/5 border border-brand/15 px-4 py-3">
                      <div className="text-xs font-semibold text-brand uppercase tracking-wide mb-1">You’re signed in as {roleGuide.label}</div>
                      <p className="text-sm text-gray-700 leading-relaxed">{roleGuide.intro}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Pick a role at login to see a tailored orientation. Meanwhile, browse “How do I…” or the module map.</p>
                  )}
                  <div>
                    <div className="text-[11px] font-medium text-gray-400 uppercase mb-2">Your main modules</div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {orderedModules.filter((m) => !roleGuide || roleGuide.modules.includes(m.key)).map((m) => (
                        <button key={m.key} onClick={() => go({ path: m.path })} className="text-left rounded-lg border border-gray-200 hover:border-brand hover:shadow-sm transition px-3 py-2">
                          <div className="text-sm font-medium text-gray-800">{m.icon} {m.label}</div>
                          <div className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{m.blurb}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ---- How do I… ---- */}
              {lens === 'tasks' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-1 min-w-[180px] border border-gray-300 rounded-md px-2.5 py-1.5">
                      <Search size={14} className="text-gray-400" />
                      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks — e.g. timesheet, invoice, WIR…" className="text-sm outline-none flex-1 placeholder:text-gray-400" />
                    </div>
                    <select value={scope} onChange={(e) => setScope(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white">
                      <option value="all">All modules</option>
                      {HELP_MODULES.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                    </select>
                  </div>
                  {scope !== 'all' && scope === currentModule && !q && (
                    <div className="text-[11px] text-gray-400">Showing {moduleLabel(scope)} (where you are). <button onClick={() => setScope('all')} className="text-brand hover:underline">Show all</button></div>
                  )}
                  {tasks.length === 0 && <div className="text-center text-xs text-gray-400 py-8">No tasks match. Try “All modules”, or use the Feedback button to ask for a how-to.</div>}
                  <div className="space-y-2.5">
                    {tasks.map((t) => (
                      <div key={t.id} className="rounded-lg border border-gray-200 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-800">{t.label}</div>
                            <span className="inline-block text-[10px] font-medium text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 mt-1">{moduleLabel(t.module)}</span>
                          </div>
                          {t.to && (
                            <button onClick={() => go(t.to)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline shrink-0 whitespace-nowrap">
                              Take me there <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                        <ol className="mt-2 space-y-1 list-decimal list-inside">
                          {t.steps.map((s, i) => <li key={i} className="text-xs text-gray-600 leading-relaxed">{s}</li>)}
                        </ol>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---- Module map ---- */}
              {lens === 'modules' && (
                <div className="space-y-2">
                  {orderedModules.map((m) => (
                    <button key={m.key} onClick={() => go({ path: m.path })} className="w-full text-left rounded-lg border border-gray-200 hover:border-brand hover:shadow-sm transition px-4 py-3 flex items-start gap-3">
                      <span className="text-lg leading-none mt-0.5">{m.icon}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-800">{m.label}</span>
                        <span className="block text-xs text-gray-500 leading-relaxed">{m.blurb}</span>
                      </span>
                      <ArrowRight size={14} className="text-gray-300 shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400">
              Press <kbd className="border border-gray-200 rounded px-1">?</kbd> anywhere to open this. Ctrl+K searches records; the bell shows what needs you.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
