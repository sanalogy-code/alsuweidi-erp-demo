import { useState } from 'react'
import { Plus, Phone, Mail, FileText, X, Search } from 'lucide-react'
import Navbar from '../components/Navbar'

const INITIAL_COMPANIES = [
  { id: 1, name: 'ADNOC', industry: 'Oil & Gas', location: 'Abu Dhabi', revenue: 2500000, status: 'Active' },
  { id: 2, name: 'Etihad Airways', industry: 'Aviation', location: 'Abu Dhabi', revenue: 1800000, status: 'Active' },
  { id: 3, name: 'DEWA', industry: 'Utilities', location: 'Dubai', revenue: 950000, status: 'Active' },
  { id: 4, name: 'Emaar Properties', industry: 'Real Estate', location: 'Dubai', revenue: 3200000, status: 'Negotiation' },
  { id: 5, name: 'DP World', industry: 'Logistics', location: 'Dubai', revenue: 0, status: 'Prospect' },
]

const INITIAL_CONTACTS = {
  1: [
    { id: 1, name: 'Ahmed Al Mazrouei', title: 'Engineering Manager', email: 'ahmed@adnoc.ae', phone: '+971-2-xxx-xxxx', lastContact: '2026-06-28', notes: 'Discussed pump specifications' },
    { id: 2, name: 'Fatima Al Mansoori', title: 'Project Lead', email: 'fatima@adnoc.ae', phone: '+971-2-xxx-xxxx', lastContact: '2026-06-20', notes: 'Requested proposal for Q3 project' },
  ],
  2: [
    { id: 3, name: 'Mohammed Al Ketbi', title: 'Technical Director', email: 'mkb@etihad.ae', phone: '+971-2-xxx-xxxx', lastContact: '2026-06-25', notes: 'Maintenance contract renewal' },
  ],
  3: [
    { id: 4, name: 'Sara Al Mansoori', title: 'Operations Manager', email: 'sara@dewa.gov.ae', phone: '+971-4-xxx-xxxx', lastContact: '2026-06-22', notes: 'Follow up on grid upgrade project' },
    { id: 5, name: 'Khalid Al Shehhi', title: 'Procurement', email: 'khalid@dewa.gov.ae', phone: '+971-4-xxx-xxxx', lastContact: '2026-05-15', notes: 'Waiting for RFQ approval' },
  ],
  4: [
    { id: 6, name: 'Layla Al Mansouri', title: 'VP Engineering', email: 'layla@emaar.ae', phone: '+971-4-xxx-xxxx', lastContact: '2026-06-15', notes: 'Proposal under review' },
  ],
  5: [
    { id: 7, name: 'Omar Al Mazrouei', title: 'CEO', email: 'omar@dpworld.ae', phone: '+971-4-xxx-xxxx', lastContact: null, notes: 'Cold prospect - needs warm introduction' },
  ],
}

const INITIAL_PROJECTS = {
  1: [
    { id: 101, name: 'Pump Station Upgrade', value: 850000, status: 'Won', date: '2026-Q2', contact: 'Ahmed Al Mazrouei' },
    { id: 102, name: 'Pipeline Inspection', value: 320000, status: 'Proposed', date: '2026-Q3', contact: 'Fatima Al Mansoori' },
    { id: 103, name: 'Control System Retrofit', value: 1330000, status: 'Negotiation', date: '2026-Q4', contact: 'Ahmed Al Mazrouei' },
  ],
  2: [
    { id: 201, name: 'Hangar Electrical Systems', value: 1500000, status: 'Won', date: '2026-Q1', contact: 'Mohammed Al Ketbi' },
    { id: 202, name: 'Maintenance Contract 2026', value: 300000, status: 'Proposed', date: '2026-Q2', contact: 'Mohammed Al Ketbi' },
  ],
  3: [
    { id: 301, name: 'Smart Grid Upgrade Phase 2', value: 950000, status: 'Negotiation', date: '2026-Q3', contact: 'Sara Al Mansoori' },
  ],
  4: [
    { id: 401, name: 'Downtown Development - Infrastructure', value: 3200000, status: 'Proposed', date: '2026-Q4', contact: 'Layla Al Mansouri' },
  ],
  5: [],
}

const ACTIVITY_LOG = [
  { text: 'Proposal submitted for Pipeline Inspection', when: '2 days ago', color: 'bg-brand' },
  { text: 'Contact: Fatima Al Mansoori requested proposal', when: '5 days ago', color: 'bg-green-600' },
  { text: 'Project Won: Pump Station Upgrade (AED 850K)', when: '1 week ago', color: 'bg-green-600' },
]

function getStatusColor(status) {
  switch (status) {
    case 'Won': return 'bg-green-200 text-green-800'
    case 'Proposed': return 'bg-blue-200 text-blue-800'
    case 'Negotiation': return 'bg-yellow-200 text-yellow-800'
    case 'Lost': return 'bg-red-200 text-red-800'
    case 'Active': return 'bg-green-100 text-green-700'
    case 'Prospect': return 'bg-gray-100 text-gray-700'
    default: return 'bg-gray-200 text-gray-700'
  }
}

function formatCurrency(value) {
  if (!value) return 'TBD'
  return `AED ${(value / 1000000).toFixed(2)}M`
}

function daysSince(date) {
  if (!date) return 'Never'
  const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function CRM({ user, onLogout }) {
  const [companies, setCompanies] = useState(INITIAL_COMPANIES)
  const [contacts, setContacts] = useState(INITIAL_CONTACTS)
  const [projects, setProjects] = useState(INITIAL_PROJECTS)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [activeTab, setActiveTab] = useState('contacts')
  const [search, setSearch] = useState('')
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', location: '', status: 'Prospect' })
  const [contactForm, setContactForm] = useState({ name: '', title: '', email: '', phone: '' })

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase())
  )

  const company = selectedCompany ? companies.find((c) => c.id === selectedCompany) : null
  const companyContacts = selectedCompany ? contacts[selectedCompany] || [] : []
  const companyProjects = selectedCompany ? projects[selectedCompany] || [] : []

  function addCompany(e) {
    e.preventDefault()
    if (!companyForm.name.trim()) return
    const id = Math.max(0, ...companies.map((c) => c.id)) + 1
    setCompanies([...companies, { id, revenue: 0, ...companyForm }])
    setContacts({ ...contacts, [id]: [] })
    setProjects({ ...projects, [id]: [] })
    setCompanyForm({ name: '', industry: '', location: '', status: 'Prospect' })
    setShowAddCompany(false)
    setSelectedCompany(id)
  }

  function addContact(e) {
    e.preventDefault()
    if (!contactForm.name.trim() || !selectedCompany) return
    const allContacts = Object.values(contacts).flat()
    const id = Math.max(0, ...allContacts.map((c) => c.id)) + 1
    const newContact = { id, ...contactForm, lastContact: todayISO(), notes: '' }
    setContacts({ ...contacts, [selectedCompany]: [...(contacts[selectedCompany] || []), newContact] })
    setContactForm({ name: '', title: '', email: '', phone: '' })
    setShowAddContact(false)
  }

  function logInteraction(contactId) {
    setContacts({
      ...contacts,
      [selectedCompany]: contacts[selectedCompany].map((c) =>
        c.id === contactId ? { ...c, lastContact: todayISO() } : c
      ),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="CRM" showBack />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">CRM Dashboard</h1>
            <p className="text-sm text-gray-500">{companies.length} companies • {Object.values(contacts).flat().length} contacts</p>
          </div>
          <button
            onClick={() => setShowAddCompany(true)}
            className="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={18} /> New Client
          </button>
        </div>

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
                {filteredCompanies.map((comp) => (
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
                    <div className="text-sm font-semibold text-brand mt-1">{formatCurrency(comp.revenue)}</div>
                  </button>
                ))}
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
                      <div className="text-2xl font-bold text-brand">{formatCurrency(company.revenue)}</div>
                      <p className="text-xs text-gray-500">Total Pipeline Value</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500">Contacts</div>
                      <div className="text-xl font-bold text-gray-800">{companyContacts.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Active Projects</div>
                      <div className="text-xl font-bold text-gray-800">{companyProjects.filter((p) => p.status !== 'Lost').length}</div>
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
                    {['Contacts', 'Projects', 'Activity'].map((tab) => (
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
                            onClick={() => setShowAddContact(true)}
                            className="bg-brand text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-brand-dark flex items-center gap-1"
                          >
                            <Plus size={14} /> Add Contact
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
                            <button onClick={() => logInteraction(contact.id)} className="text-brand text-xs font-medium hover:underline">
                              Log Interaction →
                            </button>
                          </div>
                        ))}
                        {companyContacts.length === 0 && (
                          <p className="text-gray-400 text-sm text-center py-8">No contacts yet. Add the first one.</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'projects' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-semibold text-gray-800">Projects & Proposals</h3>
                        </div>
                        {companyProjects.length > 0 ? (
                          companyProjects.map((project) => (
                            <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-start gap-3">
                                  <FileText size={18} className="text-gray-400 mt-0.5" />
                                  <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">{project.name}</h4>
                                    <p className="text-xs text-gray-500">{project.contact}</p>
                                  </div>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${getStatusColor(project.status)}`}>
                                  {project.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100">
                                <div>
                                  <p className="text-[10px] text-gray-400">Value</p>
                                  <p className="text-sm font-bold text-brand">{formatCurrency(project.value)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-400">Timeline</p>
                                  <p className="text-sm font-semibold text-gray-800">{project.date}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm text-center py-8">No projects yet.</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'activity' && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Recent Activity</h3>
                        {ACTIVITY_LOG.map((a, i) => (
                          <div key={i} className="flex gap-3">
                            <div className={`w-1 rounded-full ${a.color}`} />
                            <div>
                              <p className="text-sm text-gray-800">{a.text}</p>
                              <p className="text-xs text-gray-400">{a.when}</p>
                            </div>
                          </div>
                        ))}
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
      </div>

      {showAddCompany && (
        <Modal title="New Client" onClose={() => setShowAddCompany(false)}>
          <form onSubmit={addCompany} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company name</label>
              <input required value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Industry</label>
              <input value={companyForm.industry} onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input value={companyForm.location} onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={companyForm.status} onChange={(e) => setCompanyForm({ ...companyForm, status: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                <option>Prospect</option>
                <option>Active</option>
                <option>Negotiation</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark mt-2">
              Add Client
            </button>
          </form>
        </Modal>
      )}

      {showAddContact && (
        <Modal title={`Add Contact to ${company?.name}`} onClose={() => setShowAddContact(false)}>
          <form onSubmit={addContact} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full name</label>
              <input required value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input value={contactForm.title} onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <button type="submit" className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark mt-2">
              Add Contact
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
