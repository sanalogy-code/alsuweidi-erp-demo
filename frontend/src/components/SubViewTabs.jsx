// Pill tabs for the sub-views of a sidebar group (the IA pattern introduced with
// the Finance restructure: sidebar = intent groups, tabs = the registers inside).
// views: [{ key, label, badge? }] — renders nothing for single-view groups.
export default function SubViewTabs({ views, active, onSelect }) {
  if (!views || views.length < 2) return null
  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {views.map((v) => (
        <button
          key={v.key}
          onClick={() => onSelect(v.key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${active === v.key ? 'bg-brand text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          {v.label}
          {v.badge > 0 && (
            <span className={`text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center ${active === v.key ? 'bg-white/25 text-white' : 'bg-red-500 text-white'}`}>
              {v.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
