import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, GitCommitHorizontal, FileCode2, Boxes, CalendarDays, Server,
  Rocket, Database, ShieldCheck, Mail, HardDrive, Globe, Zap, ListChecks,
  Lightbulb, CircleDot, CheckCircle2, ArrowRight, Building2, Users, FolderKanban,
  Monitor, Megaphone,
} from 'lucide-react'

// The "behind the curtain" dashboard — deliberately NOT the ERP's design
// language. Dark, animated, presentation-grade: what got built, how fast,
// what's next. Reachable from the login page; shows nothing sensitive.
//
// All numbers come from __DEV_STATS__, injected at build time by
// vite.config.js (git history + fs walk + BACKLOG.md parse) so they can
// never drift from reality.

const STATS = typeof __DEV_STATS__ !== 'undefined' ? __DEV_STATS__ : {
  commits: 0, loc: 0, files: 0, components: 0, backlog: [],
  firstCommitDate: '', buildDate: '', buildMessage: '',
}

// ---------------------------------------------------------------------------
// Hand-written narrative (history doesn't drift — safe to hardcode)
// ---------------------------------------------------------------------------

const TIMELINE = [
  {
    date: '1 Jul, 07:41', title: 'First commit',
    body: 'FastAPI + Supabase + Railway. The "proper" stack.',
  },
  {
    date: '1 Jul, ~midnight', title: 'The pivot', highlight: true,
    body: 'Backend scrapped after repeated deploy failures. Decision: build the UI first, get sign-off on working screens, then invest in infrastructure. The dead end is included in every number on this page.',
  },
  {
    date: '2 Jul', title: 'First demo',
    body: 'CRM (pipeline, companies, contacts, reports), base HR, and the Projects portfolio — shipped for first management review.',
  },
  {
    date: '3 Jul, day', title: 'Batches 1 & 2',
    body: 'Seven HR features from management requirements (self-service joiner wizard, referral gifts, offboarding, PRO queue, typed documents, staff planning) + project create/edit/advance + a whole IT & Assets module.',
  },
  {
    date: '3 Jul, night', title: 'Batches 3 & 4',
    body: 'Marketing module with a cross-module task inbox and a hard project-completion gate. Then Timesheets: weekly project-coded grid, approval queue, payroll hold flag.',
  },
  {
    date: '3 Jul, late', title: 'Batch 5',
    body: 'Confidentiality became a PM decision that gates stage advance. Queues got scannable columns. Timesheet approval moved to line managers. Work weeks went per-employee (Mon–Fri / Sun–Thu Jordan / 6-day site).',
  },
  {
    date: 'Next', title: 'Batch 6 → Phase 2', future: true,
    body: 'Marketing rework from Sana\'s review (richer project records, real photo workflow, content calendar 2.0), then the real backend: Postgres + API + enforced RBAC on an on-prem VM (Q4 2026).',
  },
]

const MODULES = [
  { icon: Building2, name: 'CRM', blurb: 'Pipeline kanban, companies, contacts, tasks, interaction log, filtered exports, date-ranged reports' },
  { icon: Users, name: 'HR', blurb: 'Full suite: directory + org chart, leave, letters (EN/AR), payroll & WPS, timesheets, onboarding, offboarding, PRO queue' },
  { icon: FolderKanban, name: 'Projects', blurb: '9-stage delivery pipeline, design & supervision sub-records, gated financials, marketing sign-off gate' },
  { icon: Monitor, name: 'IT & Assets', blurb: 'Request queue (approve→procure→fulfil), tagged asset registry, license renewal radar' },
  { icon: Megaphone, name: 'Marketing', blurb: 'Auto-fed inbox, content calendar, portfolio readiness, CV search, completion gate' },
]

const PHASE2 = [
  { icon: Database, label: 'Postgres + API', sub: 'on-prem VM, Docker' },
  { icon: ShieldCheck, label: 'RBAC enforced server-side', sub: 'today\'s UI gating is the spec' },
  { icon: Zap, label: 'Auth: invite links', sub: 'email → set password → mandatory onboarding' },
  { icon: HardDrive, label: 'Real document & photo storage', sub: 'uploads are file-name-only today' },
  { icon: Mail, label: 'Email & notifications', sub: 'reminders, approvals, welcome emails' },
  { icon: Server, label: 'Audit log + encrypted backups', sub: 'production data never seen by AI' },
]

// ---------------------------------------------------------------------------
// Hooks: count-up numbers + reveal-on-scroll
// ---------------------------------------------------------------------------

function useCountUp(target, duration = 1600) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return
      started.current = true
      const t0 = performance.now()
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / duration)
        setValue(Math.round(target * (1 - Math.pow(1 - p, 3)))) // ease-out cubic
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration])
  return [ref, value]
}

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShown(true), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(24px)',
        transition: `opacity 700ms ${delay}ms cubic-bezier(.2,.7,.2,1), transform 700ms ${delay}ms cubic-bezier(.2,.7,.2,1)`,
      }}
    >
      {children}
    </div>
  )
}

function BigStat({ target, suffix = '', label, sub }) {
  const [ref, value] = useCountUp(target)
  return (
    <div ref={ref} className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-5 hover:border-white/25 hover:bg-white/[0.06] transition-colors">
      <div className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent tabular-nums">
        {value.toLocaleString()}{suffix}
      </div>
      <div className="mt-1.5 text-sm font-semibold text-white/80">{label}</div>
      {sub && <div className="text-xs text-white/40 mt-0.5">{sub}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------

const fmtDay = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

export default function DevDashboard() {
  // Calendar days touched, inclusive (1 Jul → 3 Jul = 3), ignoring time of day
  const dateOnly = (iso) => { const d = new Date(iso); return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
  const elapsedDays = STATS.firstCommitDate && STATS.buildDate
    ? Math.max(1, Math.round((dateOnly(STATS.buildDate) - dateOnly(STATS.firstCommitDate)) / 86400000) + 1)
    : 3

  const backlog = STATS.backlog || []
  const shippedTotal = backlog.reduce((s, x) => s + x.done, 0)
  const openTotal = backlog.reduce((s, x) => s + x.open, 0)
  const findSection = (frag) => backlog.find((s) => s.title.toLowerCase().includes(frag))
  const nextBatch = findSection('next batch')
  const decisions = findSection('decision')
  const future = findSection('future')
  const phase2Section = findSection('phase 2')
  const codeQuality = findSection('code quality')

  const PULSE = [
    { label: 'Ready to build', section: nextBatch, color: 'from-red-500 to-orange-400' },
    { label: 'Awaiting a decision', section: decisions, color: 'from-amber-500 to-yellow-400' },
    { label: 'Future / TBD scope', section: future, color: 'from-sky-500 to-cyan-400' },
    { label: 'Phase 2 (needs backend)', section: phase2Section, color: 'from-violet-500 to-fuchsia-400' },
    { label: 'Code quality', section: codeQuality, color: 'from-emerald-500 to-teal-400' },
  ].filter((p) => p.section)
  const pulseMax = Math.max(1, ...PULSE.map((p) => p.section.open + p.section.done))

  const ideas = [...(future?.items || []).filter((i) => !i.done), ...(phase2Section?.items || []).filter((i) => !i.done)]

  return (
    <div className="min-h-screen bg-[#05060c] text-white overflow-x-hidden relative">
      {/* animated backdrop */}
      <style>{`
        @keyframes devblob { 0%,100% { transform: translate(0,0) scale(1) } 33% { transform: translate(60px,-40px) scale(1.15) } 66% { transform: translate(-40px,30px) scale(.9) } }
        @keyframes devgrid { from { background-position: 0 0 } to { background-position: 0 56px } }
        @keyframes devdash { to { stroke-dashoffset: -20 } }
      `}</style>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 opacity-[0.35]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 75%)',
          animation: 'devgrid 4s linear infinite',
        }} />
        <div className="absolute -top-32 -left-24 w-[34rem] h-[34rem] rounded-full blur-3xl opacity-25" style={{ background: 'radial-gradient(circle, #c81516, transparent 65%)', animation: 'devblob 18s ease-in-out infinite' }} />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #6d28d9, transparent 65%)', animation: 'devblob 22s ease-in-out infinite reverse' }} />
        <div className="absolute bottom-0 left-1/3 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-15" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent 65%)', animation: 'devblob 26s ease-in-out infinite' }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 pb-24">
        {/* top bar */}
        <div className="flex items-center justify-between py-5">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={15} /> Back to login
          </Link>
          <div className="text-xs text-white/35 font-mono">build: {STATS.buildMessage?.slice(0, 48) || 'local'}</div>
        </div>

        {/* hero */}
        <div className="pt-14 pb-16 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 mb-7">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Developer Dashboard — behind the curtain
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.04]">
              Five modules.
              <br />
              <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 bg-clip-text text-transparent">{elapsedDays} days.</span>
              <br />
              Zero servers.
            </h1>
          </Reveal>
          <Reveal delay={260}>
            <p className="mt-6 text-white/50 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              A full ERP UI proof-of-concept — CRM, HR, Projects, IT &amp; Assets, Marketing — built by
              one person pair-programming with AI, iterating on real management feedback instead of
              writing spec documents. Every number below is pulled live from git and the backlog at build time.
            </p>
          </Reveal>
        </div>

        {/* stat grid */}
        <Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <BigStat target={STATS.commits} label="Commits" sub={`since ${fmtDay(STATS.firstCommitDate)}`} />
            <BigStat target={STATS.loc} label="Lines of app code" sub={`${STATS.files} source files`} />
            <BigStat target={STATS.components} label="React components" sub="incl. pages" />
            <BigStat target={5} label="Modules live" sub="CRM · HR · Projects · IT · Marketing" />
            <BigStat target={shippedTotal} label="Backlog items shipped" sub={`${openTotal} still open — on purpose`} />
            <BigStat target={0} suffix=" AED" label="Monthly infra cost" sub="Cloudflare Pages free tier" />
          </div>
        </Reveal>

        {/* modules */}
        <section className="mt-24">
          <Reveal>
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-white/40 mb-6 flex items-center gap-2"><Boxes size={14} /> What's live</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODULES.map((m, i) => (
              <Reveal key={m.name} delay={i * 70}>
                <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 h-full hover:border-red-500/40 hover:bg-red-500/[0.04] transition-colors">
                  <m.icon size={20} className="text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-white/90">{m.name}</div>
                  <div className="text-xs text-white/45 mt-1.5 leading-relaxed">{m.blurb}</div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={5 * 70}>
              <div className="rounded-2xl border border-dashed border-white/15 p-5 h-full flex flex-col justify-center items-center text-center">
                <Rocket size={20} className="text-white/30 mb-2" />
                <div className="text-sm text-white/40">Cross-module wiring: won deal → project → marketing tasks → completion gate. New hire → headshot + welcome email.</div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* timeline */}
        <section className="mt-24">
          <Reveal>
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-white/40 mb-8 flex items-center gap-2"><CalendarDays size={14} /> The story so far</h2>
          </Reveal>
          <div className="relative pl-8">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-red-500/70 via-white/15 to-violet-500/50" />
            {TIMELINE.map((t, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="relative pb-9 last:pb-0">
                  <span className={`absolute -left-8 top-1 h-[15px] w-[15px] rounded-full border-2 ${t.future ? 'border-violet-400 bg-violet-400/20' : t.highlight ? 'border-red-500 bg-red-500' : 'border-white/40 bg-[#05060c]'}`} />
                  <div className="text-[11px] font-mono text-white/35 mb-0.5">{t.date}</div>
                  <div className={`font-bold ${t.highlight ? 'text-red-400' : t.future ? 'text-violet-300' : 'text-white/90'}`}>{t.title}</div>
                  <div className="text-sm text-white/50 mt-1 max-w-xl leading-relaxed">{t.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* architecture */}
        <section className="mt-24">
          <Reveal>
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-white/40 mb-6 flex items-center gap-2"><Server size={14} /> Architecture — now → next</h2>
          </Reveal>
          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
            <Reveal>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={16} className="text-emerald-400" />
                  <span className="font-bold">Phase 1 — live today</span>
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 rounded-full px-2 py-0.5">shipping</span>
                </div>
                <ul className="space-y-2.5 text-sm text-white/60">
                  <li className="flex gap-2"><CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" /> React SPA — no API, no database, seed data in code</li>
                  <li className="flex gap-2"><CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" /> Role-gated UI on a password-less login — doubles as the written RBAC spec for Phase 2</li>
                  <li className="flex gap-2"><CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" /> Normalized entities with FK-style links (deal → project → tasks) — schema design already converged</li>
                  <li className="flex gap-2"><CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" /> GitHub → Cloudflare Pages, auto-deploy on every push</li>
                </ul>
              </div>
            </Reveal>
            <div className="hidden lg:flex items-center">
              <svg width="52" height="24" className="text-white/30">
                <line x1="0" y1="12" x2="40" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="6 5" style={{ animation: 'devdash 1s linear infinite' }} />
                <path d="M40 5 L51 12 L40 19 Z" fill="currentColor" />
              </svg>
            </div>
            <Reveal delay={140}>
              <div className="rounded-2xl border border-violet-400/25 bg-violet-500/[0.05] p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Database size={16} className="text-violet-300" />
                  <span className="font-bold">Phase 2 — Q4 2026</span>
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-violet-300 bg-violet-400/10 border border-violet-400/25 rounded-full px-2 py-0.5">planned</span>
                </div>
                <ul className="space-y-2.5 text-sm text-white/60">
                  {PHASE2.map((p) => (
                    <li key={p.label} className="flex gap-2">
                      <p.icon size={15} className="text-violet-300 shrink-0 mt-0.5" />
                      <span><span className="text-white/80">{p.label}</span> <span className="text-white/35">— {p.sub}</span></span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* backlog pulse */}
        {PULSE.length > 0 && (
          <section className="mt-24">
            <Reveal>
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-white/40 mb-2 flex items-center gap-2"><ListChecks size={14} /> Backlog pulse</h2>
              <p className="text-xs text-white/35 mb-6">Parsed from BACKLOG.md at build time — {shippedTotal} shipped, {openTotal} open.</p>
            </Reveal>
            <div className="space-y-4">
              {PULSE.map((p, i) => {
                const total = p.section.open + p.section.done
                return (
                  <Reveal key={p.label} delay={i * 60}>
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-white/75">{p.label}</span>
                        <span className="text-white/40 tabular-nums">{p.section.done > 0 && <span className="text-emerald-400">{p.section.done} done · </span>}{p.section.open} open</span>
                      </div>
                      <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden flex">
                        {p.section.done > 0 && (
                          <div className="h-full bg-emerald-500/70" style={{ width: `${(p.section.done / pulseMax) * 100}%` }} />
                        )}
                        <div className={`h-full bg-gradient-to-r ${p.color}`} style={{ width: `${(p.section.open / pulseMax) * 100}%` }} />
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </div>
            {nextBatch && nextBatch.items.some((i) => !i.done) && (
              <Reveal delay={200}>
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2"><CircleDot size={14} className="text-red-400" /> On deck — ready to build</div>
                  <div className="flex flex-wrap gap-2">
                    {nextBatch.items.filter((i) => !i.done).map((i) => (
                      <span key={i.title} className="text-xs text-white/60 border border-white/10 bg-white/[0.04] rounded-full px-3 py-1.5 hover:border-red-400/40 hover:text-white/90 transition-colors">{i.title}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </section>
        )}

        {/* ideas / horizon */}
        {ideas.length > 0 && (
          <section className="mt-24">
            <Reveal>
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-white/40 mb-6 flex items-center gap-2"><Lightbulb size={14} /> The horizon</h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {ideas.map((i, idx) => (
                <Reveal key={i.title} delay={idx * 40}>
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/60 hover:border-violet-400/35 hover:text-white/85 transition-colors">
                    <ArrowRight size={13} className="text-violet-300 shrink-0" />
                    {i.title}
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* footer */}
        <Reveal>
          <div className="mt-24 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35">
            <div className="flex items-center gap-2">
              <GitCommitHorizontal size={13} />
              <span className="font-mono">{STATS.commits} commits · built {fmtDay(STATS.buildDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCode2 size={13} />
              Built by Sana, pair-programming with Claude · numbers regenerate on every deploy
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
