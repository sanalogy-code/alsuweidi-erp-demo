import { daysSince } from '../../data/crmData'
import InteractionIcon from './InteractionIcon'

export default function InteractionHistory({ interactions, contactId, emptyText = 'No interactions logged yet.' }) {
  const history = interactions
    .filter((i) => i.contactId === contactId)
    .sort((a, b) => b.date.localeCompare(a.date))

  if (history.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-4">{emptyText}</p>
  }

  return (
    <div className="space-y-3">
      {history.map((i) => (
        <div key={i.id} className="flex gap-3">
          <InteractionIcon type={i.type} size={12} />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs font-semibold text-gray-700">{i.type}</span>
              <span className="text-[11px] text-gray-400 whitespace-nowrap">{daysSince(i.date)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{i.note}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
