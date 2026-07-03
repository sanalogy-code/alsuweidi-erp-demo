import { useState } from 'react'
import { FolderKanban, Camera, PenLine, EyeOff, Eye, CheckCircle2, AlertCircle } from 'lucide-react'
import Modal from '../crm/Modal'
import { PROJECT_TYPES, GENERAL_STATUS } from '../../data/projectsData'

// Marketing's lens on the project list: is each project ready to show clients?
// Portfolio-ready = has a marketing description + approved photography + not
// confidential. Marketing owns the description and the confidentiality flag here.
export default function PortfolioView({ projects, onUpdateProject, onCompleteDescriptionTask }) {
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [readyFilter, setReadyFilter] = useState('')
  const [descProject, setDescProject] = useState(null)
  const [descText, setDescText] = useState('')

  const readiness = (p) => {
    if (p.confidential) return 'confidential'
    if (p.marketingDescription && p.photosApproved) return 'ready'
    return 'incomplete'
  }

  const filtered = projects
    .filter((p) => !typeFilter || p.type === typeFilter)
    .filter((p) => !statusFilter || p.generalStatus === statusFilter)
    .filter((p) => !readyFilter || readiness(p) === readyFilter)

  const readyCount = projects.filter((p) => readiness(p) === 'ready').length
  const missingDesc = projects.filter((p) => !p.marketingDescription && !p.confidential).length

  const openEditor = (p) => {
    setDescProject(p)
    setDescText(p.marketingDescription || '')
  }

  const saveDescription = () => {
    if (descText.trim()) {
      onUpdateProject({ ...descProject, marketingDescription: descText.trim() })
      onCompleteDescriptionTask?.(descProject.id)
    }
    setDescProject(null)
  }

  const toggleConfidential = (p) => onUpdateProject({ ...p, confidential: !p.confidential })

  const READY_CHIP = {
    ready: { label: 'Portfolio-ready', chip: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    incomplete: { label: 'Incomplete', chip: 'bg-amber-100 text-amber-700', icon: AlertCircle },
    confidential: { label: 'Confidential', chip: 'bg-red-100 text-red-700', icon: EyeOff },
  }

  const selectCls = 'border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Portfolio-ready</div>
          <div className="text-2xl font-bold text-gray-800">{readyCount} <span className="text-sm font-normal text-gray-400">/ {projects.length}</span></div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Missing description</div>
          <div className="text-2xl font-bold text-amber-600">{missingDesc}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="text-xs text-gray-500">Confidential</div>
          <div className="text-2xl font-bold text-gray-800">{projects.filter((p) => p.confidential).length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <FolderKanban size={15} className="text-brand" /> Portfolio
          </h2>
          <div className="flex gap-2">
            <select value={readyFilter} onChange={(e) => setReadyFilter(e.target.value)} className={selectCls}>
              <option value="">All readiness</option>
              <option value="ready">Portfolio-ready</option>
              <option value="incomplete">Incomplete</option>
              <option value="confidential">Confidential</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectCls}>
              <option value="">All types</option>
              {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
              <option value="">All statuses</option>
              {GENERAL_STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filtered.map((p) => {
            const r = READY_CHIP[readiness(p)]
            const Icon = r.icon
            return (
              <div key={p.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-800">{p.projectNo} — {p.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 ${r.chip}`}><Icon size={10} /> {r.label}</span>
                    </div>
                    <div className="text-xs text-gray-500">{p.employer} • {p.type} • {p.location} • {p.generalStatus}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs flex items-center gap-1 ${p.photosApproved ? 'text-green-700' : 'text-gray-400'}`}>
                      <Camera size={12} /> {p.photosApproved ? 'Photos approved' : 'No photos'}
                    </span>
                    <button onClick={() => openEditor(p)} className="text-xs font-medium text-brand hover:underline flex items-center gap-1">
                      <PenLine size={12} /> {p.marketingDescription ? 'Edit description' : 'Write description'}
                    </button>
                    <button
                      onClick={() => toggleConfidential(p)}
                      className={`text-xs font-medium hover:underline flex items-center gap-1 ${p.confidential ? 'text-red-600' : 'text-gray-400'}`}
                      title={p.confidential ? 'Confidential — hidden from portfolio and proposals' : 'Mark confidential'}
                    >
                      {p.confidential ? <EyeOff size={12} /> : <Eye size={12} />} {p.confidential ? 'Confidential' : 'Public'}
                    </button>
                  </div>
                </div>
                {p.marketingDescription && !p.confidential && (
                  <p className="text-xs text-gray-600 mt-1.5 bg-gray-50 rounded-md px-3 py-2">{p.marketingDescription}</p>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No projects match these filters.</div>}
        </div>
      </div>

      {descProject && (
        <Modal title={`Marketing description — ${descProject.projectNo}`} onClose={() => setDescProject(null)}>
          <p className="text-xs text-gray-500 mb-3">
            Written for clients, not engineers. Required before the project can be marked Completed.
          </p>
          {descProject.description && (
            <div className="bg-gray-50 rounded-md p-3 mb-3 text-xs text-gray-600">
              <span className="font-semibold text-gray-700">PM's technical description: </span>{descProject.description}
            </div>
          )}
          <textarea
            rows={5}
            value={descText}
            onChange={(e) => setDescText(e.target.value)}
            placeholder="What makes this project worth showcasing?"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            onClick={saveDescription}
            disabled={!descText.trim()}
            className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark mt-3 disabled:opacity-40"
          >
            Save description
          </button>
        </Modal>
      )}
    </div>
  )
}
