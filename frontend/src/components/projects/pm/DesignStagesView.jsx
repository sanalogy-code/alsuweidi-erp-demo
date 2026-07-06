import { CheckCircle2, CircleDashed, CircleDot } from 'lucide-react'

// Stage-gated design reviews — the 30-60-90-final gate pattern with a
// cross-discipline gate review at each milestone.

const STAGE_STATUS = {
  passed: { label: 'Gate passed', chip: 'bg-green-100 text-green-700', icon: CheckCircle2, iconCls: 'text-green-500' },
  in_progress: { label: 'In progress', chip: 'bg-blue-100 text-blue-700', icon: CircleDot, iconCls: 'text-blue-500' },
  not_started: { label: 'Not started', chip: 'bg-gray-100 text-gray-500', icon: CircleDashed, iconCls: 'text-gray-300' },
}

export default function DesignStagesView({ pm, onUpdate }) {
  const passGate = (key) => {
    onUpdate({
      ...pm,
      designStages: pm.designStages.map((s, i, arr) => {
        if (s.key === key) return { ...s, status: 'passed', gateDate: s.gateDate || new Date().toISOString().slice(0, 10) }
        // Opening the next gate keeps the sequence honest.
        const idx = arr.findIndex((x) => x.key === key)
        if (i === idx + 1 && s.status === 'not_started') return { ...s, status: 'in_progress' }
        return s
      }),
    })
  }

  if (!pm.designStages.length) {
    return (
      <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
        No design stage gates set up — this project has no design scope, or gates haven’t been defined yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">Design stage gates</h2>
      <div className="space-y-2">
        {pm.designStages.map((s, i) => {
          const meta = STAGE_STATUS[s.status] || STAGE_STATUS.not_started
          const Icon = meta.icon
          const prevPassed = i === 0 || pm.designStages[i - 1].status === 'passed'
          return (
            <div key={s.key} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-start gap-3">
              <Icon size={18} className={`${meta.iconCls} mt-0.5 shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-800">{s.label}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${meta.chip}`}>{meta.label}</span>
                  {s.gateDate && <span className="text-xs text-gray-400">{s.status === 'passed' ? 'passed' : 'gate'} {s.gateDate}</span>}
                </div>
                {s.notes && <p className="text-xs text-gray-500 mt-1">{s.notes}</p>}
              </div>
              {s.status !== 'passed' && prevPassed && (
                <button onClick={() => passGate(s.key)} className="shrink-0 px-2.5 py-1 text-xs rounded-md border border-gray-300 text-gray-700 hover:border-brand hover:text-brand transition">
                  Pass gate
                </button>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-[11px] text-gray-400">
        Each gate is a cross-discipline coordination review (clash meetings typically around 60%). Per-discipline QA checklists per gate are a Phase 2 refinement — validate the gate flow first.
      </p>
    </div>
  )
}
