import { useState } from 'react'
import { Mail, Phone, Bell, MessageSquarePlus, Pencil, Check, X as XIcon, FileText } from 'lucide-react'
import Modal from './Modal'
import InteractionHistory from './InteractionHistory'
import { getStatusColor, formatCurrency, daysSince } from '../../data/crmData'

export default function ContactDetailModal({
  contact, company, deals, interactions,
  onClose, onSave, onJumpToCompany, onLogInteraction, onAddTask,
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: contact.name, title: contact.title, email: contact.email, phone: contact.phone, notes: contact.notes || '',
  })

  const contactDeals = deals.filter((d) => d.contactId === contact.id)

  function save(e) {
    e.preventDefault()
    onSave(contact.id, form)
    setEditing(false)
  }

  function cancel() {
    setForm({ name: contact.name, title: contact.title, email: contact.email, phone: contact.phone, notes: contact.notes || '' })
    setEditing(false)
  }

  return (
    <Modal
      wide
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {contact.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div className="font-semibold text-gray-800 leading-tight">{contact.name}</div>
            <div className="text-xs text-gray-500">{contact.title}</div>
          </div>
        </div>
      }
    >
      {editing ? (
        <form onSubmit={save} className="space-y-3 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand resize-none" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="flex-1 bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark flex items-center justify-center gap-1">
              <Check size={15} /> Save
            </button>
            <button type="button" onClick={cancel} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1">
              <XIcon size={15} /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <button onClick={() => onJumpToCompany(contact.companyId)} className="text-sm text-brand font-medium hover:underline">
              {company?.name} {company && <span className="text-gray-400 font-normal">• {company.industry}</span>}
            </button>
            <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-brand transition flex items-center gap-1 text-xs font-medium">
              <Pencil size={13} /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400" />{contact.email || '—'}</div>
            <div className="flex items-center gap-1.5"><Phone size={14} className="text-gray-400" />{contact.phone || '—'}</div>
          </div>
          {contact.notes && <p className="text-sm text-gray-500 italic mb-3">"{contact.notes}"</p>}
          <span className={`inline-block text-[11px] px-2 py-1 rounded-full font-medium ${contact.lastContact ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            Last contacted: {daysSince(contact.lastContact)}
          </span>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => onLogInteraction(contact.id)}
          className="flex-1 bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark flex items-center justify-center gap-1"
        >
          <MessageSquarePlus size={15} /> Log Interaction
        </button>
        <button
          onClick={() => onAddTask(contact.id)}
          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
        >
          <Bell size={15} /> Remind Me
        </button>
      </div>

      <div className="mb-6">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Deals & Projects ({contactDeals.length})</h4>
        {contactDeals.length > 0 ? (
          <div className="space-y-2">
            {contactDeals.map((d) => (
              <div key={d.id} className="border border-gray-200 rounded-lg px-3 py-2 flex justify-between items-center">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-800 truncate">{d.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-gray-700">{formatCurrency(d.value)}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getStatusColor(d.stage)}`}>{d.stage}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No deals linked to this contact yet.</p>
        )}
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Interaction History</h4>
        <InteractionHistory interactions={interactions} contactId={contact.id} />
      </div>
    </Modal>
  )
}
