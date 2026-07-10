import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, Home, TrendingUp, Building2, Users, CheckSquare, BarChart3, FileText, FileSignature } from 'lucide-react'
import Navbar from '../components/Navbar'
import SidebarNav from '../components/SidebarNav'
import Modal from '../components/crm/Modal'
import CreateProjectFromDealModal from '../components/projects/CreateProjectFromDealModal'
import { EMPLOYEES } from '../data/hrData'
import OverviewView from '../components/crm/OverviewView'
import CompaniesView from '../components/crm/CompaniesView'
import ContactsView from '../components/crm/ContactsView'
import PipelineView from '../components/crm/PipelineView'
import TasksView from '../components/crm/TasksView'
import ReportsView from '../components/crm/ReportsView'
import PortfolioDownloads from '../components/crm/PortfolioDownloads'
import ContactDetailModal from '../components/crm/ContactDetailModal'
import CompanyEditModal from '../components/crm/CompanyEditModal'
import DealEditModal from '../components/crm/DealEditModal'
import ExportContactsModal from '../components/crm/ExportContactsModal'
import { INITIAL_COMPANIES, INITIAL_CONTACTS, INITIAL_TASKS, INITIAL_INTERACTIONS, INTERACTION_TYPES, STAGES, todayISO } from '../data/crmData'
import RfpView from '../components/crm/RfpView'
import { INITIAL_RFPS } from '../data/rfpData'
import { nextId } from '../utils/id'

export default function CRM({ user, onLogout, projects = [], onAddProject, deals, setDeals, onRequestStaffing }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [projectDeal, setProjectDeal] = useState(null)
  const [companies, setCompanies] = useState(INITIAL_COMPANIES)
  const [contacts, setContacts] = useState(INITIAL_CONTACTS)
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [interactions, setInteractions] = useState(INITIAL_INTERACTIONS)
  const [rfps, setRfps] = useState(INITIAL_RFPS)

  const [tab, setTab] = useState(location.state?.view || 'overview')
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [search, setSearch] = useState('')
  const [viewContactId, setViewContactId] = useState(null)
  const [showExportContacts, setShowExportContacts] = useState(false)
  const [editingCompanyId, setEditingCompanyId] = useState(null)
  const [editingDealId, setEditingDealId] = useState(null)

  useEffect(() => {
    if (location.state?.view) setTab(location.state.view)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const [showAddCompany, setShowAddCompany] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const [showAddDeal, setShowAddDeal] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showLogInteraction, setShowLogInteraction] = useState(false)
  const [addContactCompanyId, setAddContactCompanyId] = useState(null)

  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', location: '', status: 'Prospect', kind: 'company' })
  const [contactForm, setContactForm] = useState({ name: '', title: '', email: '', phone: '' })
  const [dealForm, setDealForm] = useState({ companyId: '', contactId: '', title: '', value: '', stage: 'Prospecting', probability: 25, closeDate: '' })
  const [taskForm, setTaskForm] = useState({ contactId: '', title: '', dueDate: '' })
  const [interactionForm, setInteractionForm] = useState({ contactId: '', type: 'Call', note: '', date: '' })

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

  function openLogInteraction(contactId) {
    setInteractionForm({ contactId: contactId || '', type: 'Call', note: '', date: todayISO() })
    setShowLogInteraction(true)
  }

  function updateContact(contactId, fields) {
    setContacts(contacts.map((c) => c.id === contactId ? { ...c, ...fields } : c))
  }

  function updateCompany(companyId, fields) {
    setCompanies(companies.map((c) => c.id === companyId ? { ...c, ...fields } : c))
    setEditingCompanyId(null)
  }

  // In-place field updates (notes, subconsultant history) — no edit modal involved.
  function patchCompany(companyId, fields) {
    setCompanies(companies.map((c) => c.id === companyId ? { ...c, ...fields } : c))
  }

  function deleteCompany(companyId) {
    setCompanies(companies.filter((c) => c.id !== companyId))
    setSelectedCompany(null)
    setEditingCompanyId(null)
  }

  function updateDeal(dealId, fields) {
    setDeals(deals.map((d) => d.id === dealId ? { ...d, ...fields } : d))
    setEditingDealId(null)
  }

  function deleteDeal(dealId) {
    setDeals(deals.filter((d) => d.id !== dealId))
    setEditingDealId(null)
  }

  function jumpToCompanyFromDetail(companyId) {
    setViewContactId(null)
    jumpToCompany(companyId)
  }

  function addCompany(e) {
    e.preventDefault()
    if (!companyForm.name.trim()) return
    const id = nextId(companies)
    setCompanies([...companies, { id, tags: [], services: [], keepInMind: [], projectHistory: [], ...companyForm }])
    setCompanyForm({ name: '', industry: '', location: '', status: 'Prospect', kind: 'company' })
    setShowAddCompany(false)
    setSelectedCompany(id)
    setTab('companies')
  }

  function addContact(e) {
    e.preventDefault()
    if (!contactForm.name.trim() || !addContactCompanyId) return
    const id = nextId(contacts)
    setContacts([...contacts, { id, companyId: addContactCompanyId, ...contactForm, lastContact: todayISO(), notes: '' }])
    setContactForm({ name: '', title: '', email: '', phone: '' })
    setShowAddContact(false)
  }

  function addDeal(e) {
    e.preventDefault()
    if (!dealForm.title.trim() || !dealForm.companyId) return
    const id = nextId(deals)
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
    const id = nextId(tasks)
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

  function addInteraction(e) {
    e.preventDefault()
    if (!interactionForm.contactId || !interactionForm.note.trim()) return
    const id = nextId(interactions)
    const contactId = Number(interactionForm.contactId)
    const date = interactionForm.date || todayISO()
    setInteractions([...interactions, { id, contactId, type: interactionForm.type, note: interactionForm.note, date }])
    setContacts(contacts.map((c) => c.id === contactId ? { ...c, lastContact: date } : c))
    setInteractionForm({ contactId: '', type: 'Call', note: '', date: '' })
    setShowLogInteraction(false)
  }

  function moveStage(dealId, stage) {
    setDeals(deals.map((d) => d.id === dealId ? { ...d, stage } : d))
  }

  const dealFormContacts = contacts.filter((c) => c.companyId === Number(dealForm.companyId))

  const dueTaskCount = tasks.filter((t) => !t.done && t.dueDate <= todayISO()).length

  const NAV_MAIN = [
    { key: 'overview', label: 'Overview', icon: Home },
  ]

  const NAV_GROUPS = [
    {
      label: 'Sales',
      items: [
        { key: 'pipeline', label: 'Pipeline', icon: TrendingUp },
        { key: 'rfps', label: 'Proposals (RFPs)', icon: FileSignature, badge: rfps.filter((r) => r.status === 'invited' || r.status === 'preparing').length },
        { key: 'companies', label: 'Companies', icon: Building2 },
        { key: 'contacts', label: 'Contacts', icon: Users },
      ],
    },
    {
      label: 'My Work',
      items: [
        { key: 'tasks', label: 'Tasks', icon: CheckSquare, badge: dueTaskCount },
      ],
    },
    {
      label: 'Insights',
      items: [
        { key: 'reports', label: 'Reports', icon: BarChart3 },
        { key: 'portfolio', label: 'Portfolio PDFs', icon: FileText },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} title="CRM" showBack />

      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-6 items-start">
        <SidebarNav groups={[{ items: NAV_MAIN }, ...NAV_GROUPS]} active={tab} onSelect={setTab} />

        <main className="flex-1 min-w-0 w-full">
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

        {tab === 'overview' && (
          <OverviewView
            companies={companies} contacts={contacts} deals={deals} tasks={tasks}
            onLogInteraction={openLogInteraction} onToggleTask={toggleTask}
            onJumpToCompany={jumpToCompany} setTab={setTab} onViewContact={setViewContactId}
          />
        )}

        {tab === 'rfps' && (
          <RfpView rfps={rfps} onUpdate={setRfps} companies={companies} onRequestStaffing={onRequestStaffing} currentUserName={user?.username} />
        )}

        {tab === 'pipeline' && (
          <PipelineView
            deals={deals} companies={companies} contacts={contacts} projects={projects}
            onMoveStage={moveStage} onAddDeal={() => setShowAddDeal(true)}
            onJumpToCompany={jumpToCompany} onEditDeal={setEditingDealId}
            onCreateProject={setProjectDeal}
            onOpenProject={(project) => navigate('/projects', { state: { openProjectId: project.id } })}
          />
        )}

        {tab === 'companies' && (
          <CompaniesView
            companies={companies} contacts={contacts} deals={deals} interactions={interactions} projects={projects}
            selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}
            search={search} setSearch={setSearch}
            onAddContact={openAddContact} onLogInteraction={openLogInteraction} onAddTask={openAddTask}
            onViewContact={setViewContactId} onEditCompany={setEditingCompanyId} onUpdateCompany={patchCompany}
          />
        )}

        {tab === 'contacts' && (
          <ContactsView
            contacts={contacts} companies={companies} deals={deals} interactions={interactions}
            onAddContact={openAddContact} onLogInteraction={openLogInteraction} onAddTask={openAddTask}
            onJumpToCompany={jumpToCompany} onViewContact={setViewContactId}
            onExport={() => setShowExportContacts(true)}
          />
        )}

        {tab === 'tasks' && (
          <TasksView
            tasks={tasks} contacts={contacts} companies={companies}
            onAddTask={openAddTask} onToggle={toggleTask} onDelete={deleteTask}
            onJumpToCompany={jumpToCompany}
          />
        )}

        {tab === 'reports' && (
          <ReportsView deals={deals} companies={companies} />
        )}

        {tab === 'portfolio' && <PortfolioDownloads />}
        </main>
      </div>

      {showAddCompany && (
        <Modal title="New Client" onClose={() => setShowAddCompany(false)}>
          <form onSubmit={addCompany} className="space-y-3">
            {/* Individuals-as-clients default (decision pending): a private client
                is a record flagged kind: 'individual' — same pipeline/contacts. */}
            <div className="flex gap-1.5">
              {[{ k: 'company', label: 'Company' }, { k: 'individual', label: 'Individual' }].map(({ k, label }) => (
                <button type="button" key={k} onClick={() => setCompanyForm({ ...companyForm, kind: k })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${companyForm.kind === k ? 'bg-brand/10 text-brand border-brand/30' : 'border-gray-200 text-gray-500'}`}>
                  {label}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{companyForm.kind === 'individual' ? 'Client name' : 'Company name'}</label>
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
        <Modal title="New Task" onClose={() => setShowAddTask(false)} layered>
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

      {showLogInteraction && (
        <Modal title="Log Interaction" onClose={() => setShowLogInteraction(false)} layered>
          <form onSubmit={addInteraction} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contact</label>
              <select required value={interactionForm.contactId} onChange={(e) => setInteractionForm({ ...interactionForm, contactId: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                <option value="">Select a contact...</option>
                {contacts.map((c) => {
                  const company = companies.find((co) => co.id === c.companyId)
                  return <option key={c.id} value={c.id}>{c.name} — {company?.name}</option>
                })}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select value={interactionForm.type} onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
                  {INTERACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input required type="date" value={interactionForm.date} onChange={(e) => setInteractionForm({ ...interactionForm, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">What happened?</label>
              <textarea required rows={3} placeholder="e.g. Called to discuss pricing on the retrofit proposal..." value={interactionForm.note} onChange={(e) => setInteractionForm({ ...interactionForm, note: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand resize-none" />
            </div>
            <button type="submit" className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark mt-2">
              Log Interaction
            </button>
          </form>
        </Modal>
      )}

      {viewContactId && (
        <ContactDetailModal
          contact={contacts.find((c) => c.id === viewContactId)}
          company={companies.find((co) => co.id === contacts.find((c) => c.id === viewContactId)?.companyId)}
          deals={deals} interactions={interactions}
          onClose={() => setViewContactId(null)}
          onSave={updateContact}
          onJumpToCompany={jumpToCompanyFromDetail}
          onLogInteraction={openLogInteraction}
          onAddTask={openAddTask}
        />
      )}

      {editingCompanyId && (
        <CompanyEditModal
          company={companies.find((c) => c.id === editingCompanyId)}
          onClose={() => setEditingCompanyId(null)}
          onSave={updateCompany}
          onDelete={deleteCompany}
        />
      )}

      {editingDealId && (
        <DealEditModal
          deal={deals.find((d) => d.id === editingDealId)}
          companies={companies}
          contacts={contacts}
          onClose={() => setEditingDealId(null)}
          onSave={updateDeal}
          onDelete={deleteDeal}
        />
      )}

      {showExportContacts && (
        <ExportContactsModal
          contacts={contacts} companies={companies}
          onClose={() => setShowExportContacts(false)}
        />
      )}

      {projectDeal && (
        <CreateProjectFromDealModal
          deal={projectDeal}
          company={companies.find((c) => c.id === projectDeal.companyId)}
          employees={EMPLOYEES}
          existingProjects={projects}
          onClose={() => setProjectDeal(null)}
          onCreate={onAddProject}
          onGoToProject={(project) => navigate('/projects', { state: { openProjectId: project.id } })}
        />
      )}
    </div>
  )
}
