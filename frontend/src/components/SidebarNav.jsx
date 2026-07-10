// The grouped module sidebar every page hand-rolled its own copy of (CRM/HR/
// Projects/Finance/…) — one component, one place for the styles to live.
//
//   <SidebarNav
//     groups={[{ items: [...] }, { label: 'Sales', items: [...] }]}
//     active={view} onSelect={setView}
//   >
//     {optional content rendered above the nav — e.g. a New-project button}
//   </SidebarNav>
//
// Item: { key, label, icon, badge? } — badge renders a red count chip when > 0.
// A group without a label renders as the ungrouped top-level block.
export default function SidebarNav({ groups, active, onSelect, width = 'sm:w-44', children, footer = null }) {
  const navButton = (item) => {
    const Icon = item.icon
    const isActive = active === item.key
    return (
      <button
        key={item.key}
        onClick={() => onSelect(item.key)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition text-left ${isActive ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
      >
        {Icon && <Icon size={15} className="shrink-0" />}
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shrink-0">
            {item.badge}
          </span>
        )}
      </button>
    )
  }
  return (
    <aside className={`w-full ${width} shrink-0 sm:sticky sm:top-6`}>
      {children}
      {groups.filter((g) => g.items.length > 0).map((group, i) => (
        <div key={group.label || i}>
          {group.label && <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-4 pb-1 hidden sm:block">{group.label}</div>}
          <div className="flex sm:flex-col flex-wrap gap-1 mt-1 sm:mt-0">
            {group.items.map(navButton)}
          </div>
        </div>
      ))}
      {footer}
    </aside>
  )
}
