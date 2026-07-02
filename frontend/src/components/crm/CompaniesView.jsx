import { useState } from 'react'
import { Mail, Phone, FileText, Search, Bell, Plus, History, ChevronDown, ChevronUp } from 'lucide-react'
import { getStatusColor, formatCurrency, daysSince } from '../../data/crmData'
import InteractionIcon from './InteractionIcon'
import InteractionHistory from './InteractionHistory'

export default function CompaniesView({
  companies, contacts, deals, interactions, selectedCompany, setSelectedCompany,
  search, setSearch, onAddContact, onLogInteraction, onAddTask,
}) {
  const [activeTab, setActiveTab] = useState('contacts')
  const [expandedContactId, setExpandedContactId] = useState(null)

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase())
  )

  const company = selectedCompany ? companies.find((c) => c.id === selectedCompany) : null
  const companyContacts = selectedCompany ? contacts.filter((c) => c.companyId === selectedCompany) : []
  const companyDeals = selectedCompany ? deals.filter((d) => d.companyId === selectedCompany) : []
  const openValue = companyDeals.filter((d) => d.stage !== 'Lost').reduce((s, d) => s + d.value, 0)
  const companyContactIds = companyContacts.map((c) => c.id)
  const companyInteractions = [...interactions]
    .filter((i) => companyContactIds.includes(i.contactId))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Companies list */}
      <div className="col-span-12 lg:col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 space-y-3">
            <h2 className="text-sm font-semibold text-gray-800">Companies ({filteredCompanies.length})</h2>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companies..."
                className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-[32rem] overflow-y-auto">
            {filteredCompanies.map((comp) => {
              const compValue = deals.filter((d) => d.companyId === comp.id && d.stage !== 'Lost').reduce((s, d) => s + d.value, 0)
              return (
                <button
                  key={comp.id}
                  onClick={() => { setSelectedCompany(comp.id); setActiveTab('contacts') }}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition border-l-4 ${selectedCompany === comp.id ? 'border-brand bg-brand-light' : 'border-transparent'}`}
                >
                  <div className="font-semibold text-gray-800 text-sm">{comp.name}</div>
                  <div className="text-xs text-gray-500">{comp.industry}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">{comp.location}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(comp.status)}`}>{comp.status}</span>
                  </div>
                  <div className="text-sm font-semibold text-brand mt-1">{formatCurrency(compValue)}</div>
                </button>
              )
            })}
            {filteredCompanies.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400">No companies match "{search}"</div>
            )}
          </div>
        </div>
      </div>

      {/* Company detail */}
      <div className="col-span-12 lg:col-span-9">
        {company ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{company.name}</h2>
                  <p className="text-sm text-gray-500">{company.industry} • {company.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-brand">{formatCurrency(openValue)}</div>
                  <p className="text-xs text-gray-500">Open Pipeline Value</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500">Contacts</div>
                  <div className="text-xl font-bold text-gray-800">{companyContacts.length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Active Deals</div>
                  <div className="text-xl font-bold text-gray-800">{companyDeals.filter((d) => d.stage !== 'Lost' && d.stage !== 'Won').length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Status</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(company.status)}`}>
                    {company.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 flex">
                {['Contacts', 'Deals', 'Activity'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`px-6 py-3 text-sm font-medium transition ${activeTab === tab.toLowerCase() ? 'text-brand border-b-2 border-brand' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'contacts' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-gray-800">Contacts</h3>
                      <button
                        onClick={() => onAddContact(selectedCompany)}
                        className="bg-brand text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-brand-dark"
                      >
                        + Add Contact
                      </button>
                    </div>
                    {companyContacts.map((contact) => (
                      <div key={contact.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-800 text-sm">{contact.name}</h4>
                            <p className="text-xs text-gray-500">{contact.title}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${contact.lastContact ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {daysSince(contact.lastContact)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400" />{contact.email || '—'}</div>
                          <div className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400" />{contact.phone || '—'}</div>
                        </div>
                        {contact.notes && <p className="text-xs text-gray-500 italic mb-2">"{contact.notes}"</p>}
                        <div className="flex items-center gap-3 mb-1">
                          <button onClick={() => onLogInteraction(contact.id)} className="text-brand text-xs font-medium hover:underline">
                            Log Interaction →
                          </button>
                          <button onClick={() => onAddTask(contact.id)} title="Remind me to reconnect" className="text-gray-400 hover:text-brand transition flex items-center gap-1 text-xs">
                            <Bell size={13} /> Remind me
                          </button>
                          <button
                            onClick={() => setExpandedContactId(expandedContactId === contact.id ? null : contact.id)}
                            className="text-gray-400 hover:text-brand transition flex items-center gap-1 text-xs ml-auto"
                          >
                            <History size={13} /> History
                            {expandedContactId === contact.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        </div>
                        {expandedContactId === contact.id && (
                          <div className="border-t border-gray-100 pt-3 mt-2">
                            <InteractionHistory interactions={interactions} contactId={contact.id} />
                          </div>
                        )}
                      </div>
                    ))}
                    {companyContacts.length === 0 && (
                      <p className="text-gray-400 text-sm text-center py-8">No contacts yet. Add the first one.</p>
                    )}
                  </div>
                )}

                {activeTab === 'deals' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Deals & Projects</h3>
                    {companyDeals.length > 0 ? (
                      companyDeals.map((deal) => (
                        <div key={deal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-start gap-3">
                              <FileText size={18} className="text-gray-400 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-gray-800 text-sm">{deal.title}</h4>
                                <p className="text-xs text-gray-500">{contacts.find((c) => c.id === deal.contactId)?.name}</p>
                              </div>
                            </div>
                            <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${getStatusColor(deal.stage)}`}>
                              {deal.stage}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-100">
                            <div>
                              <p className="text-[10px] text-gray-400">Value</p>
                              <p className="text-sm font-bold text-brand">{formatCurrency(deal.value)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400">Probability</p>
                              <p className="text-sm font-semibold text-gray-800">{deal.probability}%</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400">Expected Close</p>
                              <p className="text-sm font-semibold text-gray-800">{deal.closeDate}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-8">No deals yet.</p>
                    )}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-gray-800">Interaction Log</h3>
                      <button
                        onClick={() => onLogInteraction(companyContacts[0]?.id)}
                        className="bg-brand text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-brand-dark flex items-center gap-1"
                      >
                        <Plus size={14} /> Log Interaction
                      </button>
                    </div>
                    <div className="space-y-3">
                      {companyInteractions.map((i) => {
                        const contact = contacts.find((c) => c.id === i.contactId)
                        return (
                          <div key={i.id} className="flex gap-3">
                            <InteractionIcon type={i.type} />
                            <div className="flex-1">
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-sm text-gray-800">
                                  <span className="font-semibold">{i.type}</span> with {contact?.name}
                                </p>
                                <span className="text-xs text-gray-400 whitespace-nowrap">{daysSince(i.date)}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">{i.note}</p>
                            </div>
                          </div>
                        )
                      })}
                      {companyInteractions.length === 0 && (
                        <p className="text-gray-400 text-sm text-center py-8">No interactions logged yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
            <p className="text-gray-400">Select a company to view details, or add a new client.</p>
          </div>
        )}
      </div>
    </div>
  )
}
