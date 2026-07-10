import { useState } from 'react'
import { Send, CheckCircle2, FileText, Plus, Banknote, Paperclip, FileMinus2 } from 'lucide-react'
import { PROJECTS } from '../../data/projectsData'
import { parseLocalDate, todayISO, fmtShortDate as fmtDate } from '../../utils/date'
import {
  INVOICE_STATUSES, invoiceStatusMeta, invoiceTotal, invoiceOutstanding, fmtAED, VAT_RATE,
} from '../../data/financeData'

export default function InvoicesView({ invoices, onUpdate, onAdd, creditNotes = [], onAddCreditNote, onPayment }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [range, setRange] = useState({ from: '', to: '' })
  const [showAdd, setShowAdd] = useState(false)
  const [payingId, setPayingId] = useState(null)
  const [payAmount, setPayAmount] = useState('')
  const [creditingId, setCreditingId] = useState(null)
  const [cnForm, setCnForm] = useState({ amount: '', reason: '' })
  const [form, setForm] = useState({ clientName: '', projectId: '', description: '', amount: '', issueDate: '', dueDate: '', attachment: '' })
  const projectOf = (id) => PROJECTS.find((p) => p.id === id)

  // Accountant actions (7 Jul: "the accountant can't even log anything"):
  // create draft invoices (VAT auto at 5%, attachment file-name for the PDF/scan)
  // and record partial receipts against an invoice.
  const addInvoice = () => {
    const net = Number(form.amount)
    if (!form.clientName.trim() || !net) return
    const proj = PROJECTS.find((p) => p.id === Number(form.projectId))
    onAdd({
      invoiceNo: `INV-2026-${String(Math.max(0, ...invoices.map((i) => Number(i.invoiceNo.split('-')[2]) || 0)) + 1).padStart(3, '0')}`,
      projectId: proj?.id ?? null, companyId: proj?.companyId ?? null,
      clientName: form.clientName.trim(), description: form.description.trim() || 'Consultancy fees',
      issueDate: form.issueDate || todayISO(),
      dueDate: form.dueDate || null,
      amount: net, vatAmount: Math.round(net * VAT_RATE), amountPaid: 0, status: 'draft', dealId: null,
      attachment: form.attachment.trim() || null,
    })
    setForm({ clientName: '', projectId: '', description: '', amount: '', issueDate: '', dueDate: '', attachment: '' })
    setShowAdd(false)
  }

  // Payments route through onPayment (Finance.jsx), which updates the invoice AND
  // creates a receipt in the Receipts register so the register stays the source of
  // truth for what's been paid. Falls back to a direct update if not wired.
  const applyPayment = (inv, amt) => {
    if (onPayment) return onPayment(inv, amt)
    const newPaid = Math.min((inv.amountPaid ?? 0) + amt, invoiceTotal(inv))
    onUpdate({ ...inv, amountPaid: newPaid, status: newPaid >= invoiceTotal(inv) ? 'paid' : 'partially_paid' })
  }

  const recordPayment = (inv) => {
    const amt = Number(payAmount)
    if (!amt || amt <= 0) return
    applyPayment(inv, Math.min(amt, invoiceOutstanding(inv)))
    setPayingId(null); setPayAmount('')
  }

  // Credit note: reason + amount capped at what's still OUTSTANDING less credits
  // already issued — a CN can't exceed what the client still owes (refunds against
  // paid invoices are a Phase 2 GL flow, so the button hides once fully paid).
  // Ref (CN-2026-NNN) is assigned by Finance.jsx.
  const cnAgainst = (inv) => creditNotes.filter((c) => c.invoiceId === inv.id).reduce((s, c) => s + c.amount, 0)
  const cnMax = (inv) => Math.max(0, invoiceOutstanding(inv) - cnAgainst(inv))
  const issueCreditNote = (inv) => {
    const amt = Number(cnForm.amount)
    if (!onAddCreditNote || !amt || amt <= 0 || !cnForm.reason.trim()) return
    onAddCreditNote({
      invoiceId: inv.id, clientName: inv.clientName, date: todayISO(),
      amount: Math.min(amt, cnMax(inv)), reason: cnForm.reason.trim(),
    })
    setCreditingId(null); setCnForm({ amount: '', reason: '' })
  }

  const shown = invoices
    .filter((i) => statusFilter === 'all' || i.status === statusFilter)
    .filter((i) => (!range.from || i.issueDate >= range.from) && (!range.to || i.issueDate <= range.to))
    .filter((i) => {
      const q = search.trim().toLowerCase()
      return !q || i.invoiceNo.toLowerCase().includes(q) || i.clientName.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q)
    })
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate))

  const totalBilled = invoices.reduce((s, i) => s + invoiceTotal(i), 0)
  const totalOutstanding = invoices
    .filter((i) => i.status !== 'draft')
    .reduce((s, i) => s + invoiceOutstanding(i), 0)

  const send = (inv) => onUpdate({ ...inv, status: 'sent' })
  // Settle in full. If nothing is outstanding but the status is stale (e.g. a
  // seeded amountPaid that already covers the total), still flip it to paid —
  // recordPaymentOnInvoice no-ops on a zero amount, so it can't do this for us.
  const markPaid = (inv) => {
    const due = invoiceOutstanding(inv)
    if (due > 0) return applyPayment(inv, due)
    onUpdate({ ...inv, status: 'paid', amountPaid: invoiceTotal(inv) })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Client invoices</h2>
          <p className="text-sm text-gray-500">Billed against project consultancy fees (design / supervision). Demo data.</p>
        </div>
        <div className="flex items-center gap-2">
          {onAdd && (
            <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium bg-brand text-white px-2.5 py-1.5 rounded-md hover:bg-brand-dark transition">
              <Plus size={13} /> New invoice
            </button>
          )}
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search no, client, description…" className="text-sm border border-gray-300 rounded-md px-2.5 py-1.5 bg-white w-52" />
          <label className="text-xs text-gray-500">From</label>
          <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white" />
          <label className="text-xs text-gray-500">To</label>
          <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white" />
          <label className="text-xs text-gray-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white"
          >
            <option value="all">All</option>
            {INVOICE_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-xs">
          <div className="grid sm:grid-cols-2 gap-2">
            <input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="Client name *" className="border rounded-md px-2.5 py-1.5" />
            <select value={form.projectId} onChange={(e) => { const p = PROJECTS.find((x) => x.id === Number(e.target.value)); setForm({ ...form, projectId: e.target.value, clientName: form.clientName || p?.employer || '' }) }} className="border rounded-md px-2 py-1.5">
              <option value="">Link to project (optional)…</option>
              {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.projectNo} — {p.name}</option>)}
            </select>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (e.g. design fee milestone — IFC)" className="border rounded-md px-2.5 py-1.5 sm:col-span-2" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-gray-500">Net AED <input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-28 border rounded-md px-2 py-1 ml-1 text-right" /></label>
            <span className="text-gray-400">+ 5% VAT = <span className="font-medium text-gray-700">{fmtAED((Number(form.amount) || 0) * (1 + VAT_RATE))}</span></span>
            <label className="text-gray-500">Issue <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
            <label className="text-gray-500">Due <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
            <label className="flex items-center gap-1 text-gray-500"><Paperclip size={11} /><input value={form.attachment} onChange={(e) => setForm({ ...form, attachment: e.target.value })} placeholder="Attachment (invoice PDF/scan file name)" className="w-64 border rounded-md px-2 py-1" /></label>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-md border text-gray-600">Cancel</button>
            <button onClick={addInvoice} className="px-3 py-1.5 rounded-md bg-brand text-white">Create draft invoice</button>
          </div>
        </div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Total billed (incl. VAT)</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{fmtAED(totalBilled, { compact: true })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Outstanding</div>
          <div className="text-lg font-bold text-amber-700 tabular-nums">{fmtAED(totalOutstanding, { compact: true })}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Invoices</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{shown.length}<span className="text-xs font-normal text-gray-400"> of {invoices.length}</span></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2.5 font-medium">Invoice</th>
                <th className="px-4 py-2.5 font-medium">Client / project</th>
                <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                <th className="px-4 py-2.5 font-medium text-right">Due</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shown.map((inv) => {
                const meta = invoiceStatusMeta(inv.status)
                const proj = projectOf(inv.projectId)
                const outstanding = invoiceOutstanding(inv)
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 align-top">
                      <div className="font-mono text-xs text-gray-700">{inv.invoiceNo}</div>
                      <div className="text-[11px] text-gray-400">{fmtDate(inv.issueDate)}</div>
                      {inv.attachment && (
                        <div className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5"><Paperclip size={9} /> {inv.attachment}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-gray-800">{inv.clientName}</div>
                      <div className="text-[11px] text-gray-400 truncate max-w-[220px]">
                        {proj ? `${proj.projectNo} · ${proj.name}` : inv.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <div className="tabular-nums text-gray-900">{fmtAED(invoiceTotal(inv))}</div>
                      {outstanding > 0 && inv.status !== 'draft' && (
                        <div className="text-[11px] text-amber-600 tabular-nums">{fmtAED(outstanding)} due</div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-right text-gray-600 tabular-nums whitespace-nowrap">{fmtDate(inv.dueDate)}</td>
                    <td className="px-4 py-3 align-top">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${meta.chip}`}>{meta.label}</span>
                      {inv.note && <div className="text-[11px] text-gray-400 mt-1 max-w-[200px]">{inv.note}</div>}
                    </td>
                    <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                      {inv.status === 'draft' && (
                        <button onClick={() => send(inv)} className="inline-flex items-center gap-1 text-xs text-brand font-medium hover:underline">
                          <Send size={12} /> Send
                        </button>
                      )}
                      {(inv.status === 'sent' || inv.status === 'partially_paid' || inv.status === 'overdue') && (
                        payingId === inv.id ? (
                          <span className="inline-flex items-center gap-1">
                            <input type="number" min="0" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && recordPayment(inv)} placeholder={String(outstanding)} className="w-24 border rounded-md px-1.5 py-0.5 text-xs text-right" autoFocus />
                            <button onClick={() => recordPayment(inv)} className="text-xs text-emerald-700 font-medium hover:underline">Save</button>
                            <button onClick={() => { setPayingId(null); setPayAmount('') }} className="text-xs text-gray-400 hover:underline">✕</button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <button onClick={() => { setPayingId(inv.id); setPayAmount(String(outstanding)) }} className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium hover:underline">
                              <Banknote size={12} /> Record payment
                            </button>
                            <button onClick={() => markPaid(inv)} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:underline" title="Settle in full">
                              <CheckCircle2 size={12} /> Full
                            </button>
                          </span>
                        )
                      )}
                      {inv.status === 'paid' && <span className="text-[11px] text-gray-300">—</span>}
                      {onAddCreditNote && inv.status !== 'draft' && cnMax(inv) > 0 && (
                        creditingId === inv.id ? (
                          <div className="mt-1.5 flex items-center gap-1 justify-end flex-wrap">
                            <input value={cnForm.reason} onChange={(e) => setCnForm({ ...cnForm, reason: e.target.value })} placeholder="Reason *" className="w-40 border rounded-md px-1.5 py-0.5 text-xs" autoFocus />
                            <input type="number" min="0" max={cnMax(inv)} value={cnForm.amount} onChange={(e) => setCnForm({ ...cnForm, amount: e.target.value })} placeholder={`≤ ${cnMax(inv)}`} className="w-24 border rounded-md px-1.5 py-0.5 text-xs text-right" />
                            <button onClick={() => issueCreditNote(inv)} className="text-xs text-purple-700 font-medium hover:underline">Issue</button>
                            <button onClick={() => { setCreditingId(null); setCnForm({ amount: '', reason: '' }) }} className="text-xs text-gray-400 hover:underline">✕</button>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <button onClick={() => { setCreditingId(inv.id); setPayingId(null) }} className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:underline">
                              <FileMinus2 size={11} /> Credit note
                            </button>
                          </div>
                        )
                      )}
                    </td>
                  </tr>
                )
              })}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    <FileText size={20} className="mx-auto mb-2 opacity-40" />
                    No invoices match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit notes issued */}
      {creditNotes.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 text-[11px] uppercase tracking-wide text-gray-400 font-medium">Credit notes issued</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <tbody className="divide-y divide-gray-50">
                {[...creditNotes].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map((cn) => {
                  const inv = invoices.find((i) => i.id === cn.invoiceId)
                  return (
                    <tr key={cn.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 align-top whitespace-nowrap">
                        <div className="font-mono text-xs text-purple-700">{cn.creditNoteNo}</div>
                        <div className="text-[11px] text-gray-400">{fmtDate(cn.date)}</div>
                      </td>
                      <td className="px-4 py-2.5 align-top">
                        <div className="text-gray-800">{cn.clientName}</div>
                        <div className="text-[11px] text-gray-400">against <span className="font-mono">{inv?.invoiceNo || `invoice #${cn.invoiceId}`}</span></div>
                      </td>
                      <td className="px-4 py-2.5 align-top text-xs text-gray-600 max-w-[280px]">{cn.reason}</td>
                      <td className="px-4 py-2.5 align-top text-right tabular-nums font-medium text-purple-700 whitespace-nowrap">−{fmtAED(cn.amount)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 text-[11px] text-gray-400 border-t border-gray-100">
            Credit notes reduce the client&apos;s balance on their statement (Accountant → Client statements).
            Posting them through the GL and the VAT return is Phase 2.
          </div>
        </div>
      )}

      <p className="text-[11px] text-gray-400">
        Actions mutate in-memory demo state only. Record payment / Full creates a receipt in the Receipts register,
        which is the source of truth for paid status. Dunning, GL posting and reconciliation are Phase 2.
      </p>
    </div>
  )
}
