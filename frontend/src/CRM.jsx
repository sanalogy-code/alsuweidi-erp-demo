import { useState } from 'react'
import { ChevronDown, Plus, Phone, Mail, Calendar, DollarSign, FileText } from 'lucide-react'

const CRM = () => {
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [activeTab, setActiveTab] = useState('companies')

  // Dummy data
  const companies = [
    { id: 1, name: 'ADNOC', industry: 'Oil & Gas', location: 'Abu Dhabi', revenue: 2500000, status: 'Active', color: 'bg-blue-100' },
    { id: 2, name: 'Etihad Airways', industry: 'Aviation', location: 'Abu Dhabi', revenue: 1800000, status: 'Active', color: 'bg-green-100' },
    { id: 3, name: 'DEWA', industry: 'Utilities', location: 'Dubai', revenue: 950000, status: 'Active', color: 'bg-yellow-100' },
    { id: 4, name: 'Emaar Properties', industry: 'Real Estate', location: 'Dubai', revenue: 3200000, status: 'Negotiation', color: 'bg-purple-100' },
    { id: 5, name: 'DP World', industry: 'Logistics', location: 'Dubai', revenue: 0, status: 'Prospect', color: 'bg-gray-100' },
  ]

  const contacts = {
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

  const projects = {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Won': return 'bg-green-200 text-green-800'
      case 'Proposed': return 'bg-blue-200 text-blue-800'
      case 'Negotiation': return 'bg-yellow-200 text-yellow-800'
      case 'Lost': return 'bg-red-200 text-red-800'
      case 'Active': return 'bg-green-100'
      case 'Prospect': return 'bg-gray-100'
      default: return 'bg-gray-200'
    }
  }

  const formatCurrency = (value) => {
    if (value === 0) return 'TBD'
    return `AED ${(value / 1000000).toFixed(2)}M`
  }

  const daysSince = (date) => {
    if (!date) return 'Never'
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  const company = selectedCompany ? companies.find(c => c.id === selectedCompany) : null
  const companyContacts = selectedCompany ? contacts[selectedCompany] || [] : []
  const companyProjects = selectedCompany ? projects[selectedCompany] || [] : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">CRM Dashboard</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} /> New Company
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Companies List */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Companies ({companies.length})</h2>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {companies.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedCompany(comp.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition border-l-4 ${selectedCompany === comp.id ? 'border-blue-600 bg-blue-50' : 'border-transparent'}`}
                  >
                    <div className="font-semibold text-gray-800">{comp.name}</div>
                    <div className="text-sm text-gray-600">{comp.industry}</div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">{comp.location}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(comp.status)}`}>{comp.status}</span>
                    </div>
                    <div className="text-sm font-semibold text-blue-600 mt-1">{formatCurrency(comp.revenue)}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Company Details */}
          <div className="col-span-9">
            {company ? (
              <div className="space-y-6">
                {/* Company Overview */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{company.name}</h2>
                      <p className="text-gray-600">{company.industry} • {company.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">{formatCurrency(company.revenue)}</div>
                      <p className="text-sm text-gray-600">Total Pipeline Value</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-sm text-gray-600">Contacts</div>
                      <div className="text-2xl font-bold text-gray-800">{companyContacts.length}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Active Projects</div>
                      <div className="text-2xl font-bold text-gray-800">{companyProjects.filter(p => p.status !== 'Lost').length}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(company.status)}`}>
                        {company.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow">
                  <div className="border-b border-gray-200 flex">
                    {['Contacts', 'Projects', 'Activity'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`px-6 py-4 font-medium transition ${activeTab === tab.toLowerCase() ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    {/* Contacts Tab */}
                    {activeTab === 'contacts' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Contacts</h3>
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1">
                            <Plus size={16} /> Add Contact
                          </button>
                        </div>
                        {companyContacts.map(contact => (
                          <div key={contact.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-800">{contact.name}</h4>
                                <p className="text-sm text-gray-600">{contact.title}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${contact.lastContact ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {daysSince(contact.lastContact)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail size={16} className="text-gray-400" />
                                {contact.email}
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone size={16} className="text-gray-400" />
                                {contact.phone}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 italic">"{contact.notes}"</p>
                            <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">Log Interaction →</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Projects Tab */}
                    {activeTab === 'projects' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Projects & Proposals</h3>
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1">
                            <Plus size={16} /> New Proposal
                          </button>
                        </div>
                        {companyProjects.length > 0 ? (
                          companyProjects.map(project => (
                            <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-start gap-3">
                                  <FileText size={20} className="text-gray-400 mt-1" />
                                  <div>
                                    <h4 className="font-semibold text-gray-800">{project.name}</h4>
                                    <p className="text-sm text-gray-600">{project.contact}</p>
                                  </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(project.status)}`}>
                                  {project.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                                <div>
                                  <p className="text-xs text-gray-600">Value</p>
                                  <p className="text-lg font-bold text-blue-600">{formatCurrency(project.value)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Timeline</p>
                                  <p className="font-semibold text-gray-800">{project.date}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-8">No projects yet. Create your first proposal.</p>
                        )}
                      </div>
                    )}

                    {/* Activity Tab */}
                    {activeTab === 'activity' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                          <div className="flex gap-4">
                            <div className="w-1 bg-blue-600 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">Proposal submitted for Pipeline Inspection</p>
                              <p className="text-xs text-gray-500">2 days ago</p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="w-1 bg-green-600 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">Contact: Fatima Al Mansoori requested proposal</p>
                              <p className="text-xs text-gray-500">5 days ago</p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="w-1 bg-green-600 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">Project Won: Pump Station Upgrade (AED 850K)</p>
                              <p className="text-xs text-gray-500">1 week ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">Select a company to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CRM
