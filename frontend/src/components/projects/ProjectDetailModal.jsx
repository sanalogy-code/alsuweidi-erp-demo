import { useState } from 'react'
import { PenTool, HardHat, Banknote, Users as UsersIcon, AlertTriangle, FolderOpen, Pencil, ChevronLeft, ChevronRight, Eye, EyeOff, Lightbulb, Image, Sparkles } from 'lucide-react'
import Modal from '../crm/Modal'
import NotesList from '../crm/NotesList'
import StagePipeline from './StagePipeline'
import EditProjectModal from './EditProjectModal'
import DocumentChecklist from '../DocumentChecklist'
import { PROJECT_DOCUMENT_TYPES, yearStartedOf, yearCompletedOf } from '../../data/projectsData'
import { INVOICES } from '../../data/financeData'

const fmtAed = (n) => (n || n === 0 ? `${n.toLocaleString()} AED` : '—')
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-AE') : '—')

const STATUS_CHIP = {
  'In Progress': 'bg-blue-100 text-blue-700',
  'On Hold': 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-green-100 text-green-700',
  'Not Started': 'bg-gray-100 text-gray-600',
  'N/A': 'bg-gray-100 text-gray-500',
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-800">{children ?? '—'}</div>
    </div>
  )
}

export default function ProjectDetailModal({ project, employees = [], canViewSensitive = false, onClose, onViewEmployee, onUpdateProject, onAddMarketingTask, onOpenWorkspace, invoices = INVOICES }) {
  const [tab, setTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const [editingProgress, setEditingProgress] = useState(false)
  const [progressForm, setProgressForm] = useState({ approvedPct: '', actualPct: '' })
  const [decidingConfidentiality, setDecidingConfidentiality] = useState(false)

  if (!project) return null

  const canEdit = !!onUpdateProject
  const dpm = employees.find((e) => e.id === project.dpmId)
  const cpm = employees.find((e) => e.id === project.cpmId)
  const sup = project.supervision
  const behind = sup && sup.approvedPct > 0 && sup.actualPct < sup.approvedPct

  // Stage moves are constrained to the stages this project's scope covers
  const stageIdx = project.stagesInvolved.indexOf(project.currentStage)
  const advanceStage = (base, delta) => {
    const idx = base.stagesInvolved.indexOf(base.currentStage)
    const next = base.stagesInvolved[idx + delta]
    if (!next) return
    onUpdateProject({ ...base, currentStage: next })
    // Reaching the final stage puts completion in sight — queue the professional
    // photography task for Marketing now (it blocks completion later).
    if (delta > 0 && idx + delta === base.stagesInvolved.length - 1 && !base.photosApproved) {
      onAddMarketingTask?.({
        type: 'project_photos', relatedKind: 'project', relatedId: base.id,
        relatedName: `${base.projectNo} — ${base.name}`,
        notes: `Reached ${next} — arrange professional photography before completion.`,
      })
    }
  }
  const moveStage = (delta) => {
    // Confidentiality is the PM's call at project start — a project created
    // before the field existed cannot advance until it's decided.
    if (delta > 0 && project.confidential === undefined) {
      setDecidingConfidentiality(true)
      return
    }
    advanceStage(project, delta)
  }
  const decideConfidentiality = (isConfidential) => {
    setDecidingConfidentiality(false)
    // One update: record the decision and perform the advance that triggered it
    advanceStage({ ...project, confidential: isConfidential }, 1)
  }

  const saveProgress = () => {
    const clamp = (v) => Math.min(100, Math.max(0, Number(v) || 0))
    onUpdateProject({ ...project, supervision: { ...sup, approvedPct: clamp(progressForm.approvedPct), actualPct: clamp(progressForm.actualPct) } })
    setEditingProgress(false)
  }

  const TABS = [
    { key: 'overview', label: 'Overview' },
    ...(project.design ? [{ key: 'design', label: 'Design' }] : []),
    ...(project.supervision ? [{ key: 'supervision', label: 'Supervision' }] : []),
    ...(canViewSensitive ? [{ key: 'financials', label: 'Financials' }] : []),
    { key: 'team', label: 'Team' },
    { key: 'documents', label: 'Documents' },
    { key: 'lessons', label: `Lessons (${(project.lessons || []).length})` },
  ]

  const tabIcon = { design: PenTool, supervision: HardHat, financials: Banknote, team: UsersIcon, documents: FolderOpen, lessons: Lightbulb }

  return (
    <Modal title={`${project.projectNo} — ${project.name}`} onClose={onClose} wide>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="text-xs text-gray-500">{project.employer} • {project.type} • {project.location}</div>
        <div className="flex items-center gap-2 shrink-0">
          {onOpenWorkspace && (
            <button
              onClick={() => onOpenWorkspace(project)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-white bg-brand hover:bg-brand-dark transition"
            >
              <FolderOpen size={11} /> Project workspace
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-brand border border-brand/30 hover:bg-brand/5 transition"
            >
              <Pencil size={11} /> Edit
            </button>
          )}
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CHIP[project.generalStatus]}`}>{project.generalStatus}</span>
        </div>
      </div>

      <div className="mb-5 bg-gray-50 rounded-lg p-3">
        <StagePipeline stagesInvolved={project.stagesInvolved} currentStage={project.currentStage} />
        {canEdit && decidingConfidentiality && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="text-xs text-amber-800 mb-2">
              <span className="font-semibold">Confidentiality not decided.</span> The PM must decide whether
              Marketing can showcase this project before it advances — this controls the portfolio and proposals.
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => decideConfidentiality(false)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Eye size={12} /> Public — showcase allowed, advance
              </button>
              <button
                onClick={() => decideConfidentiality(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-red-200 text-red-700 hover:bg-red-50"
              >
                <EyeOff size={12} /> Confidential — hide, advance
              </button>
            </div>
          </div>
        )}
        {canEdit && !decidingConfidentiality && (
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={() => moveStage(-1)}
              disabled={stageIdx <= 0}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30"
            >
              <ChevronLeft size={13} /> {project.stagesInvolved[stageIdx - 1] || 'Back'}
            </button>
            <span className="text-[10px] text-gray-400">Move the project through its pipeline</span>
            <button
              onClick={() => moveStage(1)}
              disabled={stageIdx >= project.stagesInvolved.length - 1}
              className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-dark disabled:opacity-30"
            >
              {project.stagesInvolved[stageIdx + 1] || 'Done'} <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 flex gap-2 border-b border-gray-200">
        {TABS.map((t) => {
          const Icon = tabIcon[t.key]
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition ${tab === t.key ? 'text-brand border-brand' : 'text-gray-500 border-transparent'}`}
            >
              {Icon && <Icon size={14} className="inline mr-1" />}
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'overview' && (
        <div className="space-y-5">
          {project.description && <p className="text-sm text-gray-700">{project.description}</p>}

          {/* Marketing sign-off — description + professional photos gate completion */}
          <div className={`rounded-lg p-3 border ${project.marketingDescription && project.photosApproved ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs uppercase tracking-wide font-semibold text-gray-500">Marketing sign-off</span>
              <div className="flex items-center gap-3 text-xs">
                <span className={project.marketingDescription ? 'text-green-700 font-medium' : 'text-amber-700'}>
                  {project.marketingDescription ? '✓ Description' : '○ Description pending'}
                </span>
                <span className={project.photosApproved ? 'text-green-700 font-medium' : 'text-amber-700'}>
                  {project.photosApproved ? '✓ Photos approved' : '○ Photos pending'}
                </span>
              </div>
            </div>
            {project.marketingDescription ? (
              <p className="text-xs text-gray-600">{project.marketingDescription}</p>
            ) : (
              <p className="text-xs text-gray-500">Marketing writes the portfolio description and approves professional photography — the project cannot be marked Completed without both.</p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Main Function">{project.mainFunction}</Field>
            <Field label="Contract Type">{project.contractType}</Field>
            <Field label="Fund">{project.fund}</Field>
            <Field label="Sector">{project.sector}</Field>
            <Field label="Plot">{project.plot}</Field>
            <Field label="Built-up Area">{project.builtupArea ? `${project.builtupArea.toLocaleString()} sqm` : '—'}</Field>
            <Field label="Contract">
              <span className={project.contractSigned ? 'text-green-700' : 'text-red-600'}>{project.contractSigned ? 'Signed' : 'Not Signed'}</span>
            </Field>
            <Field label="LOA">
              <span className={project.loaObtained ? 'text-green-700' : 'text-red-600'}>{project.loaObtained ? 'Obtained' : 'Not Obtained'}</span>
            </Field>
            <Field label="Contractor">{project.contractorName}</Field>
            <Field label="Year Started">{yearStartedOf(project)}</Field>
            <Field label="Year Completed">{yearCompletedOf(project) || (yearStartedOf(project) ? 'ongoing' : null)}</Field>
            <Field label="Confidentiality">
              {project.confidential === undefined ? (
                <span className="text-amber-600">Not decided — blocks stage advance</span>
              ) : project.confidential ? (
                <span className="text-red-600 flex items-center gap-1"><EyeOff size={12} /> Confidential</span>
              ) : (
                <span className="text-gray-700 flex items-center gap-1"><Eye size={12} /> Public</span>
              )}
            </Field>
          </div>

          {/* Portfolio material — images (file names until Phase 2 storage) and special features */}
          {(project.images?.length > 0 || project.specialFeatures?.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              {project.images?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2 flex items-center gap-1"><Image size={12} /> Images ({project.images.length})</div>
                  <div className="space-y-1">
                    {project.images.map((img) => (
                      <div key={img} className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-1 font-mono truncate">{img}</div>
                    ))}
                  </div>
                </div>
              )}
              {project.specialFeatures?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2 flex items-center gap-1"><Sparkles size={12} /> Special Features</div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.specialFeatures.map((f) => (
                      <span key={f} className="px-2 py-1 rounded bg-purple-50 border border-purple-200 text-purple-800 text-xs">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'design' && project.design && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Scope Status">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CHIP[project.design.status]}`}>{project.design.status}</span>
            </Field>
            <Field label="Output Format">{project.design.outputFormat}</Field>
            <Field label="Years">{project.design.startYear || '—'} → {project.design.completionYear || 'ongoing'}</Field>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">Scope of Work ({project.design.sow.length} disciplines)</div>
            <div className="flex flex-wrap gap-1.5">
              {project.design.sow.map((d) => (
                <span key={d} className="px-2 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs">{d}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'supervision' && sup && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Coverage">{sup.coverage}</Field>
            <Field label="Status">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CHIP[sup.status]}`}>{sup.status}</span>
            </Field>
            <Field label="Years">{sup.startYear || '—'} → {sup.completionYear || 'ongoing'}</Field>
            <Field label="Contractual Completion">{fmtDate(sup.contractualCompletion)}</Field>
            <Field label="Estimated Completion">
              <span className={sup.estimatedCompletion > sup.contractualCompletion ? 'text-red-600' : undefined}>{fmtDate(sup.estimatedCompletion)}</span>
            </Field>
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>
                Progress — approved plan vs actual
                {canEdit && !editingProgress && (
                  <button
                    onClick={() => { setProgressForm({ approvedPct: sup.approvedPct, actualPct: sup.actualPct }); setEditingProgress(true) }}
                    className="ml-2 text-brand font-medium hover:underline"
                  >
                    Update
                  </button>
                )}
              </span>
              {behind && (
                <span className="text-red-600 font-medium flex items-center gap-1"><AlertTriangle size={11} /> {sup.approvedPct - sup.actualPct} pts behind plan</span>
              )}
            </div>
            {editingProgress && (
              <div className="mb-3 bg-blue-50 border border-blue-200 rounded-md p-3 flex items-end gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Approved %</label>
                  <input type="number" min="0" max="100" value={progressForm.approvedPct}
                    onChange={(e) => setProgressForm({ ...progressForm, approvedPct: e.target.value })}
                    className="w-24 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Actual %</label>
                  <input type="number" min="0" max="100" value={progressForm.actualPct}
                    onChange={(e) => setProgressForm({ ...progressForm, actualPct: e.target.value })}
                    className="w-24 border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
                <button onClick={saveProgress} className="px-3 py-1.5 bg-brand text-white rounded-md text-xs font-medium hover:bg-brand-dark">Save</button>
                <button onClick={() => setEditingProgress(false)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-200">Cancel</button>
              </div>
            )}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-0.5"><span className="text-gray-600">Approved</span><span className="font-medium">{sup.approvedPct}%</span></div>
                <div className="h-2 bg-gray-100 rounded-full"><div className="h-2 bg-gray-400 rounded-full" style={{ width: `${sup.approvedPct}%` }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-0.5"><span className="text-gray-600">Actual</span><span className="font-medium">{sup.actualPct}%</span></div>
                <div className="h-2 bg-gray-100 rounded-full"><div className={`h-2 rounded-full ${behind ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${sup.actualPct}%` }} /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'financials' && canViewSensitive && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contract Value (fees)">{fmtAed(project.contractValue)}</Field>
            <Field label="Construction Cost">{fmtAed(project.constructionCost)}</Field>
          </div>
          {/* Billing progress next to delivery progress (BACKLOG.md good-to-have) */}
          {(() => {
            const invoiced = invoices.filter((i) => i.projectId === project.id && i.status !== 'draft').reduce((s, i) => s + i.amount, 0)
            const pct = project.contractValue ? Math.round((invoiced / project.contractValue) * 100) : null
            return (
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
                <div className="text-xs uppercase tracking-wide font-semibold text-gray-500">Billing progress</div>
                <div className="flex justify-between"><span className="text-gray-600">Fees invoiced (net):</span><span className="font-medium">{fmtAed(invoiced)}{pct != null && <span className="text-gray-400 font-normal"> — {pct}% of fee</span>}</span></div>
                {pct != null && (
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className={`h-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-brand'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                )}
                <div className="text-[11px] text-gray-400">From issued (non-draft) invoices in Financials.</div>
              </div>
            )
          })()}
          {project.design && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <div className="text-xs uppercase tracking-wide font-semibold text-gray-500">Design Fees</div>
              <div className="flex justify-between"><span className="text-gray-600">Financial status:</span>
                <span className={`font-medium text-right ${project.design.financialStatus.startsWith('Open - Dispute') ? 'text-red-600' : 'text-gray-800'}`}>{project.design.financialStatus}</span>
              </div>
              <div className="flex justify-between"><span className="text-gray-600">Payment status:</span><span className="font-medium">{project.design.payStatus}</span></div>
            </div>
          )}
          {sup && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <div className="text-xs uppercase tracking-wide font-semibold text-gray-500">Supervision Fees</div>
              <div className="flex justify-between"><span className="text-gray-600">Payment status:</span>
                <span className={`font-medium ${sup.payStatus === 'Unsettled' ? 'text-red-600' : 'text-gray-800'}`}>{sup.payStatus}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'documents' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Typed project documents — the LOA is required on every project. Files are name-only until Phase 2 storage.
          </p>
          <DocumentChecklist
            docTypes={PROJECT_DOCUMENT_TYPES}
            documents={project.documents || []}
            onChange={(docs) => onUpdateProject?.({ ...project, documents: docs })}
            readOnly={!onUpdateProject}
          />
        </div>
      )}

      {tab === 'lessons' && (
        <NotesList
          title="Lessons Learned"
          notes={project.lessons || []}
          onAdd={canEdit ? (note) => onUpdateProject({ ...project, lessons: [...(project.lessons || []), note] }) : undefined}
          emptyText="No lessons recorded for this project yet."
          placeholder="What would we do differently next time?"
        />
      )}

      {tab === 'team' && (
        <div className="space-y-3">
          {[{ role: 'Design Project Manager (DPM)', emp: dpm }, { role: 'Construction Project Manager (CPM)', emp: cpm }].map(({ role, emp }) => (
            <div key={role} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">{role}</div>
                {emp ? (
                  <button onClick={() => onViewEmployee?.(emp)} className="text-sm font-medium text-brand hover:underline">
                    {emp.name} <span className="text-gray-400 font-normal">— {emp.title}</span>
                  </button>
                ) : (
                  <div className="text-sm text-gray-400">Not assigned</div>
                )}
              </div>
            </div>
          ))}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">Employer / Client</div>
            <div className="text-sm font-medium text-gray-800">
              {project.employer}
              {project.companyId && <span className="ml-2 px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-medium">CRM client</span>}
            </div>
          </div>
        </div>
      )}

      {editing && (
        <EditProjectModal
          project={project}
          employees={employees}
          canViewSensitive={canViewSensitive}
          onClose={() => setEditing(false)}
          onSave={onUpdateProject}
          onAddMarketingTask={onAddMarketingTask}
        />
      )}
    </Modal>
  )
}
