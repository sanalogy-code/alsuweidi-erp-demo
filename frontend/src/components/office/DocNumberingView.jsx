import { Hash } from 'lucide-react'

// Document numbering standards — a static reference page for the ODC. It
// documents the series the demo already uses across modules. "Next number"
// is computed live for correspondence (we hold that state here in Office);
// other modules' next numbers are static examples until state is shared.

export default function DocNumberingView({ letters }) {
  const nextRef = (prefix) => {
    const max = Math.max(0, ...letters.filter((l) => l.ref.startsWith(prefix)).map((l) => Number(l.ref.split('-')[2]) || 0))
    return `${prefix}-2026-${String(max + 1).padStart(3, '0')}`
  }

  const SERIES = [
    { series: 'Incoming correspondence', format: 'IN-YYYY-NNN', owner: 'Office Administration', example: 'IN-2026-121', next: nextRef('IN') },
    { series: 'Outgoing correspondence', format: 'OUT-YYYY-NNN', owner: 'Office Administration', example: 'OUT-2026-142', next: nextRef('OUT') },
    { series: 'Client invoices', format: 'INV-YYYY-NNN', owner: 'Financials', example: 'INV-2026-017', next: 'assigned in Financials' },
    { series: 'Credit notes', format: 'CN-YYYY-NNN', owner: 'Financials', example: 'CN-2026-003', next: 'assigned in Financials' },
    { series: 'RFPs / bids', format: 'RFP-YYYY-NNN', owner: 'CRM / Bids', example: 'RFP-2026-014', next: 'assigned in CRM' },
    { series: 'Project numbers', format: 'P-NNN', owner: 'Projects', example: 'P-118', next: 'assigned in Projects' },
    { series: 'Work inspection requests', format: 'WIR-PNNN-NNN', owner: 'Projects (supervision)', example: 'WIR-P104-062', next: 'per-project counter' },
    { series: 'Material inspection requests', format: 'MIR-PNNN-NNN', owner: 'Projects (supervision)', example: 'MIR-P104-031', next: 'per-project counter' },
    { series: 'Non-conformance reports', format: 'NCR-PNNN-NNN', owner: 'Projects (supervision)', example: 'NCR-P104-004', next: 'per-project counter' },
    { series: 'IT asset tags', format: 'IT-00NN', owner: 'IT & Assets', example: 'IT-0044', next: 'assigned in IT registry' },
  ]

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">Document numbering standards</h2>
        <p className="text-xs text-gray-500">The reference-number series in use across the system. Numbers are assigned automatically by the owning module — never by hand.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="px-4 py-2 font-medium">Series</th>
              <th className="px-4 py-2 font-medium">Format</th>
              <th className="px-4 py-2 font-medium">Owner module</th>
              <th className="px-4 py-2 font-medium">Example</th>
              <th className="px-4 py-2 font-medium">Next number</th>
            </tr>
          </thead>
          <tbody>
            {SERIES.map((s) => (
              <tr key={s.series} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-2 text-gray-700">{s.series}</td>
                <td className="px-4 py-2 font-mono text-gray-600">{s.format}</td>
                <td className="px-4 py-2 text-gray-500">{s.owner}</td>
                <td className="px-4 py-2 font-mono text-gray-500">{s.example}</td>
                <td className="px-4 py-2">
                  {s.next.includes('-') && !s.next.includes(' ')
                    ? <span className="font-mono text-brand font-semibold">{s.next}</span>
                    : <span className="text-gray-400 italic">{s.next}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 text-xs text-gray-600 space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-gray-800"><Hash size={13} /> Adding a new series</div>
        <p>1. Pick a short, unambiguous prefix (letters only) and a year-scoped counter — <span className="font-mono">PREFIX-YYYY-NNN</span> — unless the series is per-project, in which case embed the project number.</p>
        <p>2. Agree the owning module: exactly one place assigns the number, everything else references it.</p>
        <p>3. Record it in this table so the ODC and QA both know the scheme. Counters reset each January for year-scoped series; per-project counters never reset.</p>
        <p className="text-gray-400">Live &quot;next number&quot; is shown where this module holds the register; other modules&apos; counters display statically until cross-module state lands (Phase 2 shared numbering service).</p>
      </div>
    </div>
  )
}
