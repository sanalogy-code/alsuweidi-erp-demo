import { useState } from 'react'
import { CheckCircle, ArrowRight, FolderKanban } from 'lucide-react'
import Modal from '../crm/Modal'
import { PROJECT_TYPES, MAIN_FUNCTIONS, PROJECT_SCOPES, PROJECT_LOCATIONS, PROJECT_STAGES } from '../../data/projectsData'

// Which pipeline stages each scope covers, and where a fresh project starts.
const STAGES_BY_SCOPE = {
  'Design + Supervision': PROJECT_STAGES,
  'Design only': ['Data Collection', 'Concept', 'Schematic', 'Detailed', 'Tender Docs', 'IFC'],
  'Supervision only': ['Tendering', 'Construction', 'D&L'],
  'Secondment Services': ['Construction'],
}

export default function CreateProjectFromDealModal({ deal, company, employees, existingProjects, onClose, onCreate, onGoToProject }) {
  const [form, setForm] = useState({
    name: deal.title,
    type: 'Buildings',
    mainFunction: MAIN_FUNCTIONS[0],
    scope: 'Design + Supervision',
    location: 'Abu Dhabi',
    dpmId: '',
    cpmId: '',
  })
  const [created, setCreated] = useState(null)

  const nextProjectNo = `P-${Math.max(...existingProjects.map((p) => Number(p.projectNo.replace('P-', '')) || 0)) + 1}`
  const hasDesign = form.scope === 'Design + Supervision' || form.scope === 'Design only'
  const hasSupervision = form.scope === 'Design + Supervision' || form.scope === 'Supervision only'

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const stagesInvolved = STAGES_BY_SCOPE[form.scope]
    const project = {
      projectNo: nextProjectNo,
      name: form.name.trim(),
      employer: company?.name || 'Unknown',
      companyId: company?.id ?? null,
      owner: company?.name || 'Unknown',
      dealId: deal.id,
      type: form.type,
      mainFunction: form.mainFunction,
      location: form.location,
      sector: null,
      plot: null,
      builtupArea: 0,
      description: `Created from won CRM deal "${deal.title}".`,
      generalStatus: 'In Progress',
      fund: 'Private',
      contractType: 'Conventional',
      // Won deal = LOA in hand; the contract itself usually follows
      contractSigned: false,
      loaObtained: true,
      contractValue: deal.value || 0,
      constructionCost: null,
      contractorName: null,
      dpmId: form.dpmId ? Number(form.dpmId) : null,
      cpmId: form.cpmId ? Number(form.cpmId) : null,
      stagesInvolved,
      currentStage: stagesInvolved[0],
      design: hasDesign
        ? { sow: [], status: 'Not Started', outputFormat: null, startYear: new Date().getFullYear(), completionYear: null, financialStatus: 'Open - Managed by DPM', payStatus: 'Not Due' }
        : null,
      supervision: hasSupervision
        ? { coverage: 'Full', status: 'Not Started', payStatus: 'Not Due', contractualCompletion: null, estimatedCompletion: null, approvedPct: 0, actualPct: 0, startYear: new Date().getFullYear(), completionYear: null }
        : null,
    }
    setCreated(onCreate(project))
  }

  if (created) {
    return (
      <Modal title="Project Created" onClose={onClose}>
        <div className="text-center space-y-4 py-4">
          <CheckCircle size={40} className="text-green-600 mx-auto" />
          <div>
            <div className="text-lg font-semibold text-gray-800">{created.projectNo} — {created.name}</div>
            <div className="text-sm text-gray-500 mt-1">
              {created.employer} • {created.type} • fee AED {(created.contractValue || 0).toLocaleString()} carried over from the deal
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Stay in CRM
            </button>
            <button onClick={() => onGoToProject(created)} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-dark flex items-center justify-center gap-1.5">
              Open in Projects <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={`Create Project — ${deal.title}`} onClose={onClose}>
      <form onSubmit={handleCreate} className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-md p-3 text-xs text-green-800 flex items-start gap-2">
          <FolderKanban size={14} className="shrink-0 mt-0.5" />
          Carried over from the won deal: client <span className="font-semibold">{company?.name}</span>, fee <span className="font-semibold">AED {(deal.value || 0).toLocaleString()}</span>, and the link back to CRM. Assigned number: <span className="font-semibold">{nextProjectNo}</span>.
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Project name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
              {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Main function</label>
            <select value={form.mainFunction} onChange={(e) => setForm({ ...form, mainFunction: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
              {MAIN_FUNCTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Scope</label>
            <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
              {PROJECT_SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
            <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
              {PROJECT_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">DPM {hasDesign ? '' : '(optional)'}</label>
            <select value={form.dpmId} onChange={(e) => setForm({ ...form, dpmId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
              <option value="">Not assigned yet</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} — {emp.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">CPM {hasSupervision ? '' : '(optional)'}</label>
            <select value={form.cpmId} onChange={(e) => setForm({ ...form, cpmId: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand">
              <option value="">Not assigned yet</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} — {emp.title}</option>)}
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Starts as In Progress at the {STAGES_BY_SCOPE[form.scope][0]} stage, LOA obtained, contract not yet signed — edit the record in Projects afterwards.
        </div>

        <button type="submit" className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark mt-2">
          Create {nextProjectNo}
        </button>
      </form>
    </Modal>
  )
}
