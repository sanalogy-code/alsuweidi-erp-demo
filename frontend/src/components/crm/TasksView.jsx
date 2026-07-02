import { Plus, Check, Trash2 } from 'lucide-react'
import { daysUntil, formatDueLabel } from '../../data/crmData'

function Section({ title, tasks, contacts, companies, tone, onToggle, onDelete, onJumpToCompany }) {
  if (tasks.length === 0) return null
  return (
    <div>
      <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${tone}`}>{title} ({tasks.length})</h3>
      <div className="space-y-2">
        {tasks.map((t) => {
          const contact = contacts.find((c) => c.id === t.contactId)
          const company = companies.find((c) => c.id === contact?.companyId)
          return (
            <div key={t.id} className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => onToggle(t.id)}
                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition ${t.done ? 'bg-brand border-brand text-white' : 'border-gray-300 hover:border-brand'}`}
              >
                {t.done && <Check size={13} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${t.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{t.title}</div>
                <div className="text-xs text-gray-500">
                  {contact?.name}{company && (
                    <> • <button onClick={() => onJumpToCompany(company.id)} className="hover:text-brand hover:underline">{company.name}</button></>
                  )}
                </div>
              </div>
              {!t.done && (
                <span className={`text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap ${daysUntil(t.dueDate) < 0 ? 'bg-red-100 text-red-700' : daysUntil(t.dueDate) <= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                  {formatDueLabel(t.dueDate)}
                </span>
              )}
              <button onClick={() => onDelete(t.id)} className="text-gray-300 hover:text-red-500 transition shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TasksView({ tasks, contacts, companies, onAddTask, onToggle, onDelete, onJumpToCompany }) {
  const open = tasks.filter((t) => !t.done)
  const overdue = open.filter((t) => daysUntil(t.dueDate) < 0).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const dueSoon = open.filter((t) => daysUntil(t.dueDate) >= 0 && daysUntil(t.dueDate) <= 7).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const later = open.filter((t) => daysUntil(t.dueDate) > 7).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const done = tasks.filter((t) => t.done)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Tasks & Reminders</h2>
          <p className="text-xs text-gray-500">Reconnect prompts tied to your contacts</p>
        </div>
        <button
          onClick={() => onAddTask(null)}
          className="bg-brand text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-brand-dark flex items-center gap-1"
        >
          <Plus size={14} /> New Task
        </button>
      </div>

      <Section title="Overdue" tasks={overdue} contacts={contacts} companies={companies} tone="text-red-600" onToggle={onToggle} onDelete={onDelete} onJumpToCompany={onJumpToCompany} />
      <Section title="Due This Week" tasks={dueSoon} contacts={contacts} companies={companies} tone="text-yellow-700" onToggle={onToggle} onDelete={onDelete} onJumpToCompany={onJumpToCompany} />
      <Section title="Later" tasks={later} contacts={contacts} companies={companies} tone="text-gray-500" onToggle={onToggle} onDelete={onDelete} onJumpToCompany={onJumpToCompany} />
      <Section title="Done" tasks={done} contacts={contacts} companies={companies} tone="text-gray-400" onToggle={onToggle} onDelete={onDelete} onJumpToCompany={onJumpToCompany} />

      {tasks.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-16 text-center text-gray-400">
          No tasks yet. Add a reminder to reconnect with someone.
        </div>
      )}
    </div>
  )
}
