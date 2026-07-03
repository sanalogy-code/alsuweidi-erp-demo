import { useState } from 'react'
import { FileStack, CheckSquare, Square, EyeOff, Sparkles, Eye } from 'lucide-react'
import Modal from '../crm/Modal'
import CvSearch from '../hr/CvSearch'
import { PROJECT_TYPES, MAIN_FUNCTIONS } from '../../data/projectsData'

// Assemble a proposal pack: auto-suggested + hand-picked reference projects and
// team CVs. Confidential projects never appear. Export is a print-friendly
// preview until Phase 2 document generation.
export default function ProposalBuilder({ projects, employees }) {
  const [typeFilter, setTypeFilter] = useState('')
  const [functionFilter, setFunctionFilter] = useState('')
  const [selectedProjects, setSelectedProjects] = useState([])
  const [selectedPeople, setSelectedPeople] = useState([])
  const [step, setStep] = useState('projects') // projects | team
  const [preview, setPreview] = useState(false)

  const eligible = projects.filter((p) => !p.confidential)
  const confidentialCount = projects.length - eligible.length

  const filtered = eligible
    .filter((p) => !typeFilter || p.type === typeFilter)
    .filter((p) => !functionFilter || p.mainFunction === functionFilter)

  const toggleProject = (id) =>
    setSelectedProjects((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const togglePerson = (id) =>
    setSelectedPeople((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  // Auto-select: portfolio-ready projects matching the current filters
  const autoSelect = () => {
    const ready = filtered.filter((p) => p.marketingDescription && p.photosApproved).map((p) => p.id)
    setSelectedProjects([...new Set([...selectedProjects, ...ready])])
  }

  const chosenProjects = projects.filter((p) => selectedProjects.includes(p.id))
  const chosenPeople = employees.filter((e) => selectedPeople.includes(e.id))

  const selectCls = 'border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand'

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <FileStack size={15} className="text-brand" /> Proposal builder
          </h2>
          <p className="text-xs text-gray-500">
            Pick reference projects and team CVs for a proposal. {confidentialCount > 0 && <span className="text-red-600 inline-flex items-center gap-0.5"><EyeOff size={10} /> {confidentialCount} confidential project{confidentialCount > 1 ? 's' : ''} hidden.</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-gray-100 rounded-md p-1 gap-1">
            <button onClick={() => setStep('projects')} className={`px-3 py-1.5 rounded text-xs font-medium transition ${step === 'projects' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
              1. Projects ({selectedProjects.length})
            </button>
            <button onClick={() => setStep('team')} className={`px-3 py-1.5 rounded text-xs font-medium transition ${step === 'team' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
              2. Team CVs ({selectedPeople.length})
            </button>
          </div>
          <button
            onClick={() => setPreview(true)}
            disabled={selectedProjects.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-white hover:bg-brand-dark transition disabled:opacity-40"
          >
            <Eye size={13} /> Preview pack
          </button>
        </div>
      </div>

      {step === 'projects' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-2">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectCls}>
                <option value="">All types</option>
                {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <select value={functionFilter} onChange={(e) => setFunctionFilter(e.target.value)} className={selectCls}>
                <option value="">All functions</option>
                {MAIN_FUNCTIONS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <button onClick={autoSelect} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">
              <Sparkles size={12} /> Auto-select portfolio-ready
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {filtered.map((p) => {
              const selected = selectedProjects.includes(p.id)
              const ready = p.marketingDescription && p.photosApproved
              return (
                <button key={p.id} onClick={() => toggleProject(p.id)} className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition">
                  <span className={selected ? 'text-brand' : 'text-gray-300'}>
                    {selected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 truncate">{p.projectNo} — {p.name}</span>
                      {ready
                        ? <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-medium shrink-0">Portfolio-ready</span>
                        : <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-medium shrink-0">{p.marketingDescription ? 'No photos' : 'No description'}</span>}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{p.employer} • {p.type} • {p.mainFunction} • {p.location}</div>
                  </div>
                </button>
              )
            })}
            {filtered.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No projects match these filters.</div>}
          </div>
        </div>
      )}

      {step === 'team' && (
        <CvSearch
          employees={employees}
          selectable
          selectedIds={selectedPeople}
          onToggleSelect={togglePerson}
        />
      )}

      {preview && (
        <Modal title="Proposal pack preview" onClose={() => setPreview(false)} wide>
          <p className="text-xs text-gray-500 mb-4">
            Preview of the reference-projects and team sections. Branded PDF/slides export comes with Phase 2 document generation — for now, print this preview.
          </p>

          <div className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">Reference projects ({chosenProjects.length})</div>
          <div className="space-y-3 mb-6">
            {chosenProjects.map((p) => (
              <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-gray-800">{p.name}</div>
                  <span className="text-xs text-gray-400 shrink-0">{p.projectNo}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1.5">{p.employer} • {p.mainFunction} • {p.location}{p.builtupArea ? ` • ${p.builtupArea.toLocaleString()} sqm` : ''}</div>
                <p className="text-xs text-gray-700">
                  {p.marketingDescription || <span className="text-amber-600 italic">Marketing description missing — write it in Portfolio before sending this pack.</span>}
                </p>
              </div>
            ))}
          </div>

          {chosenPeople.length > 0 && (
            <>
              <div className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">Proposed team ({chosenPeople.length})</div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {chosenPeople.map((emp) => (
                  <div key={emp.id} className="border border-gray-200 rounded-lg p-3 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold shrink-0">
                      {emp.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-800">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.title} — {emp.dept}</div>
                      {emp.accomplishments?.length > 0 && (
                        <div className="text-[11px] text-gray-500 mt-1">{emp.accomplishments.map((a) => a.type).join(' • ')}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <button onClick={() => window.print()} className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark">
            Print preview
          </button>
        </Modal>
      )}
    </div>
  )
}
