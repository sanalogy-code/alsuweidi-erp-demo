import { useState } from 'react'
import { Download, Landmark, FileSpreadsheet, ReceiptText } from 'lucide-react'
import { fmtAED, invoiceTotal, invoiceOutstandingNet, VAT_RATE } from '../../data/financeData'
import { parseLocalDate, todayLocal } from '../../utils/date'

// Accountant reports (Batch 16-early, Sana 7 Jul: "financials doesn't really work
// for an accountant") — the three things an accountant actually runs monthly:
// receivables aging, client statements of account, and the VAT return working.
// All derived live from the invoices/expenses registers; real GL/double-entry
// stays Phase 2.

const daysPastDue = (inv) => {
  const d = parseLocalDate(inv.dueDate)
  return d ? Math.floor((todayLocal() - d) / 86400000) : 0
}

const BUCKETS = [
  { key: 'current', label: 'Not due', test: (d) => d <= 0 },
  { key: 'b30', label: '1–30 days', test: (d) => d > 0 && d <= 30 },
  { key: 'b60', label: '31–60 days', test: (d) => d > 30 && d <= 60 },
  { key: 'b90', label: '61–90 days', test: (d) => d > 60 && d <= 90 },
  { key: 'b90p', label: 'Over 90', test: (d) => d > 90 },
]

// Client-side CSV download — same no-dependency pattern the demo uses elsewhere.
const downloadCsv = (name, rows) => {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

function AgingTab({ invoices, creditNotes = [] }) {
  // Per-invoice CN netting: each invoice's bucket amount is total − receipts −
  // credit notes linked to that invoice, so aging and statements agree.
  const outstanding = (i) => invoiceOutstandingNet(i, creditNotes)
  const unlinkedCnTotal = creditNotes.filter((c) => c.invoiceId == null).reduce((s, c) => s + c.amount, 0)
  const open = invoices.filter((i) => i.status !== 'draft' && outstanding(i) > 0)
  const clients = [...new Set(open.map((i) => i.clientName))]
  const rows = clients.map((client) => {
    const theirs = open.filter((i) => i.clientName === client)
    const buckets = BUCKETS.map((b) => theirs.filter((i) => b.test(daysPastDue(i))).reduce((s, i) => s + outstanding(i), 0))
    return { client, buckets, total: buckets.reduce((s, v) => s + v, 0) }
  }).sort((a, b) => b.total - a.total)
  const totals = BUCKETS.map((_, bi) => rows.reduce((s, r) => s + r.buckets[bi], 0))
  const grand = totals.reduce((s, v) => s + v, 0)

  const exportCsv = () => downloadCsv('receivables-aging.csv', [
    ['Client', ...BUCKETS.map((b) => b.label), 'Total outstanding'],
    ...rows.map((r) => [r.client, ...r.buckets, r.total]),
    ['TOTAL', ...totals, grand],
  ])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Outstanding (incl. VAT) by how far past the due date — the list Finance chases. {fmtAED(grand, { compact: true })} open across {rows.length} clients.</p>
        <button onClick={exportCsv} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Download size={12} /> CSV</button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[620px]">
          <thead className="bg-gray-50 border-b border-gray-200 text-[11px] text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-2">Client</th>
              {BUCKETS.map((b) => <th key={b.key} className="text-right px-3 py-2">{b.label}</th>)}
              <th className="text-right px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.client} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-800">{r.client}</td>
                {r.buckets.map((v, i) => (
                  <td key={i} className={`px-3 py-2.5 text-right ${v === 0 ? 'text-gray-300' : i >= 3 ? 'text-red-600 font-semibold' : i >= 1 ? 'text-amber-700' : 'text-gray-700'}`}>
                    {v ? fmtAED(v, { compact: true }) : '—'}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{fmtAED(r.total, { compact: true })}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-200 bg-gray-50 font-semibold text-gray-700">
            <tr>
              <td className="px-4 py-2">Total</td>
              {totals.map((v, i) => <td key={i} className="px-3 py-2 text-right">{v ? fmtAED(v, { compact: true }) : '—'}</td>)}
              <td className="px-4 py-2 text-right">{fmtAED(grand, { compact: true })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-[11px] text-gray-400">
        Credit notes linked to an invoice are netted into its bucket.
        {unlinkedCnTotal > 0 && ` ${fmtAED(unlinkedCnTotal)} of unallocated credit notes sit outside the buckets (see the client statements).`}
      </p>
    </div>
  )
}

function StatementsTab({ invoices, creditNotes = [] }) {
  const clients = [...new Set(invoices.filter((i) => i.status !== 'draft').map((i) => i.clientName))].sort()
  const [client, setClient] = useState(clients[0] || '')
  const theirs = invoices.filter((i) => i.clientName === client && i.status !== 'draft')
    .sort((a, b) => (a.issueDate || '').localeCompare(b.issueDate || ''))
  const theirCNs = creditNotes.filter((c) => c.clientName === client)
  const cnTotal = theirCNs.reduce((s, c) => s + c.amount, 0)
  // Per-invoice netting: an invoice's balance reflects the credit notes linked to
  // it; CNs without an invoice link net off the statement total only.
  const balance = (i) => invoiceOutstandingNet(i, theirCNs)
  const unlinkedCnTotal = theirCNs.filter((c) => c.invoiceId == null).reduce((s, c) => s + c.amount, 0)
  const totals = theirs.reduce((acc, i) => ({
    invoiced: acc.invoiced + invoiceTotal(i),
    paid: acc.paid + Math.min(i.amountPaid ?? 0, invoiceTotal(i)),
    balance: acc.balance + balance(i),
  }), { invoiced: 0, paid: 0, balance: 0 })
  const netBalance = Math.max(0, totals.balance - unlinkedCnTotal)

  const exportCsv = () => downloadCsv(`statement-${client.replace(/\W+/g, '-')}.csv`, [
    [`Statement of account — ${client}`], [],
    ['Date', 'Ref', 'Description', 'Invoiced (incl. VAT)', 'Paid / credited', 'Balance (net of CNs)', 'Due date', 'Status'],
    ...theirs.map((i) => [i.issueDate, i.invoiceNo, i.description, invoiceTotal(i), Math.min(i.amountPaid ?? 0, invoiceTotal(i)), balance(i), i.dueDate, i.status]),
    ...theirCNs.map((c) => [c.date, c.creditNoteNo, `Credit note — ${c.reason}${c.invoiceId != null ? ` (against invoice #${c.invoiceId})` : ''}`, -c.amount, '', '', '', 'credit note']),
    [], ['Totals', '', '', totals.invoiced - cnTotal, totals.paid, netBalance],
  ])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <select value={client} onChange={(e) => setClient(e.target.value)} className="border border-gray-200 rounded-md px-2.5 py-1.5 text-sm bg-white">
          {clients.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button onClick={exportCsv} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Download size={12} /> CSV (send to client)</button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 border-b border-gray-200 text-[11px] text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">Invoice</th>
              <th className="text-left px-4 py-2">Description</th>
              <th className="text-right px-4 py-2">Invoiced</th>
              <th className="text-right px-4 py-2">Paid</th>
              <th className="text-right px-4 py-2">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {theirs.map((i) => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 text-xs text-gray-500">{i.issueDate}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{i.invoiceNo}</td>
                <td className="px-4 py-2.5 text-gray-700 max-w-[280px] truncate" title={i.description}>{i.description}</td>
                <td className="px-4 py-2.5 text-right text-gray-700">{fmtAED(invoiceTotal(i), { compact: true })}</td>
                <td className="px-4 py-2.5 text-right text-green-700">{fmtAED(Math.min(i.amountPaid ?? 0, invoiceTotal(i)), { compact: true })}</td>
                <td className={`px-4 py-2.5 text-right font-medium ${balance(i) > 0 ? 'text-red-600' : 'text-gray-300'}`}>{balance(i) ? fmtAED(balance(i), { compact: true }) : '—'}</td>
              </tr>
            ))}
            {theirCNs.map((c) => (
              <tr key={`cn-${c.id}`} className="hover:bg-gray-50 bg-purple-50/40">
                <td className="px-4 py-2.5 text-xs text-gray-500">{c.date}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-purple-700">{c.creditNoteNo}</td>
                <td className="px-4 py-2.5 text-gray-700 max-w-[280px] truncate" title={c.reason}>Credit note — {c.reason}</td>
                <td className="px-4 py-2.5 text-right text-purple-700">−{fmtAED(c.amount, { compact: true })}</td>
                <td className="px-4 py-2.5 text-right text-[11px] text-purple-600">{c.invoiceId != null ? `against #${c.invoiceId}` : 'unallocated'}</td>
                <td className="px-4 py-2.5" />
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-200 bg-gray-50 font-semibold text-gray-700">
            <tr>
              <td colSpan={3} className="px-4 py-2">Totals{cnTotal > 0 ? ' (net of credit notes)' : ''}</td>
              <td className="px-4 py-2 text-right">{fmtAED(totals.invoiced - cnTotal, { compact: true })}</td>
              <td className="px-4 py-2 text-right text-green-700">{fmtAED(totals.paid, { compact: true })}</td>
              <td className="px-4 py-2 text-right text-red-600">{fmtAED(netBalance, { compact: true })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-[11px] text-gray-400">Paid amounts trace to the Receipts register (per-receipt dates and bank references). Credit notes linked to an invoice net off that invoice&apos;s balance; unallocated ones net off the statement total. Posting them through the GL and VAT return is Phase 2.</p>
    </div>
  )
}

function VatTab({ invoices, expenses }) {
  // Calendar quarters of 2026. FTA tax periods can be staggered per registrant —
  // the quarter grouping is data, adjust when the real filing calendar is known.
  const quarters = [
    { key: '2026-Q1', months: ['2026-01', '2026-02', '2026-03'] },
    { key: '2026-Q2', months: ['2026-04', '2026-05', '2026-06'] },
    { key: '2026-Q3', months: ['2026-07', '2026-08', '2026-09'] },
  ]
  const rows = quarters.map((q) => {
    const out = invoices.filter((i) => i.status !== 'draft' && q.months.includes((i.issueDate || '').slice(0, 7)))
    const outputVat = out.reduce((s, i) => s + (i.vatAmount ?? 0), 0)
    const sales = out.reduce((s, i) => s + i.amount, 0)
    const exp = expenses.filter((e) => e.status !== 'rejected' && q.months.includes((e.date || '').slice(0, 7)))
    const purchases = exp.reduce((s, e) => s + e.amount, 0)
    // Real per-expense input VAT (recoverable only). Legacy seed rows without a
    // vatAmount fall back to a 5% estimate — counted separately so it's honest.
    const inputVat = exp.filter((e) => e.vatAmount != null && !e.vatNonRecoverable).reduce((s, e) => s + e.vatAmount, 0)
    // Non-recoverable rows never enter the estimate; flagged legacy rows land in
    // the excluded bucket at the same 5% estimate instead of reducing net payable.
    const estimated = exp.filter((e) => e.vatAmount == null && !e.vatNonRecoverable).reduce((s, e) => s + e.amount * VAT_RATE, 0)
    const blocked = exp.filter((e) => e.vatNonRecoverable).reduce((s, e) => s + (e.vatAmount ?? e.amount * VAT_RATE), 0)
    return { q: q.key, sales, outputVat, purchases, inputVat, estimated, blocked, net: outputVat - inputVat - estimated }
  })
  const anyEstimated = rows.some((r) => r.estimated > 0)
  const anyBlocked = rows.some((r) => r.blocked > 0)

  const exportCsv = () => downloadCsv('vat-return-working.csv', [
    ['Period', 'Standard-rated sales (net)', 'Output VAT', 'Purchases (net)', 'Input VAT (recoverable)', 'of which estimated (legacy rows)', 'Non-recoverable VAT (excluded)', 'Net VAT payable'],
    ...rows.map((r) => [r.q, r.sales, r.outputVat, r.purchases, Math.round(r.inputVat + r.estimated), Math.round(r.estimated), Math.round(r.blocked), Math.round(r.net)]),
  ])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">The VAT return working paper: output VAT from issued invoices, input VAT from expenses, net payable per period.</p>
        <button onClick={exportCsv} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Download size={12} /> CSV</button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[620px]">
          <thead className="bg-gray-50 border-b border-gray-200 text-[11px] text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-2">Period</th>
              <th className="text-right px-4 py-2">Sales (net)</th>
              <th className="text-right px-4 py-2">Output VAT</th>
              <th className="text-right px-4 py-2">Purchases (net)</th>
              <th className="text-right px-4 py-2">Input VAT (recoverable)</th>
              <th className="text-right px-4 py-2">Net payable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.q} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-800">{r.q}</td>
                <td className="px-4 py-2.5 text-right text-gray-700">{fmtAED(r.sales, { compact: true })}</td>
                <td className="px-4 py-2.5 text-right text-gray-700">{fmtAED(r.outputVat, { compact: true })}</td>
                <td className="px-4 py-2.5 text-right text-gray-700">{fmtAED(r.purchases, { compact: true })}</td>
                <td className="px-4 py-2.5 text-right text-gray-500">
                  {fmtAED(r.inputVat + r.estimated, { compact: true })}
                  {r.estimated > 0 && <div className="text-[10px] text-amber-600">incl. {fmtAED(r.estimated, { compact: true })} est.*</div>}
                  {r.blocked > 0 && <div className="text-[10px] text-red-500">excl. {fmtAED(r.blocked)} non-rec.</div>}
                </td>
                <td className={`px-4 py-2.5 text-right font-semibold ${r.net > 0 ? 'text-gray-800' : 'text-green-700'}`}>{fmtAED(r.net, { compact: true })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-400">
        Input VAT sums the actual per-expense VAT captured on each expense line, excluding VAT flagged non-recoverable
        (e.g. entertainment{anyBlocked ? ' — excluded amounts shown per period' : ''}).
        {anyEstimated && ' *Legacy seed expenses without a captured VAT amount fall back to a 5% estimate — shown separately per period.'}
        {' '}Reverse-charge items and the registrant&apos;s actual FTA filing calendar come with the Phase 2 accounting scope.
      </p>
    </div>
  )
}

export default function AccountantView({ invoices, expenses, creditNotes = [] }) {
  const [tab, setTab] = useState('aging')
  const TABS = [
    { key: 'aging', label: 'Receivables aging', icon: ReceiptText },
    { key: 'statements', label: 'Client statements', icon: FileSpreadsheet },
    { key: 'vat', label: 'VAT return', icon: Landmark },
  ]
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === t.key ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon size={14} /> {t.label}
            </button>
          )
        })}
      </div>
      {tab === 'aging' && <AgingTab invoices={invoices} creditNotes={creditNotes} />}
      {tab === 'statements' && <StatementsTab invoices={invoices} creditNotes={creditNotes} />}
      {tab === 'vat' && <VatTab invoices={invoices} expenses={expenses} />}
    </div>
  )
}
