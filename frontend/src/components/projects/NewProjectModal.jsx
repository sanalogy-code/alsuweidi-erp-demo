import { useRef, useState } from 'react'
import { FileCheck, Upload } from 'lucide-react'
import Modal from '../crm/Modal'
import {
  PROJECT_TYPES, MAIN_FUNCTIONS, PROJECT_SCOPES, PROJECT_LOCATIONS,
  CONTRACT_TYPES, FUND_SOURCES, STAGES_BY_SCOPE,
} from '../../data/projectsData'

// Direct project entry (award or tender that didn't come through CRM) — the
// won-deal path lives in CreateProjectFromDealModal. Same rule applies: no
// project record without the LOA on file.

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

export default function NewProjectModal({ employees, existingProjects, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '', employer: '',
    type: 'Buildings',
    mainFunction: MAIN_FUNCTIONS[0],
    scope: 'Design + Supervision',
    location: 'Abu Dhabi',
    contractType: 'Conventional',
    fund: 'Private',
    contractValue: '',
    dpmId: '', cpmId: '',
    description: '',
  })
  const [loaFile, setLoaFile] = useState(null)
  const loaRef = useRef(null)

  const nextProjectNo = `P-${Math.max(...existingProjects.map((p) => Number(p.projectNo.replace('P-', '')) || 0)) + 1}`
  const hasDesign = form.scope === 'Design + Supervision' || form.scope === 'Design only'
  const hasSupervision = form.scope === 'Design + Supervision' || form.scope === 'Supervision only'

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.employer.trim()) return
    if (!loaFile) {
      alert('Attach the Letter of Award — a project record cannot be created without it.')
      return
    }
    const stagesInvolved = STAGES_BY_SCOPE[form.scope]
    onCreate({
      projectNo: nextProjectNo,
      name: form.name.trim(),
      employer: form.employer.trim(),
      companyId: null,
      owner: form.employer.trim(),
      type: form.type,
      scope: form.scope,
      mainFunction: form.mainFunction,
      location: form.location,
      sector: null,
      plot: null,
      builtupArea: 0,
      description: form.description.trim() || null,
      generalStatus: 'In Progress',
      fund: form.fund,
      contractType: form.contractType,
      contractSigned: false,
      loaObtained: true,
      contractValue: Number(form.contractValue) || 0,
      constructionCost: null,
      contractorName: null,
      dpmId: form.dpmId ? Number(form.dpmId) : null,
      cpmId: form.cpmId ? Number(form.cpmId) : null,
      stagesInvolved,
      currentStage: stagesInvolved[0],
      documents: [{ type: 'loa', fileName: loaFile, uploadedDate: new Date().toISOString().slice(0, 10) }],
      design: hasDesign
        ? { sow: [], status: 'Not Started', outputFormat: null, startYear: new Date().getFullYear(), completionYear: null, financialStatus: 'Open - Managed by DPM', payStatus: 'Not Due' }
        : null,
      supervision: hasSupervision
        ? { coverage: 'Full', status: 'Not Started', payStatus: 'Not Due', contractualCompletion: null, estimatedCompletion: null, approvedPct: 0, actualPct: 0, startYear: new Date().getFullYear(), completionYear: null }
        : null,
    })
    onClose()
  }

  return (
    <Modal title={`New project — ${nextProjectNo}`} onClose={onClose}>
      <form onSubmit={handleCreate} className="space-y-3">
        <div>
          <label className={labelCls}>Project name *</label>
          <input required value={form.name} onChange={set('name')} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Employer / client *</label>
          <input required value={form.employer} onChange={set('employer')} placeholder="Who awarded the project" className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Type</label>
            <select value={form.type} onChange={set('type')} className={inputCls}>
              {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Main function</label>
            <select value={form.mainFunction} onChange={set('mainFunction')} className={inputCls}>
              {MAIN_FUNCTIONS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Scope</label>
            <select value={form.scope} onChange={set('scope')} className={inputCls}>
              {PROJECT_SCOPES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Location</label>
            <select value={form.location} onChange={set('location')} className={inputCls}>
              {PROJECT_LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Contract type</label>
            <select value={form.contractType} onChange={set('contractType')} className={inputCls}>
              {CONTRACT_TYPES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Fund</label>
            <select value={form.fund} onChange={set('fund')} className={inputCls}>
              {FUND_SOURCES.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Contract value (AED fees)</label>
            <input type="number" min="0" value={form.contractValue} onChange={set('contractValue')} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>DPM {hasDesign ? '' : '(optional)'}</label>
            <select value={form.dpmId} onChange={set('dpmId')} className={inputCls}>
              <option value="">Not assigned yet</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} — {emp.title}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>CPM {hasSupervision ? '' : '(optional)'}</label>
            <select value={form.cpmId} onChange={set('cpmId')} className={inputCls}>
              <option value="">Not assigned yet</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} — {emp.title}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea rows={2} value={form.description} onChange={set('description')} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Letter of Award (LOA) * — required to create the project</label>
          <input ref={loaRef} type="file" className="hidden" onChange={(e) => setLoaFile(e.target.files?.[0]?.name || null)} />
          <button
            type="button"
            onClick={() => loaRef.current?.click()}
            className={`w-full flex items-center gap-2 border rounded-md px-3 py-2 text-sm ${loaFile ? 'border-green-300 bg-green-50 text-green-800' : 'border-red-200 bg-red-50/40 text-gray-600'}`}
          >
            {loaFile ? <><FileCheck size={14} className="text-green-600" /> {loaFile}</> : <><Upload size={14} className="text-red-400" /> Attach LOA…</>}
          </button>
        </div>

        <div className="text-xs text-gray-500">
          Starts as In Progress at the {STAGES_BY_SCOPE[form.scope][0]} stage, contract not yet signed — edit the record afterwards.
        </div>

        <button type="submit" disabled={!loaFile} className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark mt-2 disabled:opacity-40">
          Create {nextProjectNo}
        </button>
      </form>
    </Modal>
  )
}
