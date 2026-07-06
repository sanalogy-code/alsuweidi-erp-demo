import { useState } from 'react'
import { Download, Landmark, FileSpreadsheet, ReceiptText } from 'lucide-react'
import { fmtAED, invoiceTotal, invoiceOutstanding, VAT_RATE } from '../../data/financeData'
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

function AgingTab({ invoices }) {
  const open = invoices.filter((i) => i.status !== 'draft' && invoiceOutstanding(i) > 0)
  const clients = [...new Set(open.map((i) => i.clientName))]
  const rows = clients.map((client) => {
    const theirs = open.filter((i) => i.clientName === client)
    const buckets = BUCKETS.map((b) => theirs.filter((i) => b.test(daysPastDue(i))).reduce((s, i) => s + invoiceOutstanding(i), 0))
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
    </div>
  )
}

function StatementsTab({ invoices }) {
  const clients = [...new Set(invoices.filter((i) => i.status !== 'draft').map((i) => i.clientName))].sort()
  const [client, setClient] = useState(clients[0] || '')
  const theirs = invoices.filter((i) => i.clientName === client && i.status !== 'draft')
    .sort((a, b) => (a.issueDate || '').localeCompare(b.issueDate || ''))
  const totals = theirs.reduce((acc, i) => ({
    invoiced: acc.invoiced + invoiceTotal(i),
    paid: acc.paid + Math.min(i.amountPaid ?? 0, invoiceTotal(i)),
    balance: acc.balance + invoiceOutstanding(i),
  }), { invoiced: 0, paid: 0, balance: 0 })

  const exportCsv = () => downloadCsv(`statement-${client.replace(/\W+/g, '-')}.csv`, [
    [`Statement of account — ${client}`], [],
    ['Date', 'Invoice no', 'Description', 'Invoiced (incl. VAT)', 'Paid', 'Balance', 'Due date', 'Status'],
    ...theirs.map((i) => [i.issueDate, i.invoiceNo, i.description, invoiceTotal(i), Math.min(i.amountPaid ?? 0, invoiceTotal(i)), invoiceOutstanding(i), i.dueDate, i.status]),
    [], ['Totals', '', '', totals.invoiced, totals.paid, totals.balance],
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
                <td className={`px-4 py-2.5 text-right font-medium ${invoiceOutstanding(i) > 0 ? 'text-red-600' : 'text-gray-300'}`}>{invoiceOutstanding(i) ? fmtAED(invoiceOutstanding(i), { compact: true }) : '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-200 bg-gray-50 font-semibold text-gray-700">
            <tr>
              <td colSpan={3} className="px-4 py-2">Totals</td>
              <td className="px-4 py-2 text-right">{fmtAED(totals.invoiced, { compact: true })}</td>
              <td className="px-4 py-2 text-right text-green-700">{fmtAED(totals.paid, { compact: true })}</td>
              <td className="px-4 py-2 text-right text-red-600">{fmtAED(totals.balance, { compact: true })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-[11px] text-gray-400">Per-receipt history (payment dates and references) needs a receipts register — Phase 2 with the accounting integration; today's "Paid" is the running amount received per invoice.</p>
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
    const inputVat = purchases * VAT_RATE // estimate — expenses don't carry per-line VAT yet
    return { q: q.key, sales, outputVat, purchases, inputVat, net: outputVat - inputVat }
  })

  const exportCsv = () => downloadCsv('vat-return-working.csv', [
    ['Period', 'Standard-rated sales (net)', 'Output VAT', 'Purchases (net)', 'Input VAT (est.)', 'Net VAT payable'],
    ...rows.map((r) => [r.q, r.sales, r.outputVat, r.purchases, Math.round(r.inputVat), Math.round(r.net)]),
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
              <th className="text-right px-4 py-2">Input VAT (est.)</th>
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
                <td className="px-4 py-2.5 text-right text-gray-500">{fmtAED(r.inputVat, { compact: true })}</td>
                <td className={`px-4 py-2.5 text-right font-semibold ${r.net > 0 ? 'text-gray-800' : 'text-green-700'}`}>{fmtAED(r.net, { compact: true })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-400">
        Input VAT is an estimate (5% across expenses) because expense lines don't carry per-line VAT yet — that field, non-recoverable categories, reverse-charge items, and the registrant's actual FTA filing calendar come with the Phase 2 accounting scope. This view is the working paper shape to agree with the accountant.
      </p>
    </div>
  )
}

export default function AccountantView({ invoices, expenses }) {
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
      {tab === 'aging' && <AgingTab invoices={invoices} />}
      {tab === 'statements' && <StatementsTab invoices={invoices} />}
      {tab === 'vat' && <VatTab invoices={invoices} expenses={expenses} />}
    </div>
  )
}
