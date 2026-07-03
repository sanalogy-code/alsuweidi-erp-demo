import { useState } from 'react'
import { Inbox, Camera, Mail, PenLine, Check } from 'lucide-react'
import Modal from '../crm/Modal'
import { MARKETING_TASK_TYPES } from '../../data/marketingData'
import { daysAgo } from '../../utils/date'

const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

const welcomeEmailDraft = (name) => `Subject: Welcome to ALSUWEIDI, ${name.split(' ')[0]}!

Dear ${name},

A very warm welcome to ALSUWEIDI Engineering Consultants! We're delighted to have you join the team.

Over your first two weeks you'll meet your colleagues, get your systems set up, and work through your onboarding checklist in the ERP. Your manager will walk you through your role and project assignments.

A few quick pointers:
• Your onboarding checklist is on the HR page — policies, working hours, and safety induction.
• Hardware and software requests go through IT & Assets on the home page.
• HR is your first point of contact for anything unclear.

We're glad you're here — welcome aboard!

Warm regards,
The ALSUWEIDI Team`

// One queue of everything waiting on Marketing, oldest first — auto-fed by other
// modules (new projects, projects nearing completion, new joiners). Assigned to
// all of Marketing; whoever picks it up completes it inline.
export default function MarketingInbox({ tasks, projects = [], onCompleteTask, onUpdateProject }) {
  const [descTask, setDescTask] = useState(null)
  const [descText, setDescText] = useState('')
  const [emailTask, setEmailTask] = useState(null)
  const [emailText, setEmailText] = useState('')

  const open = tasks.filter((t) => t.status === 'pending').sort((a, b) => a.createdDate.localeCompare(b.createdDate))
  const done = tasks.filter((t) => t.status === 'done')
    .sort((a, b) => (b.completedDate || '').localeCompare(a.completedDate || '')).slice(0, 5)

  const projectFor = (task) => projects.find((p) => p.id === task.relatedId)

  const openDescEditor = (task) => {
    setDescTask(task)
    setDescText(projectFor(task)?.marketingDescription || '')
  }

  const saveDescription = () => {
    const project = projectFor(descTask)
    if (project && descText.trim()) {
      onUpdateProject({ ...project, marketingDescription: descText.trim() })
      onCompleteTask(descTask.id, 'Description written and saved to the project record.')
    }
    setDescTask(null)
  }

  const approvePhotos = (task) => {
    const project = projectFor(task)
    if (project) {
      onUpdateProject({ ...project, photosApproved: true, photosApprovedDate: new Date().toISOString().slice(0, 10) })
    }
    onCompleteTask(task.id, 'Professional photography approved.')
  }

  const openEmailEditor = (task) => {
    setEmailTask(task)
    setEmailText(welcomeEmailDraft(task.relatedName.split(' — ')[0]))
  }

  const saveEmail = () => {
    onCompleteTask(emailTask.id, 'Email designed — handed to HR to check and send.')
    setEmailTask(null)
  }

  const actionsFor = (task) => {
    if (task.type === 'marketing_description') return (
      <button onClick={() => openDescEditor(task)} className="text-xs font-medium text-brand hover:underline flex items-center gap-1">
        <PenLine size={12} /> Write description
      </button>
    )
    if (task.type === 'project_photos') return (
      <button onClick={() => approvePhotos(task)} className="text-xs font-medium text-green-700 hover:underline flex items-center gap-1">
        <Camera size={12} /> Approve photos
      </button>
    )
    if (task.type === 'welcome_email') return (
      <button onClick={() => openEmailEditor(task)} className="text-xs font-medium text-brand hover:underline flex items-center gap-1">
        <Mail size={12} /> Design email
      </button>
    )
    // employee_headshot
    return (
      <button onClick={() => onCompleteTask(task.id, 'Headshot taken and added to the employee record.')} className="text-xs font-medium text-green-700 hover:underline flex items-center gap-1">
        <Check size={12} /> Mark done
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Inbox size={15} className="text-brand" /> Inbox ({open.length})
          </h2>
          <p className="text-xs text-gray-500">
            Everything waiting on Marketing — project descriptions, photography, headshots, and welcome emails — oldest first.
          </p>
        </div>

        {open.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Inbox zero — nothing waiting on Marketing.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Fixed-width columns (chip / description / age / action) so the eye can run down the queue */}
            {open.map((task) => {
              const meta = MARKETING_TASK_TYPES[task.type]
              return (
                <div key={task.id} className="px-4 py-3 flex items-center gap-3">
                  <span className={`w-36 shrink-0 px-2 py-0.5 rounded text-xs font-medium text-center truncate ${meta.chip}`}>{meta.label}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{task.relatedName}</div>
                    <div className="text-xs text-gray-500 truncate">{task.notes || meta.hint}</div>
                  </div>
                  <div className="w-20 shrink-0 text-right">
                    {task.dueDate && <div className="text-xs text-amber-600 whitespace-nowrap">due {fmt(task.dueDate)}</div>}
                    <div className="text-xs text-gray-400 whitespace-nowrap">{daysAgo(task.createdDate)}</div>
                  </div>
                  <div className="w-36 shrink-0 flex items-center justify-end gap-2">{actionsFor(task)}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {done.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">Recently completed</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {done.map((task) => (
              <div key={task.id} className="px-4 py-2.5 flex items-center justify-between gap-4 text-sm">
                <span className="text-gray-600 truncate">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium mr-2 ${MARKETING_TASK_TYPES[task.type].chip}`}>{MARKETING_TASK_TYPES[task.type].label}</span>
                  {task.relatedName}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap">{task.completedDate ? fmt(task.completedDate) : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {descTask && (
        <Modal title={`Marketing description — ${descTask.relatedName}`} onClose={() => setDescTask(null)}>
          <p className="text-xs text-gray-500 mb-3">
            This is the portfolio-facing description — written for clients, not engineers. The project cannot be marked Completed without it.
          </p>
          {projectFor(descTask)?.description && (
            <div className="bg-gray-50 rounded-md p-3 mb-3 text-xs text-gray-600">
              <span className="font-semibold text-gray-700">PM's technical description: </span>
              {projectFor(descTask).description}
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
            Save to project & complete task
          </button>
        </Modal>
      )}

      {emailTask && (
        <Modal title={`Welcome email — ${emailTask.relatedName}`} onClose={() => setEmailTask(null)}>
          <p className="text-xs text-gray-500 mb-3">
            Design the email below. Completing this hands the draft to HR, who check it for errors and send it — Marketing does not send directly.
          </p>
          <textarea
            rows={14}
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            onClick={saveEmail}
            className="w-full bg-brand text-white py-2 rounded-md text-sm font-medium hover:bg-brand-dark mt-3"
          >
            Finish design — hand to HR for review & sending
          </button>
        </Modal>
      )}
    </div>
  )
}
