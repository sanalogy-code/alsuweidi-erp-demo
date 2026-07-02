import { useState } from 'react'
import { PenTool, HardHat, Banknote, Users as UsersIcon, AlertTriangle } from 'lucide-react'
import Modal from '../crm/Modal'
import StagePipeline from './StagePipeline'

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

export default function ProjectDetailModal({ project, employees = [], canViewSensitive = false, onClose, onViewEmployee }) {
  const [tab, setTab] = useState('overview')

  if (!project) return null

  const dpm = employees.find((e) => e.id === project.dpmId)
  const cpm = employees.find((e) => e.id === project.cpmId)
  const sup = project.supervision
  const behind = sup && sup.approvedPct > 0 && sup.actualPct < sup.approvedPct

  const TABS = [
    { key: 'overview', label: 'Overview' },
    ...(project.design ? [{ key: 'design', label: 'Design' }] : []),
    ...(project.supervision ? [{ key: 'supervision', label: 'Supervision' }] : []),
    ...(canViewSensitive ? [{ key: 'financials', label: 'Financials' }] : []),
    { key: 'team', label: 'Team' },
  ]

  const tabIcon = { design: PenTool, supervision: HardHat, financials: Banknote, team: UsersIcon }

  return (
    <Modal title={`${project.projectNo} — ${project.name}`} onClose={onClose} wide>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="text-xs text-gray-500">{project.employer} • {project.type} • {project.location}</div>
        <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${STATUS_CHIP[project.generalStatus]}`}>{project.generalStatus}</span>
      </div>

      <div className="mb-5 bg-gray-50 rounded-lg p-3">
        <StagePipeline stagesInvolved={project.stagesInvolved} currentStage={project.currentStage} />
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
          </div>
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
              <span>Progress — approved plan vs actual</span>
              {behind && (
                <span className="text-red-600 font-medium flex items-center gap-1"><AlertTriangle size={11} /> {sup.approvedPct - sup.actualPct} pts behind plan</span>
              )}
            </div>
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
    </Modal>
  )
}
