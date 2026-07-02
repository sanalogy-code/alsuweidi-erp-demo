import { useState, Fragment } from 'react'
import { Mail, Phone, Search, Plus, Bell, History, ChevronDown, ChevronUp } from 'lucide-react'
import { daysSince } from '../../data/crmData'
import InteractionHistory from './InteractionHistory'

export default function ContactsView({ contacts, companies, deals, interactions, onAddContact, onLogInteraction, onAddTask, onJumpToCompany }) {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const rows = contacts
    .map((c) => ({
      ...c,
      company: companies.find((co) => co.id === c.companyId),
      dealCount: deals.filter((d) => d.contactId === c.id).length,
      interactionCount: interactions.filter((i) => i.contactId === c.id).length,
    }))
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">All Contacts ({rows.length})</h2>
          <p className="text-xs text-gray-500">Every person you're tracking, across every company</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, company, email..."
              className="pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand w-64"
            />
          </div>
          <button
            onClick={() => onAddContact(companies[0]?.id)}
            className="bg-brand text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-brand-dark flex items-center gap-1 whitespace-nowrap"
          >
            <Plus size={14} /> Add Contact
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Company</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Phone</th>
              <th className="px-4 py-2 font-medium">Deals</th>
              <th className="px-4 py-2 font-medium">Last Contacted</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((c) => (
              <Fragment key={c.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.title}</div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onJumpToCompany(c.companyId)} className="text-brand text-sm font-medium hover:underline">
                      {c.company?.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400" />{c.email || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400" />{c.phone || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.dealCount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${c.lastContact ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {daysSince(c.lastContact)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 whitespace-nowrap">
                      <button
                        onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                        className="text-gray-500 text-xs font-medium hover:text-brand flex items-center gap-1"
                      >
                        <History size={13} /> {c.interactionCount}
                        {expandedId === c.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                      <button onClick={() => onLogInteraction(c.id)} className="text-brand text-xs font-medium hover:underline">
                        Log Interaction
                      </button>
                      <button onClick={() => onAddTask(c.id)} title="Remind me to reconnect" className="text-gray-400 hover:text-brand transition">
                        <Bell size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === c.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="max-w-lg">
                        <InteractionHistory interactions={interactions} contactId={c.id} />
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No contacts match "{search}"</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
