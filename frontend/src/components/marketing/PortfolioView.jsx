import { useState } from 'react'
import { FolderKanban, Camera, PenLine, EyeOff, Eye, CheckCircle2, AlertCircle, Search, FileText, Plus, Trash2, Image } from 'lucide-react'
import Modal from '../crm/Modal'
import { PROJECT_TYPES, MAIN_FUNCTIONS, PROJECT_SCOPES, GENERAL_STATUS, scopeOf, yearStartedOf, yearCompletedOf } from '../../data/projectsData'
import { usePortfolioPacks, addPortfolioPack, removePortfolioPack } from '../../data/portfolioPacksStore'
import PackUsageLog from './PackUsageLog'

// Built-up-area bands for "find me a project about this size" searches.
// Projects with no recorded area (0 / infrastructure) only match "All sizes".
const SIZE_BANDS = [
  { key: 'lt5k', label: 'Under 5,000 sqm', min: 1, max: 4999 },
  { key: '5k-20k', label: '5,000 – 20,000 sqm', min: 5000, max: 19999 },
  { key: '20k-50k', label: '20,000 – 50,000 sqm', min: 20000, max: 49999 },
  { key: 'gte50k', label: '50,000+ sqm', min: 50000, max: Infinity },
]

// Marketing's lens on the project list: is each project ready to show clients?
// Portfolio-ready = has a marketing description + approved photography + not
// confidential. Marketing owns the description and the confidentiality flag here.
export default function PortfolioView({ projects, onUpdateProject, onCompleteDescriptionTask, packUsage = [], onLogPackUsage }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [functionFilter, setFunctionFilter] = useState('')
  const [sizeFilter, setSizeFilter] = useState('')
  const [scopeFilter, setScopeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [readyFilter, setReadyFilter] = useState('')
  const [descProject, setDescProject] = useState(null)
  const [descText, setDescText] = useState('')

  // Portfolio packs — category PDFs CRM can download; shared store so the CRM
  // page sees adds/removes without an App.jsx prop chain.
  const packs = usePortfolioPacks()
  const [packForm, setPackForm] = useState({ category: '', fileName: '' })
  const packCategories = [...new Set(packs.map((p) => p.category))].sort()

  const addPack = (e) => {
    e.preventDefault()
    if (!packForm.category.trim() || !packForm.fileName.trim()) return
    addPortfolioPack({ category: packForm.category.trim(), fileName: packForm.fileName.trim() })
    setPackForm({ category: '', fileName: '' })
  }

  const readiness = (p) => {
    if (p.confidential) return 'confidential'
    if (p.marketingDescription && p.photosApproved) return 'ready'
    return 'incomplete'
  }

  const sizeBand = SIZE_BANDS.find((b) => b.key === sizeFilter)
  const q = search.trim().toLowerCase()
  const filtered = projects
    .filter((p) => !q || `${p.projectNo} ${p.name} ${p.employer} ${p.mainFunction} ${p.marketingDescription || ''}`.toLowerCase().includes(q))
    .filter((p) => !typeFilter || p.type === typeFilter)
    .filter((p) => !functionFilter || p.mainFunction === functionFilter)
    .filter((p) => !sizeBand || (p.builtupArea >= sizeBand.min && p.builtupArea <= sizeBand.max))
    .filter((p) => !scopeFilter || scopeOf(p) === scopeFilter)
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

  // Confidentiality is the PM's decision at project start — Marketing can see it,
  // but flipping it here has to be deliberate, hence the confirm.
  const toggleConfidential = (p) => {
    const msg = p.confidential
      ? `Make "${p.projectNo} — ${p.name}" PUBLIC?\n\nIt will appear in the portfolio and can be picked for proposals. Confidentiality is normally the PM's decision at project start — only change it if that's been agreed.`
      : `Mark "${p.projectNo} — ${p.name}" CONFIDENTIAL?\n\nIt disappears from the portfolio and can no longer be picked for proposals. Confidentiality is normally the PM's decision at project start — only change it if that's been agreed.`
    if (window.confirm(msg)) onUpdateProject({ ...p, confidential: !p.confidential })
  }

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
        <div className="p-4 border-b border-gray-200 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <FolderKanban size={15} className="text-brand" /> Portfolio
              <span className="text-xs font-normal text-gray-400">{filtered.length} of {projects.length}</span>
            </h2>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, client, description…"
                className="w-64 border border-gray-200 rounded-md pl-8 pr-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
          {/* Find a reference project by what it is, not just its status: industry, size band, and scope */}
          <div className="flex gap-2 flex-wrap">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectCls}>
              <option value="">All types</option>
              {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={functionFilter} onChange={(e) => setFunctionFilter(e.target.value)} className={selectCls}>
              <option value="">All industries</option>
              {MAIN_FUNCTIONS.map((f) => <option key={f}>{f}</option>)}
            </select>
            <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className={selectCls}>
              <option value="">All sizes</option>
              {SIZE_BANDS.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
            </select>
            <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)} className={selectCls}>
              <option value="">All scopes</option>
              {PROJECT_SCOPES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
              <option value="">All statuses</option>
              {GENERAL_STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={readyFilter} onChange={(e) => setReadyFilter(e.target.value)} className={selectCls}>
              <option value="">All readiness</option>
              <option value="ready">Portfolio-ready</option>
              <option value="incomplete">Incomplete</option>
              <option value="confidential">Confidential</option>
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
                    <div className="text-xs text-gray-500">
                      {p.employer} • {p.mainFunction}{p.builtupArea ? ` • ${p.builtupArea.toLocaleString()} sqm` : ''} • {scopeOf(p)} • {p.generalStatus}
                    </div>
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
                      className={`text-xs font-medium hover:underline flex items-center gap-1 ${p.confidential ? 'text-red-600' : p.confidential === undefined ? 'text-amber-600' : 'text-gray-400'}`}
                      title={p.confidential ? 'Confidential — hidden from portfolio and proposals' : p.confidential === undefined ? 'PM has not decided confidentiality yet — treated as public for now' : 'Mark confidential (PM decision — confirm required)'}
                    >
                      {p.confidential ? <EyeOff size={12} /> : <Eye size={12} />} {p.confidential ? 'Confidential' : p.confidential === undefined ? 'Not decided' : 'Public'}
                    </button>
                  </div>
                </div>
                {p.marketingDescription && !p.confidential && (
                  <p className="text-xs text-gray-600 mt-1.5 bg-gray-50 rounded-md px-3 py-2">{p.marketingDescription}</p>
                )}
                {/* The proposal-ready facts — the fields that used to live in the Proposal Builder */}
                {!p.confidential && (
                  <div className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-3 flex-wrap">
                    <span>{p.location}</span>
                    {yearStartedOf(p) && <span>{yearStartedOf(p)} → {yearCompletedOf(p) || 'ongoing'}</span>}
                    {p.constructionCost != null && <span>~{(p.constructionCost / 1000000).toLocaleString()}M AED construction</span>}
                    {p.images?.length > 0 && <span className="flex items-center gap-1"><Image size={10} /> {p.images.length} image{p.images.length !== 1 ? 's' : ''}</span>}
                    {p.specialFeatures?.map((f) => (
                      <span key={f} className="px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No projects match these filters.</div>}
        </div>
      </div>

      {/* Portfolio packs — the curated category PDFs CRM hands to clients.
          Prepared/uploaded by Marketing (not auto-generated); file names only until Phase 2. */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={15} className="text-brand" /> Portfolio packs
            <span className="text-xs font-normal text-gray-400">{packs.length}</span>
          </h3>
          <p className="text-xs text-gray-500">
            Category PDFs available for download in CRM. Type a new category to add one to the list.
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {packs.map((pack) => (
            <div key={pack.id} className="px-4 py-2.5 flex items-center gap-3">
              <span className="w-28 shrink-0 px-2 py-0.5 rounded text-[10px] font-medium text-center truncate bg-brand/10 text-brand">{pack.category}</span>
              <span className="flex-1 min-w-0 text-xs text-gray-700 font-mono truncate">{pack.fileName}</span>
              <span className="w-24 shrink-0 text-right text-xs text-gray-400 whitespace-nowrap">
                {new Date(pack.uploadedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <button
                onClick={() => window.confirm(`Remove "${pack.fileName}" from the CRM download list?`) && removePortfolioPack(pack.id)}
                className="shrink-0 text-gray-300 hover:text-red-500"
                title="Remove pack"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {packs.length === 0 && <div className="p-6 text-center text-sm text-gray-400">No packs uploaded yet.</div>}
        </div>
        <form onSubmit={addPack} className="p-3 border-t border-gray-100 flex items-center gap-2">
          <input
            list="pack-categories"
            value={packForm.category}
            onChange={(e) => setPackForm({ ...packForm, category: e.target.value })}
            placeholder="Category (pick or type new)"
            className="w-44 border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <datalist id="pack-categories">
            {packCategories.map((c) => <option key={c} value={c} />)}
          </datalist>
          <input
            value={packForm.fileName}
            onChange={(e) => setPackForm({ ...packForm, fileName: e.target.value })}
            placeholder="File name, e.g. ALSUWEIDI-Portfolio-Healthcare-2026.pdf"
            className="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            type="submit"
            disabled={!packForm.category.trim() || !packForm.fileName.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-white hover:bg-brand-dark disabled:opacity-40"
          >
            <Plus size={12} /> Add pack
          </button>
        </form>
      </div>

      {/* Asset usage tracking — who sent/downloaded which pack, to whom */}
      {onLogPackUsage && <PackUsageLog packs={packs} usage={packUsage} onLog={onLogPackUsage} />}

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
