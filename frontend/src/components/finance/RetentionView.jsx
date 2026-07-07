import { ShieldCheck } from 'lucide-react'
import { PROJECTS } from '../../data/projectsData'
import { parseLocalDate } from '../../utils/date'
import { fmtAED, RETENTIONS } from '../../data/financeData'

const fmtDate = (iso) => (iso ? parseLocalDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

// Retention held on supervision fees — clients typically hold 5%, released at
// Taking-Over Certificate and end of Defects Liability Period. Demo-grade,
// read-only table; automated release triggers off project milestones are Phase 2.
export default function RetentionView() {
  const projectOf = (id) => PROJECTS.find((p) => p.id === id)
  const totalHeld = RETENTIONS.reduce((s, r) => s + r.held, 0)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Retention on supervision fees</h2>
        <p className="text-sm text-gray-500">
          What clients are holding back from our supervision invoices (typically 5%), and when it comes back. Demo data.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Total retention held</div>
          <div className="text-lg font-bold text-amber-700 tabular-nums">{fmtAED(totalHeld)}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-[11px] text-gray-500">Projects with retention</div>
          <div className="text-lg font-bold text-gray-900 tabular-nums">{RETENTIONS.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2.5 font-medium">Project</th>
                <th className="px-4 py-2.5 font-medium text-right">Fees invoiced to date</th>
                <th className="px-4 py-2.5 font-medium text-right">Retention %</th>
                <th className="px-4 py-2.5 font-medium text-right">Held</th>
                <th className="px-4 py-2.5 font-medium">Release terms</th>
                <th className="px-4 py-2.5 font-medium text-right">Expected TOC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RETENTIONS.map((r) => {
                const proj = projectOf(r.projectId)
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 align-top">
                      <div className="text-gray-800">{proj ? proj.name : `Project #${r.projectId}`}</div>
                      <div className="text-[11px] text-gray-400">{proj ? `${proj.projectNo} · ${proj.employer}` : ''}</div>
                    </td>
                    <td className="px-4 py-3 align-top text-right tabular-nums text-gray-700 whitespace-nowrap">{fmtAED(r.feesInvoicedToDate)}</td>
                    <td className="px-4 py-3 align-top text-right tabular-nums text-gray-600">{r.retentionPct}%</td>
                    <td className="px-4 py-3 align-top text-right tabular-nums font-semibold text-amber-700 whitespace-nowrap">{fmtAED(r.held)}</td>
                    <td className="px-4 py-3 align-top text-gray-600 text-xs max-w-[220px]">{r.releaseTerms}</td>
                    <td className="px-4 py-3 align-top text-right text-gray-600 tabular-nums whitespace-nowrap">{fmtDate(r.expectedTOC)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="border-t border-gray-200 bg-gray-50 font-semibold text-gray-700">
              <tr>
                <td className="px-4 py-2" colSpan={3}>Total held</td>
                <td className="px-4 py-2 text-right tabular-nums">{fmtAED(totalHeld)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-md bg-blue-50 border border-blue-100 px-3 py-2 text-[11px] leading-snug text-blue-700">
        <ShieldCheck size={13} className="shrink-0 mt-0.5" />
        <span>
          Demo-grade, read-only. Phase 2 wires retention to each project&apos;s milestones so TOC / end-of-DLP
          automatically raises the release invoice and clears the held balance.
        </span>
      </div>
    </div>
  )
}
