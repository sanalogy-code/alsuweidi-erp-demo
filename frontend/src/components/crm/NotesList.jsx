import { useState } from 'react'
import { StickyNote, Plus } from 'lucide-react'
import { todayISO } from '../../data/crmData'
import { nextId } from '../../utils/id'

// One consistent list style for free-text + date + author notes:
// "keep in mind" on companies/contacts and "lessons learned" on projects.
export default function NotesList({ title = 'Keep in Mind', notes = [], onAdd, emptyText = 'No notes yet.', placeholder = 'Something worth remembering...' }) {
  const [adding, setAdding] = useState(false)
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')

  const sorted = [...notes].sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    const id = nextId(notes)
    onAdd({ id, text: text.trim(), author: author.trim() || 'Unknown', date: todayISO() })
    setText('')
    setAuthor('')
    setAdding(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1.5">
          <StickyNote size={13} className="text-gray-400" /> {title} ({notes.length})
        </h4>
        {onAdd && !adding && (
          <button onClick={() => setAdding(true)} className="text-xs text-brand font-medium hover:underline flex items-center gap-1">
            <Plus size={13} /> Add
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={submit} className="mb-3 bg-amber-50 border border-amber-200 rounded-md p-3 space-y-2">
          <textarea
            autoFocus required rows={2} value={text} placeholder={placeholder}
            onChange={(e) => setText(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand resize-none"
          />
          <div className="flex gap-2">
            <input
              value={author} placeholder="Your name"
              onChange={(e) => setAuthor(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <button type="submit" className="px-3 py-1.5 bg-brand text-white rounded-md text-xs font-medium hover:bg-brand-dark">Save</button>
            <button type="button" onClick={() => setAdding(false)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      {sorted.length > 0 ? (
        <div className="space-y-2">
          {sorted.map((n) => (
            <div key={n.id} className="border border-gray-200 border-l-4 border-l-amber-300 rounded-lg px-3 py-2 bg-white">
              <p className="text-sm text-gray-700">{n.text}</p>
              <div className="text-[11px] text-gray-400 mt-1">{n.date} — {n.author}</div>
            </div>
          ))}
        </div>
      ) : (
        !adding && <p className="text-xs text-gray-400">{emptyText}</p>
      )}
    </div>
  )
}
