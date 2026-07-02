import { PROJECT_STAGES } from '../../data/projectsData'

// The nine-stage delivery strip. Stages outside the project's scope render muted;
// covered stages fill up to the current one.
export default function StagePipeline({ stagesInvolved = [], currentStage, compact = false }) {
  const currentIdx = PROJECT_STAGES.indexOf(currentStage)

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {PROJECT_STAGES.map((stage, idx) => {
        const involved = stagesInvolved.includes(stage)
        const reached = involved && idx <= currentIdx
        const isCurrent = stage === currentStage
        return (
          <div key={stage} className="flex flex-col items-center min-w-0" title={involved ? stage : `${stage} — not in scope`}>
            <div
              className={`h-1.5 rounded-full transition ${compact ? 'w-6' : 'w-10'} ${
                isCurrent ? 'bg-brand' : reached ? 'bg-brand/50' : involved ? 'bg-gray-300' : 'bg-gray-100'
              }`}
            />
            {!compact && (
              <div className={`text-[9px] mt-1 whitespace-nowrap ${isCurrent ? 'text-brand font-semibold' : involved ? 'text-gray-500' : 'text-gray-300'}`}>
                {stage}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
