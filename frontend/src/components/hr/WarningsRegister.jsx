import { useState } from 'react'
import { ShieldAlert, Printer, Plus, Search } from 'lucide-react'
import { WARNING_LEVELS, WARNING_CATEGORIES } from '../../data/hrTalentData'

// Disciplinary / warning letters register — strictly HR-only (same rule as
// complaints: not even management, since a warning file is between HR, the
// line manager, and the employee).

const levelChip = (level) => {
  const color = level === 'Final written warning' ? 'bg-red-100 text-red-700'
    : level === 'Written warning' ? 'bg-amber-100 text-amber-700'
    : 'bg-gray-100 text-gray-600'
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${color}`}>{level}</span>
}

// Same hidden-iframe letterhead print as certificate letters.
function printWarningLetter(w) {
  const text = [
    `Date: ${w.date}`,
    '',
    `PRIVATE & CONFIDENTIAL`,
    `${w.employeeName}`,
    '',
    `Subject: ${w.level} — ${w.category}`,
    '',
    `Dear ${w.employeeName.split(' ')[0]},`,
    '',
    `This letter serves as a formal ${w.level.toLowerCase()} regarding the following matter:`,
    '',
    w.summary,
    '',
    'In line with UAE Labour Law (Federal Decree-Law No. 33 of 2021) and company policy, this warning is recorded in your personnel file. Continued recurrence may lead to further disciplinary action.',
    '',
    'Please sign below to acknowledge receipt. Acknowledgement does not necessarily indicate agreement.',
    '',
    '',
    `Issued by: ${w.issuedBy}`,
    'ALSUWEIDI Engineering Consultants — Human Resources',
    '',
    'Employee acknowledgement: ______________________    Date: ____________',
  ].join('\n')

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '100%'
  document.body.appendChild(iframe)
  const doc = iframe.contentDocument
  doc.open()
  doc.write(`<!doctype html><html><head><title>ALSUWEIDI — Warning Letter</title><style>
    body { font-family: Georgia, 'Times New Roman', serif; color: #111; margin: 48px 64px; }
    .head { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #c81516; padding-bottom: 14px; margin-bottom: 36px; }
    .logo { font-size: 24px; font-weight: bold; color: #c81516; letter-spacing: 2px; }
    .logo small { display: block; font-size: 11px; color: #555; letter-spacing: 0.5px; font-weight: normal; }
    .addr { font-size: 11px; color: #555; text-align: right; line-height: 1.5; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.8; }
  </style></head><body>
    <div class="head">
      <div class="logo">ALSUWEIDI<small>Engineering Consultants</small></div>
      <div class="addr">Abu Dhabi, United Arab Emirates<br/>hr@alsuweidi.com &nbsp;•&nbsp; +971-2-123-4570</div>
    </div>
    <pre>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>
  </body></html>`)
  doc.close()
  iframe.contentWindow.focus()
  iframe.contentWindow.print()
  setTimeout(() => document.body.removeChild(iframe), 2000)
}

const EMPTY_FORM = { employeeId: '', level: WARNING_LEVELS[0], category: WARNING_CATEGORIES[0], date: '', summary: '' }

export default function WarningsRegister({ warnings, employees, onIssue, onAcknowledge, user }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')

  const q = search.toLowerCase()
  const rows = warnings
    .filter((w) => levelFilter === 'all' || w.level === levelFilter)
    .filter((w) => !q || w.employeeName.toLowerCase().includes(q) || w.category.toLowerCase().includes(q) || w.summary.toLowerCase().includes(q))
    .sort((a, b) => b.date.localeCompare(a.date))

  const canSubmit = form.employeeId && form.date && form.summary.trim()

  const submit = () => {
    const emp = employees.find((e) => e.id === Number(form.employeeId))
    onIssue({
      employeeId: emp.id,
      employeeName: emp.name,
      level: form.level,
      category: form.category,
      date: form.date,
      summary: form.summary.trim(),
      issuedBy: user?.username || 'HR',
      acknowledged: false,
      acknowledgedDate: null,
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><ShieldAlert size={15} className="text-brand" /> Disciplinary register</h2>
          <p className="text-xs text-gray-500">Verbal, written, and final warnings — visible to HR only, like concerns. Letters print on company letterhead for wet signature.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-3 py-1.5 text-xs font-medium text-white bg-brand rounded-md hover:bg-brand-dark flex items-center gap-1.5">
          <Plus size={13} /> Issue warning
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Employee</label>
              <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="w-full border border-gray-300 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                <option value="">Select employee…</option>
                {employees.filter((e) => e.status === 'active').map((e) => <option key={e.id} value={e.id}>{e.name} — {e.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date of issue</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border border-gray-300 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Level</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full border border-gray-300 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                {WARNING_LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                {WARNING_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Summary of the incident / pattern</label>
            <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" placeholder="What happened, when, and what improvement is expected…" />
          </div>
          <div className="flex gap-2">
            <button disabled={!canSubmit} onClick={submit} className="px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-dark disabled:opacity-40">Record warning</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by employee, category, or text…" className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
        </div>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="border border-gray-300 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
          <option value="all">All levels</option>
          {WARNING_LEVELS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-100">
        {rows.map((w) => (
          <div key={w.id} className="p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800">{w.employeeName} <span className="text-gray-400 font-normal">· {w.category}</span></div>
                <div className="text-xs text-gray-500 mt-0.5">{w.summary}</div>
                <div className="text-[11px] text-gray-400 mt-1">Issued {w.date} by {w.issuedBy}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {levelChip(w.level)}
                {w.acknowledged
                  ? <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Acknowledged {w.acknowledgedDate}</span>
                  : (
                    <button onClick={() => onAcknowledge(w.id)} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200" title="Mark signed copy received">
                      Awaiting acknowledgement — mark received
                    </button>
                  )}
                <button onClick={() => printWarningLetter(w)} className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-1">
                  <Printer size={13} /> Print letter
                </button>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No warnings on record{search || levelFilter !== 'all' ? ' matching the current filters' : ''}.</div>}
      </div>
    </div>
  )
}
