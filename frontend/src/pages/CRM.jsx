import { useState } from 'react'
import { Plus } from 'lucide-react'
import Navbar from '../components/Navbar'
import Modal from '../components/crm/Modal'
import OverviewView from '../components/crm/OverviewView'
import CompaniesView from '../components/crm/CompaniesView'
import ContactsView from '../components/crm/ContactsView'
import PipelineView from '../components/crm/PipelineView'
import TasksView from '../components/crm/TasksView'
import { INITIAL_COMPANIES, INITIAL_CONTACTS, INITIAL_DEALS, INITIAL_TASKS, STAGES, todayISO } from '../data/crmData'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'companies', label: 'Companies' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'tasks', label: 'Tasks' },
]

export default function CRM({ user, onLogout }) {
  const [companies, setCompanies] = useState(INITIAL_COMPANIES)
  const [contacts, setContacts] = useState(INITIAL_CONTACTS)
  const [deals, setDeals] = useState(INITIAL_DEALS)
  const [tasks, setTasks] = useState(INITIAL_TASKS)

  const [tab, setTab] = useState('overview')
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [search, setSearch] = useState('')

  const [showAddCompany, setShowAddCompany] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const [showAddDeal, setShowAddDeal] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [addContactCompanyId, setAddContactCompanyId] = useState(null)

  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', location: '', status: 'Prospect' })
  const [contactForm, setContactForm] = useState({ name: '', title: '', email: '', phone: '' })
  const [dealForm, setDealForm] = useState({ companyId: '', contactId: '', title: '', value: '', stage: 'Prospecting', probability: 25, closeDate: '' })
  const [taskForm, setTaskForm] = useState({ contactId: '', title: '', dueDate: '' })

  function jumpToCompany(companyId) {
    setSelectedCompany(companyId)
    setTab('companies')
  }

  function openAddContact(companyId) {
    setAddContactCompanyId(companyId)
    setShowAddContact(true)
  }

  function openAddTask(contactId) {
    setTaskForm({ contactId: contactId || '', title: '', dueDate: '' })
    setShowAddTask(true)
  }

  function addCompany(e) {
    e.preventDefault()
    if (!companyForm.name.trim()) return
    const id = Math.max(0, ...companies.map((c) => c.id)) + 1
    setCompanies([...companies, { id, ...companyForm }])
    setCompanyForm({ name: '', industry: '', location: '', status: 'Prospect' })
    setShowAddCompany(false)
    setSelectedCompany(id)
    setTab('companies')
  }

  function addContact(e) {
    e.preventDefault()
    if (!contactForm.name.trim() || !addContactCompanyId) return
    const id = Math.max(0, ...contacts.map((c) => c.id)) + 1
    setContacts([...contacts, { id, companyId: addContactCompanyId, ...contactForm, lastContact: todayISO(), notes: '' }])
    setContactForm({ name: '', title: '', email: '', phone: '' })
    setShowAddContact(false)
  }

  function addDeal(e) {
    e.preventDefault()
    if (!dealForm.title.trim() || !dealForm.companyId) return
    const id = Math.max(0, ...deals.map((d) => d.id)) + 1
    setDeals([...deals, {
      id,
      companyId: Number(dealForm.companyId),
      contactId: dealForm.contactId ? Number(dealForm.contactId) : null,
      title: dealForm.title,
      value: Number(dealForm.value) || 0,
      stage: dealForm.stage,
      probability: Number(dealForm.probability) || 0,
      closeDate: dealForm.closeDate || 'TBD',
    }])
    setDealForm({ companyId: '', contactId: '', title: '', value: '', stage: 'Prospecting', probability: 25, closeDate: '' })
    setShowAddDeal(false)
  }

  function addTask(e) {
    e.preventDefault()
    if (!taskForm.title.trim() || !taskForm.contactId || !taskForm.dueDate) return
    const id = Math.max(0, ...tasks.map((t) => t.id)) + 1
    setTasks([...tasks, { id, contactId: Number(taskForm.contactId), title: taskForm.title, dueDate: taskForm.dueDate, done: false }])
    setTaskForm({ contactId: '', title: '', dueDate: '' })
    setShowAddTask(false)
  }

  function toggleTask(taskId) {
    setTasks(tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t))
  }

  function deleteTask(taskId) {
    setTasks(tasks.filter((t) => t.id !== taskId))
  }

  function logInteraction(contactId) {
    setContacts(contacts.map((c) => c.id === contactId ? { ...c, lastContact: todayISO() } : c))
  }

  function moveStage(dealId, stage) {
    setDeals(deals.map((d) => d.id === dealId ? { ...d, stage } : d))
  }

  const dealFormContacts = contacts.filter((c) => c.companyId === Number(dealForm.companyId))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="CRM" showBack />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">CRM</h1>
            <p className="text-sm text-gray-500">{companies.length} companies • {contacts.length} contacts • {deals.length} deals</p>
          </div>
          <button
            onClick={() => setShowAddCompany(true)}
            className="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={18} /> New Client
          </button>
        </div>

        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === t.key ? 'text-brand border-brand' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <OverviewView
            companies={companies} contacts={contacts} deals={deals} tasks={tasks}
            onLogInteraction={logInteraction} onToggleTask={toggleTask}
            onJumpToCompany={jumpToCompany} setTab={setTab}
          />
        )}

        {tab === 'pipeline' && (
          <PipelineView
            deals={deals} companies={companies} contacts={contacts}
            onMoveStage={moveStage} onAddDeal={() => setShowAddDeal(true)}
            onJumpToCompany={jumpToCompany}
          />
        )}

        {tab === 'companies' && (
          <CompaniesView
            companies={companies} contacts={contacts} deals={deals}
            selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}
            search={search} setSearch={setSearch}
            onAddContact={openAddContact} onLogInteraction={logInteraction} onAddTask={openAddTask}
          />
        )}

        {tab === 'contacts' && (
          <ContactsView
            contacts={contacts} companies={companies} deals={deals}
            onAddContact={openAddContact} onLogInteraction={logInteraction} onAddTask={openAddTask}
            onJumpToCompany={jumpToCompany}
          />
        )}

        {tab === 'tasks' && (
          <TasksView
            tasks={tasks} contacts={contacts} companies={companies}
            onAddTask={openAddTask} onToggle={toggleTask} onDelete={deleteTask}
            onJumpToCompany={jumpToCompany}
          />
        )}
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
        <Modal title={`Add Contact to ${companies.find((c) => c.id === addContactCompanyId)?.name || ''}`} onClose={() => setShowAddContact(false)}>
          <form onSubmit={addContact} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
              <select value={addContactCompanyId || ''} onChange={(e) => setAddContactCompanyId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
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

      {showAddDeal && (
        <Modal title="New Deal" onClose={() => setShowAddDeal(false)}>
          <form onSubmit={addDeal} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
              <select required value={dealForm.companyId} onChange={(e) => setDealForm({ ...dealForm, companyId: e.target.value, contactId: '' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                <option value="">Select a company...</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contact</label>
              <select value={dealForm.contactId} onChange={(e) => setDealForm({ ...dealForm, contactId: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                <option value="">No specific contact</option>
                {dealFormContacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Deal title</label>
              <input required value={dealForm.title} onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Value (AED)</label>
                <input type="number" value={dealForm.value} onChange={(e) => setDealForm({ ...dealForm, value: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Probability (%)</label>
                <input type="number" min="0" max="100" value={dealForm.probability} onChange={(e) => setDealForm({ ...dealForm, probability: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stage</label>
                <select value={dealForm.stage} onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                  {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expected close</label>
                <input placeholder="e.g. 2026-Q4" value={dealForm.closeDate} onChange={(e) => setDealForm({ ...dealForm, closeDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <button type="submit" className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark mt-2">
              Add Deal
            </button>
          </form>
        </Modal>
      )}

      {showAddTask && (
        <Modal title="New Task" onClose={() => setShowAddTask(false)}>
          <form onSubmit={addTask} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contact</label>
              <select required value={taskForm.contactId} onChange={(e) => setTaskForm({ ...taskForm, contactId: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                <option value="">Select a contact...</option>
                {contacts.map((c) => {
                  const company = companies.find((co) => co.id === c.companyId)
                  return <option key={c.id} value={c.id}>{c.name} — {company?.name}</option>
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Reminder</label>
              <input required placeholder="e.g. Follow up on proposal" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Due date</label>
              <input required type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <button type="submit" className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark mt-2">
              Add Task
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
