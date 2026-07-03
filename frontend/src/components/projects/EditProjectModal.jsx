import { useState } from 'react'
import Modal from '../crm/Modal'
import {
  PROJECT_TYPES, MAIN_FUNCTIONS, PROJECT_LOCATIONS, CONTRACT_TYPES,
  FUND_SOURCES, GENERAL_STATUS,
} from '../../data/projectsData'

// Edit the core project record. Scope/stage structure is not editable here —
// the stage moves from the detail modal's pipeline control, and changing scope
// after creation would need a data-migration story even in the real system.

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

export default function EditProjectModal({ project, employees, canViewSensitive, onClose, onSave, onAddMarketingTask }) {
  const [completionBlocked, setCompletionBlocked] = useState(false)
  const [form, setForm] = useState({
    name: project.name,
    employer: project.employer,
    type: project.type,
    mainFunction: project.mainFunction,
    location: project.location,
    sector: project.sector || '',
    plot: project.plot || '',
    builtupArea: project.builtupArea || '',
    description: project.description || '',
    generalStatus: project.generalStatus,
    contractType: project.contractType,
    fund: project.fund,
    contractSigned: project.contractSigned,
    contractorName: project.contractorName || '',
    dpmId: project.dpmId ?? '',
    cpmId: project.cpmId ?? '',
    contractValue: project.contractValue ?? '',
    constructionCost: project.constructionCost ?? '',
  })

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  // A project cannot be marked Completed without Marketing's sign-off: a
  // marketing description AND approved professional photography. Trying to
  // complete without them queues the missing tasks in Marketing's inbox.
  const marketingGate = form.generalStatus === 'Completed' && (!project.marketingDescription || !project.photosApproved)

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.employer.trim()) return
    if (marketingGate) {
      setCompletionBlocked(true)
      const relatedName = `${project.projectNo} — ${project.name}`
      if (!project.marketingDescription) {
        onAddMarketingTask?.({
          type: 'marketing_description', relatedKind: 'project', relatedId: project.id, relatedName,
          notes: 'Completion attempted — description needed before the project can close.',
        })
      }
      if (!project.photosApproved) {
        onAddMarketingTask?.({
          type: 'project_photos', relatedKind: 'project', relatedId: project.id, relatedName,
          notes: 'Completion attempted — professional photos needed before the project can close.',
        })
      }
      return
    }
    onSave({
      ...project,
      name: form.name.trim(),
      employer: form.employer.trim(),
      owner: form.employer.trim(),
      type: form.type,
      mainFunction: form.mainFunction,
      location: form.location,
      sector: form.sector.trim() || null,
      plot: form.plot.trim() || null,
      builtupArea: Number(form.builtupArea) || 0,
      description: form.description.trim() || null,
      generalStatus: form.generalStatus,
      contractType: form.contractType,
      fund: form.fund,
      contractSigned: form.contractSigned,
      contractorName: form.contractorName.trim() || null,
      dpmId: form.dpmId ? Number(form.dpmId) : null,
      cpmId: form.cpmId ? Number(form.cpmId) : null,
      ...(canViewSensitive ? {
        contractValue: form.contractValue === '' ? null : Number(form.contractValue),
        constructionCost: form.constructionCost === '' ? null : Number(form.constructionCost),
      } : {}),
    })
    onClose()
  }

  return (
    <Modal title={`Edit ${project.projectNo}`} onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className={labelCls}>Project name *</label>
          <input required value={form.name} onChange={set('name')} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Employer / client *</label>
          <input required value={form.employer} onChange={set('employer')} className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Status</label>
            <select value={form.generalStatus} onChange={set('generalStatus')} className={inputCls}>
              {GENERAL_STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
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
            <label className={labelCls}>Location</label>
            <select value={form.location} onChange={set('location')} className={inputCls}>
              {PROJECT_LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Sector</label>
            <input value={form.sector} onChange={set('sector')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Plot</label>
            <input value={form.plot} onChange={set('plot')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Built-up area (sqm)</label>
            <input type="number" min="0" value={form.builtupArea} onChange={set('builtupArea')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contractor</label>
            <input value={form.contractorName} onChange={set('contractorName')} className={inputCls} />
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
            <label className={labelCls}>DPM</label>
            <select value={form.dpmId} onChange={set('dpmId')} className={inputCls}>
              <option value="">Not assigned</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} — {emp.title}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>CPM</label>
            <select value={form.cpmId} onChange={set('cpmId')} className={inputCls}>
              <option value="">Not assigned</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} — {emp.title}</option>)}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.contractSigned}
            onChange={(e) => setForm({ ...form, contractSigned: e.target.checked })}
            className="rounded border-gray-300 text-brand focus:ring-brand"
          />
          Contract signed
        </label>

        {canViewSensitive && (
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-md p-3">
            <div>
              <label className={labelCls}>Contract value (AED fees)</label>
              <input type="number" min="0" value={form.contractValue} onChange={set('contractValue')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Construction cost (AED)</label>
              <input type="number" min="0" value={form.constructionCost} onChange={set('constructionCost')} className={inputCls} />
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>Description</label>
          <textarea rows={2} value={form.description} onChange={set('description')} className={inputCls} />
        </div>

        {completionBlocked && marketingGate && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-800">
            <span className="font-semibold">Can't mark Completed yet — Marketing sign-off missing:</span>
            <ul className="list-disc ml-4 mt-1 space-y-0.5">
              {!project.marketingDescription && <li>Marketing description not written</li>}
              {!project.photosApproved && <li>Professional project photos not approved (site snaps don't count)</li>}
            </ul>
            <div className="mt-1.5">The missing tasks have been added to Marketing's inbox. Set the status back, or wait for Marketing.</div>
          </div>
        )}

        <button type="submit" className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark mt-2">
          Save changes
        </button>
      </form>
    </Modal>
  )
}
