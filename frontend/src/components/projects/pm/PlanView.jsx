import { useState } from 'react'
import { Plus, Diamond, Lock } from 'lucide-react'
import PmTasksView, { TaskCard, TaskCardTree } from './PmTasksView'
import { PM_METHODS, TASK_STATUSES, taskIsLate, taskBlocked, phaseProgress, daysUntil } from '../../../data/pmData'
import { parseLocalDate, todayLocal } from '../../../utils/date'

// "Plan & tasks" — the working plan for a phase (Batch 11, Sana's feedback).
// Methodology is a per-project choice: WATERFALL renders the plan as a
// Gantt-style timeline (tasks + milestones, late in red) above the task board;
// SPRINTS renders iterations with a board and a backlog.

const fmtShort = (iso) => {
  const d = parseLocalDate(iso)
  return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''
}

function Gantt({ tasks, milestones }) {
  // Parents first, each followed by its (dated) subtasks, indented.
  const ordered = tasks.filter((t) => t.parentId == null)
    .flatMap((t) => [t, ...tasks.filter((s) => s.parentId === t.id)])
  const dated = ordered.filter((t) => t.startDate && t.due)
  const points = [
    ...dated.flatMap((t) => [t.startDate, t.due]),
    ...milestones.flatMap((m) => [m.baseline, m.forecast, m.actual]).filter(Boolean),
  ].map((d) => parseLocalDate(d).getTime())
  if (!points.length) return <div className="text-xs text-gray-400 py-4 text-center">Give tasks start and due dates to see the timeline.</div>
  const today = todayLocal().getTime()
  const min = Math.min(...points, today), max = Math.max(...points, today)
  const span = Math.max(1, max - min)
  const pos = (iso) => ((parseLocalDate(iso).getTime() - min) / span) * 100
  const todayPos = ((today - min) / span) * 100

  return (
    <div className="relative">
      {/* today line */}
      <div className="absolute top-0 bottom-0 w-px bg-brand/60 z-10" style={{ left: `calc(${todayPos}% )` }} title="Today" />
      <div className="space-y-1.5">
        {dated.map((t) => {
          const late = taskIsLate(t)
          const done = t.status === 'done'
          const blocked = taskBlocked(t, tasks) && !done
          const left = pos(t.startDate)
          const width = Math.max(1.5, pos(t.due) - left)
          return (
            <div key={t.id} className="flex items-center gap-2">
              <div className={`w-52 shrink-0 text-xs truncate flex items-center gap-1 ${t.parentId ? 'pl-4 text-gray-500' : 'text-gray-600'}`} title={t.title}>
                {t.parentId != null && <span className="text-gray-300">↳</span>}
                {blocked && <Lock size={9} className="text-amber-500 shrink-0" />}
                {t.title}
              </div>
              <div className="flex-1 relative h-5 bg-gray-50 rounded">
                <div className={`absolute top-1 bottom-1 rounded ${done ? 'bg-green-400' : late ? 'bg-red-400' : blocked ? 'bg-amber-300' : 'bg-blue-400'}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${t.startDate} → ${t.due}${t.assignee ? ` · ${t.assignee}` : ''}`}>
                  {!done && t.pctComplete > 0 && (
                    <div className="h-full bg-black/20 rounded-l" style={{ width: `${t.pctComplete}%` }} />
                  )}
                </div>
              </div>
              <div className={`w-24 shrink-0 text-[10px] text-right ${late ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                {late ? `${-daysUntil(t.due)}d late` : `${fmtShort(t.startDate)} – ${fmtShort(t.due)}`}
              </div>
              <div className="w-28 shrink-0 text-[10px] text-gray-400 truncate">{t.assignee}</div>
            </div>
          )
        })}
        {milestones.filter((m) => m.baseline || m.forecast).map((m) => {
          const iso = m.actual || m.forecast || m.baseline
          const slipped = !m.actual && m.forecast && m.baseline && m.forecast > m.baseline
          return (
            <div key={`ms-${m.id}`} className="flex items-center gap-2">
              <div className="w-52 shrink-0 text-xs font-medium text-gray-700 truncate flex items-center gap-1">
                <Diamond size={10} className={m.actual ? 'text-green-500' : slipped ? 'text-red-500' : 'text-gray-500'} /> {m.label}
              </div>
              <div className="flex-1 relative h-5">
                <div className={`absolute top-0.5 w-3 h-3 rotate-45 ${m.actual ? 'bg-green-500' : slipped ? 'bg-red-500' : 'bg-gray-500'}`}
                  style={{ left: `calc(${pos(iso)}% - 6px)` }} title={`${m.label}: ${iso}`} />
              </div>
              <div className={`w-24 shrink-0 text-[10px] text-right ${slipped ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>{fmtShort(iso)}</div>
              <div className="w-28 shrink-0" />
            </div>
          )
        })}
      </div>
      <div className="flex gap-4 text-[10px] text-gray-400 mt-2">
        <span className="flex items-center gap-1"><span className="w-3 h-2 bg-blue-400 rounded-sm inline-block" /> On track</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 bg-red-400 rounded-sm inline-block" /> Late</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 bg-amber-300 rounded-sm inline-block" /> Blocked (dependency)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 bg-green-400 rounded-sm inline-block" /> Done</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rotate-45 bg-gray-500 inline-block" /> Milestone</span>
        <span className="flex items-center gap-1"><span className="w-px h-3 bg-brand inline-block" /> Today</span>
      </div>
    </div>
  )
}

// Milestone editor (Batch 16): add milestones and mark them achieved from the
// plan, instead of seed-only data.
function MilestoneEditor({ phase, onUpdatePhase }) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ label: '', baseline: '', forecast: '' })
  const add = () => {
    if (!form.label.trim() || !form.baseline) return
    onUpdatePhase({ ...phase, milestones: [...phase.milestones, { id: Math.max(0, ...phase.milestones.map((m) => m.id)) + 1, label: form.label.trim(), baseline: form.baseline, forecast: form.forecast || form.baseline, actual: null }] })
    setForm({ label: '', baseline: '', forecast: '' }); setShowAdd(false)
  }
  const patch = (id, changes) => onUpdatePhase({ ...phase, milestones: phase.milestones.map((m) => m.id === id ? { ...m, ...changes } : m) })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Diamond size={11} /> Milestones</div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={12} /> Milestone</button>
      </div>
      {showAdd && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Milestone name *" className="flex-1 min-w-[180px] border rounded-md px-2 py-1.5" />
          <label className="text-gray-500">Baseline <input type="date" value={form.baseline} onChange={(e) => setForm({ ...form, baseline: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
          <label className="text-gray-500">Forecast <input type="date" value={form.forecast} onChange={(e) => setForm({ ...form, forecast: e.target.value })} className="border rounded-md px-2 py-1 ml-1" /></label>
          <button onClick={add} className="px-2.5 py-1.5 rounded-md bg-brand text-white">Add</button>
        </div>
      )}
      <div className="space-y-1">
        {phase.milestones.map((m) => {
          const slipped = !m.actual && m.forecast && m.baseline && m.forecast > m.baseline
          return (
            <div key={m.id} className="flex flex-wrap items-center gap-2 text-xs">
              <Diamond size={9} className={m.actual ? 'text-green-500' : slipped ? 'text-red-500' : 'text-gray-400'} />
              <span className="flex-1 min-w-0 text-gray-700 truncate">{m.label}</span>
              <span className="text-gray-400">baseline {m.baseline}</span>
              {!m.actual ? (
                <>
                  <label className="text-gray-500">forecast <input type="date" value={m.forecast || ''} onChange={(e) => patch(m.id, { forecast: e.target.value || null })} className={`border rounded-md px-1.5 py-0.5 ml-1 ${slipped ? 'border-red-300 text-red-600' : ''}`} /></label>
                  <button onClick={() => patch(m.id, { actual: new Date().toISOString().slice(0, 10) })} className="px-2 py-0.5 rounded-md border border-green-300 text-green-700 hover:bg-green-50">Achieved today</button>
                </>
              ) : (
                <span className="text-green-700">achieved {m.actual} <button onClick={() => patch(m.id, { actual: null })} className="text-gray-400 hover:underline ml-1">undo</button></span>
              )}
            </div>
          )
        })}
        {phase.milestones.length === 0 && !showAdd && <div className="text-xs text-gray-300">No milestones yet.</div>}
      </div>
    </div>
  )
}

function SprintBoard({ pm, phase, onUpdatePhase, onUpdatePm, currentUserName, onLogHours }) {
  const active = pm.sprints.find((s) => s.status === 'active') || pm.sprints[pm.sprints.length - 1]
  const [sprintId, setSprintId] = useState(active?.id ?? null)
  const [showAddSprint, setShowAddSprint] = useState(false)
  const [sprintForm, setSprintForm] = useState({ name: '', startDate: '', endDate: '', goal: '' })
  const [taskTitle, setTaskTitle] = useState('')
  const sprint = pm.sprints.find((s) => s.id === sprintId)

  const patchTask = (id, changes) => onUpdatePhase({ ...phase, tasks: phase.tasks.map((t) => t.id === id ? { ...t, ...changes } : t) })
  const addSubtask = (parent, title) => onUpdatePhase({
    ...phase,
    tasks: [...phase.tasks, {
      id: Math.max(0, ...phase.tasks.map((t) => t.id)) + 1,
      parentId: parent.id, title, assignee: parent.assignee, createdBy: currentUserName || null,
      startDate: new Date().toISOString().slice(0, 10), due: parent.due || null,
      effortHours: 0, pctComplete: 0, sprintId: parent.sprintId ?? null,
      priority: parent.priority, status: 'open', checklist: [], comments: [],
    }],
  })
  // Subtasks nest under their parent card; only top-level tasks fill the columns.
  const inSprint = phase.tasks.filter((t) => t.sprintId === sprintId && t.parentId == null)
  const backlog = phase.tasks.filter((t) => !t.sprintId && t.parentId == null && t.status !== 'done')

  const addSprint = () => {
    if (!sprintForm.name.trim()) return
    onUpdatePm({ ...pm, sprints: [...pm.sprints, { id: Math.max(0, ...pm.sprints.map((s) => s.id)) + 1, ...sprintForm, status: 'planned' }] })
    setSprintForm({ name: '', startDate: '', endDate: '', goal: '' }); setShowAddSprint(false)
  }
  const addTask = () => {
    if (!taskTitle.trim()) return
    onUpdatePhase({ ...phase, tasks: [...phase.tasks, { id: Math.max(0, ...phase.tasks.map((t) => t.id)) + 1, title: taskTitle.trim(), assignee: phase.team[0]?.name || '', createdBy: currentUserName || null, startDate: null, due: sprint?.endDate || null, effortHours: 0, pctComplete: 0, sprintId, priority: 'normal', status: 'open', checklist: [], comments: [] }] })
    setTaskTitle('')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {pm.sprints.map((s) => (
          <button key={s.id} onClick={() => setSprintId(s.id)}
            className={`px-2.5 py-1 rounded-md text-xs border transition ${sprintId === s.id ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
            {s.name}
            {s.status === 'active' && <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded-full bg-green-100 text-green-700">active</span>}
          </button>
        ))}
        <button onClick={() => setShowAddSprint((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Plus size={12} /> Sprint</button>
      </div>

      {showAddSprint && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-wrap gap-2 text-xs">
          <input value={sprintForm.name} onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })} placeholder="Sprint name" className="border rounded-md px-2 py-1.5 w-48" />
          <input type="date" value={sprintForm.startDate} onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })} className="border rounded-md px-2 py-1.5" />
          <input type="date" value={sprintForm.endDate} onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })} className="border rounded-md px-2 py-1.5" />
          <input value={sprintForm.goal} onChange={(e) => setSprintForm({ ...sprintForm, goal: e.target.value })} placeholder="Goal" className="flex-1 min-w-[160px] border rounded-md px-2 py-1.5" />
          <button onClick={addSprint} className="px-2.5 py-1.5 rounded-md bg-brand text-white">Add</button>
        </div>
      )}

      {sprint && (
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-sm font-medium text-gray-800">{sprint.name}</span>
            <span className="text-gray-400">{sprint.startDate} → {sprint.endDate}</span>
            {sprint.status === 'active' && sprint.endDate && <span className="text-amber-600 font-medium">{daysUntil(sprint.endDate)}d left</span>}
            {sprint.status === 'active' && (
              <button onClick={() => onUpdatePm({ ...pm, sprints: pm.sprints.map((s) => s.id === sprint.id ? { ...s, status: 'done' } : s) })} className="text-brand hover:underline">Close sprint</button>
            )}
            {sprint.status === 'planned' && (
              <button onClick={() => onUpdatePm({ ...pm, sprints: pm.sprints.map((s) => s.id === sprint.id ? { ...s, status: 'active' } : (s.status === 'active' ? { ...s, status: 'done' } : s)) })} className="text-brand hover:underline">Start sprint</button>
            )}
          </div>
          {sprint.goal && <p className="text-xs text-gray-500 mt-1">Goal: {sprint.goal}</p>}
        </div>
      )}

      <div className="flex gap-2">
        <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder={`Add a task to ${sprint?.name || 'this sprint'}…`} className="flex-1 border rounded-md px-2.5 py-1.5 text-xs bg-white" />
        <button onClick={addTask} className="px-3 py-1.5 text-xs rounded-md bg-brand text-white">Add</button>
      </div>

      {TASK_STATUSES.map((g) => {
        const items = inSprint.filter((t) => t.status === g.key)
        return (
          <div key={g.key} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${g.chip}`}>{g.label}</span>
              <span className="text-xs text-gray-400">{items.length}</span>
            </div>
            {items.length === 0 ? <div className="text-xs text-gray-300 pl-1">—</div>
              : items.map((t) => <TaskCardTree key={t.id} t={t} phase={phase} patchTask={patchTask} currentUserName={currentUserName} onAddSubtask={addSubtask} onLogHours={onLogHours} />)}
          </div>
        )
      })}

      <div className="space-y-2 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Backlog</span>
          <span className="text-xs text-gray-400">{backlog.length} — not in a sprint yet</span>
        </div>
        {backlog.map((t) => (
          <div key={t.id} className="flex items-center gap-2">
            <div className="flex-1 min-w-0"><TaskCard t={t} allTasks={phase.tasks} patch={(c) => patchTask(t.id, c)} currentUserName={currentUserName} onAddSubtask={addSubtask} onLogHours={onLogHours} /></div>
            <button onClick={() => patchTask(t.id, { sprintId })} className="shrink-0 text-[11px] text-brand hover:underline whitespace-nowrap">→ {sprint?.name?.split(' — ')[0] || 'sprint'}</button>
          </div>
        ))}
        {backlog.length === 0 && <div className="text-xs text-gray-300 pl-1">Empty.</div>}
      </div>
    </div>
  )
}

export default function PlanView({ pm, phase, onUpdatePhase, onUpdatePm, currentUserName, onLogHours }) {
  const progress = phaseProgress(phase)
  const late = phase.tasks.filter(taskIsLate).length

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Method:</span>
          {PM_METHODS.map((m) => (
            <button key={m.key} onClick={() => onUpdatePm({ ...pm, method: m.key })} title={m.hint}
              className={`px-2.5 py-1 rounded-md border transition ${pm.method === m.key ? 'border-brand text-brand bg-brand/5 font-semibold' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
              {m.label}
            </button>
          ))}
        </div>
        {progress != null && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{phase.label} progress</span>
            <span className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden"><span className="block h-full bg-brand rounded-full" style={{ width: `${progress}%` }} /></span>
            <span className="font-semibold text-gray-700">{progress}%</span>
          </div>
        )}
        {late > 0 && <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">{late} late task{late === 1 ? '' : 's'}</span>}
      </div>

      {pm.method === 'waterfall' ? (
        <>
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline — tasks & milestones</h3>
              <Gantt tasks={phase.tasks} milestones={phase.milestones} />
            </div>
            <div className="border-t border-gray-100 pt-3">
              <MilestoneEditor phase={phase} onUpdatePhase={onUpdatePhase} />
            </div>
          </div>
          <PmTasksView phase={phase} onUpdate={onUpdatePhase} currentUserName={currentUserName} onLogHours={onLogHours} />
        </>
      ) : (
        <>
          <SprintBoard pm={pm} phase={phase} onUpdatePhase={onUpdatePhase} onUpdatePm={onUpdatePm} currentUserName={currentUserName} onLogHours={onLogHours} />
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <MilestoneEditor phase={phase} onUpdatePhase={onUpdatePhase} />
          </div>
        </>
      )}
    </div>
  )
}
