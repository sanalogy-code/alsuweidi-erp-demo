# CRM Feature Landscape — Research & Gap Analysis

*Research date: 2026-07-06. Purpose: survey the full breadth of CRM / sales / customer-relationship functionality found in market platforms (global suites, plus AEC/engineering-specific CRM and UAE/GCC context), then map it against what the ALSUWEIDI ERP CRM module already ships, so we can see what's missing and what's worth building next.*

---

## 1. How the market organizes CRM functionality

Modern CRM suites (Salesforce, HubSpot, Zoho, Pipedrive, MS Dynamics) cluster their capabilities into roughly six layers:

1. **Data foundation** — companies/accounts, contacts, the "360" record, activity/interaction history, relationships.
2. **Demand & lead** — web forms & lead capture, lead scoring, campaigns, marketing automation, segmentation.
3. **Sell** — pipeline/opportunity management, quotes/CPQ, proposals, contracts, e-signature, forecasting, territory/quota.
4. **Serve** — customer service/ticketing, case management, client portals, SLAs.
5. **Intelligence** — dashboards, reports, win-loss analytics, AI (predictive scoring, email drafting, forecasting, conversation intelligence).
6. **Platform** — email/calendar sync, document management, integrations, mobile, workflow/approvals, notifications.

Our module today is a competent **SME sales CRM in the "Data foundation" and lower half of "Sell"** — companies, contacts, a Kanban pipeline, tasks, interaction logging, and CSV/Excel reporting. It is unusually well-tailored to an **engineering consultancy's relationship model** (multi-tag companies that are Client *and* Supplier, subconsultant project history, a two-tier contact taxonomy). The big white space is everything above lead capture (**demand generation**), everything past a deal card (**quotes → proposals → contracts → e-signature**), the entire **Serve** layer, and **AI / advanced analytics**. Most critically for an AEC firm, there is **no bid/tender/pursuit management** — the single most important CRM workflow for a consultancy that wins work through RFPs and prequalification.

---

## 2. Full market feature checklist vs. what we already have

Legend: ✅ shipped · 🟡 partial / mock · ❌ missing

### Data foundation — accounts, contacts, the 360 record
| Feature | Status | Notes |
|---|---|---|
| Company / account records | ✅ | `INITIAL_COMPANIES`; industry, location, size band, website, status, services |
| Multi-relationship account tagging | ✅ | `COMPANY_TAGS` multi-select (Client + Supplier + Government at once) — better modeled than most generic CRMs |
| Contact records / directory | ✅ | `INITIAL_CONTACTS`; searchable, `ContactDetailModal` with inline edit |
| Two-tier contact taxonomy | ✅ | `relationship` × `subType`, seniority, employmentType — richer than a flat "contact type" |
| Company ↔ contact linkage | ✅ | `companyId` FK; contacts roll up to company drill-down |
| Account 360 view | 🟡 | Company detail has Contacts / Deals / Activity / Project History tabs, but **no unified timeline merging emails, meetings, deals, docs**; activity is manually logged only |
| Interaction / activity history | 🟡 | `INITIAL_INTERACTIONS` (Call/Email/Meeting/Note), manually logged. **No auto-capture** |
| "Keep in Mind" notes / relationship intel | ✅ | Free-text notes on companies and contacts — a nice tacit-knowledge feature |
| Duplicate detection / merge | ❌ | No dedupe, no merge, no data-quality tooling |
| Data enrichment (firmographics, auto-fill) | ❌ | No enrichment from external providers |
| Org hierarchy on the account (parent/child, buying group) | ❌ | Flat companies; no parent-company or account-hierarchy modeling |
| Relationship mapping / influence map | ❌ | No visual of who-knows-whom or decision-unit mapping |
| Custom fields / custom objects | ❌ | Fixed schema; no admin-defined fields |

### Demand & lead generation
| Feature | Status | Notes |
|---|---|---|
| Lead object (distinct from contact) | ❌ | Prospects are modeled as contacts/companies with a tag; no separate lead lifecycle (new → qualified → converted) |
| Web-to-lead / web forms | ❌ | No form builder, no website capture, no inbound routing |
| Lead scoring (rules-based) | ❌ | No scoring model at all |
| Lead scoring (predictive / AI) | ❌ | — |
| Lead assignment / round-robin routing | ❌ | Tasks are manually tied to contacts |
| Marketing campaigns | 🟡 | Lives in the **Marketing module** (content calendar, LinkedIn/website feeds) but **not linked to CRM leads/deals**; no campaign→lead attribution |
| Email marketing / sequences / cadences | ❌ | No bulk email, drip sequences, or nurture flows |
| Segmentation / lists | 🟡 | Contact export has filters (relationship/subtype/seniority) but no saved dynamic segments |
| Landing pages / event registration | ❌ | — |

### Sell — pipeline, quotes, proposals, forecasting
| Feature | Status | Notes |
|---|---|---|
| Opportunity / deal records | ✅ | `INITIAL_DEALS`; value, stage, probability, close date, company + contact FK |
| Visual pipeline (Kanban) | ✅ | `PipelineView` — drag-and-drop stage change, per-card dropdown, date-range filter |
| Configurable stages / multiple pipelines | 🟡 | Single hard-coded `STAGES` array; no per-team pipelines, no admin-editable stages |
| Weighted / expected value | ✅ | Probability × value; weighted expected shown on Overview and pipeline summary |
| **Bid / tender / pursuit management** | ❌ | **No RFP/RFQ tracking, submission deadlines, tender documents, go/no-go, bid checklist** — the biggest AEC gap (see §3) |
| **Go / no-go decision workflow** | ❌ | No structured pursuit-qualification scoring or approval to bid |
| **Quotes / line items / CPQ** | ❌ | Deal has a single `value` number; no quote builder, line items, rate cards, or configure-price-quote |
| **Proposals** | 🟡 | Proposal *builder was deleted* (Batch 6); portfolio PDF packs remain. No proposal authoring, templating, or tracking |
| **Contracts / CLM** | 🟡 | Contract data lives on the **Projects** record (`contractType`, `contractSigned`, `loaObtained`) — **post-award**, not a CRM contract-lifecycle (redlines, renewals, obligations) |
| **E-signature** | ❌ | Zoho Sign is mocked in HR certificates; not wired to CRM proposals/contracts |
| Deal → Project handoff | ✅ | Won deals relate to Projects via `companyId`; NewProjectModal exists. Decent closed-won continuity |
| Products / price book / rate card | ❌ | No catalog of services/rates |
| Sales forecasting (period roll-up, commit/best-case) | 🟡 | Reports aggregate deals by month/quarter, but **no forecast categories, no commit vs best-case, no snapshot/trend over time** |
| Territory management | ❌ | No territories, geographies, or account assignment rules |
| Quota / target vs actual | ❌ | No quotas, no attainment tracking, no BD targets |
| Competitor tracking on deals | ❌ | No competitor field, no win/loss-vs-competitor analysis |
| Win / loss reason capture & analysis | 🟡 | Deals have Won/Lost stages and a live win-rate, but **no structured loss reasons, no win/loss review** |

### Serve — service, cases, portals
| Feature | Status | Notes |
|---|---|---|
| Customer service / ticketing | ❌ | No case object, no support queue |
| Case management / SLAs | ❌ | — |
| Client portal | ❌ | No external-facing client login (proposals, docs, status) |
| Knowledge base / FAQ | ❌ | — |
| Complaint / snag handling for clients | ❌ | HR has an internal complaints tool; nothing client-facing |

### Intelligence — analytics & AI
| Feature | Status | Notes |
|---|---|---|
| Dashboards / stat cards | 🟡 | Overview: companies, open pipeline, weighted value, follow-up count, tasks overdue, top clients, pipeline-by-stage bar |
| Reports + export | ✅ | Reports view: monthly breakdown + all-deals list, date-range filter, one-click Excel/CSV |
| Pipeline / conversion analytics | 🟡 | Win rate is live; **no funnel conversion rates, stage velocity, average deal age, sales-cycle length** |
| Win-loss & pursuit analytics | ❌ | No historical win-rate-by-client / by-sector / by-service to feed go/no-go |
| Custom report builder | ❌ | Reports are fixed layouts |
| AI — predictive lead/deal scoring | ❌ | — |
| AI — email / proposal drafting | ❌ | — |
| AI — forecasting / deal-health signals | ❌ | — |
| AI — account/client summaries ("what's the status") | ❌ | (Deltek's "Smart Summaries" / "Ask Dela" is the AEC benchmark here) |
| AI — conversation intelligence (call transcribe/analyze) | ❌ | — |

### Platform — sync, docs, workflow, mobile
| Feature | Status | Notes |
|---|---|---|
| Email integration / send from CRM | ❌ | No email capability anywhere (structural — frontend-only; called out in SPEC §5) |
| Email & calendar sync (Gmail/Outlook) | ❌ | No two-way sync, no auto-logging of sent mail |
| Automatic activity capture | ❌ | All interactions manual |
| Tasks / reminders / follow-ups | ✅ | `TasksView` grouped Overdue / This Week / Later / Done; overdue badge |
| **Notifications / approvals inbox** | ❌ | Same gap as the rest of the ERP — nothing notifies anyone (SPEC §5) |
| Workflow automation (triggers, rules) | ❌ | No if-this-then-that automation |
| Document management | 🟡 | Portfolio PDF packs downloadable; **name-only storage, downloads are stubs** (SPEC §5). No per-deal document vault |
| Global search | ❌ | No cross-entity search (SPEC §5) |
| Mobile app | ❌ | Responsive web only |
| Integrations / API / marketplace | ❌ | No backend, no API, no third-party connectors |
| Role-based access to CRM data | 🟡 | App-wide RBAC is client-side/prototype (SPEC §5); no field-level or record-level sharing rules |

---

## 3. AEC / engineering-consultancy-specific features (critical for this client)

This is where a generic CRM under-serves ALSUWEIDI and where purpose-built A&E platforms — **Deltek Vantagepoint**, **Unanet CRM (Cosential)**, **Operate**, **ProjectMark**, **Monograph** — differentiate. For an engineering consultancy, "sales" *is* **pursuit and bid management**, and the account relationship is a decades-long, repeat, often public-sector one.

| Feature | Status | Notes |
|---|---|---|
| **Pursuit / opportunity tracking (BD pipeline)** | 🟡 | Deals exist, but they're generic; A&E CRMs model a *pursuit* with tender-specific fields |
| **Tender / RFP / RFQ register** | ❌ | No inbound-tender log, issuing authority, submission deadline, bid-bond, clarification-Q tracking |
| **Go / no-go qualification** | ❌ | The signature A&E workflow: score a pursuit (fit, capacity, client relationship, competition, margin) and decide to bid. Absent |
| **Prequalification / PQQ management** | ❌ | No register of PQQ submissions, expiry of prequalified status per client/authority, required-doc checklists (trade licence, ISO certs, insurance, past-project references) |
| **Bid document / submission checklist** | ❌ | No compliance checklist per tender (forms, certificates, addenda, technical + commercial envelopes) |
| **Teaming / subconsultant management on a pursuit** | 🟡 | Companies can be tagged `Subconsultant` with `projectHistory`, but **not attached to a live pursuit** as a bid team with scope splits |
| **Client-agency relationship (repeat public-sector)** | ✅ | `Government` tag, `Government/Regulator` relationship + subtypes, "Keep in Mind" intel (e.g. ADNOC portal-renewal note) — genuinely strong |
| **Win/loss history feeding go/no-go** | ❌ | No "our win rate with DEWA on utilities" analytics to inform bid decisions |
| **Project references / experience library for proposals** | 🟡 | Projects + portfolio packs exist (Marketing), but not a searchable, tagged past-project reference library bound to proposal assembly |
| **Registration / vendor-portal tracking** | 🟡 | Captured only as a free-text "Keep in Mind" note (ADNOC portal) — not a structured, expiry-tracked registration record |
| **Fee proposal / man-hour estimate** | ❌ | No effort-based fee build-up (grades × hours × rate), the standard consultancy quote |
| **Contract value vs fee split (design/supervision)** | 🟡 | Modeled richly on the **Projects** side post-award; not in the CRM deal |

**Bottom line for AEC:** the module handles *who we know* very well and *what we're chasing* adequately, but it does not handle *how consultancies actually win work* — the tender-to-bid-to-award pursuit lifecycle with go/no-go, prequalification, and teaming.

---

## 4. UAE / GCC-specific context

| Feature | Status | Notes |
|---|---|---|
| AED currency + formatting | ✅ | `formatCurrency` / `formatCurrencyShort` in AED (M/K) |
| Government tender-portal integration | ❌ | UAE public work flows through portals — Abu Dhabi Government Procurement Gate (**ADGPG**), Dubai's **eSupply**, federal tendering, ADNOC/Etihad/DEWA supplier portals. No integration or even structured registration tracking |
| Prequalification for gov/semi-gov clients | ❌ | UAE public and semi-gov clients require standing prequalification (trade licence, ISO, insurance, references) — untracked (see §3) |
| VAT (5%) on quotes/proposals | ❌ | No quote engine, so no VAT handling; would matter once CPQ/proposals exist |
| Arabic / bilingual UI + RTL | ❌ | English-only; GCC buyers frequently expect Arabic/bilingual and RTL (HR certificates are bilingual — pattern exists to extend) |
| WhatsApp as a channel | ❌ | WhatsApp is the dominant business channel in the GCC (a "Keep in Mind" note even says a contact "prefers WhatsApp"); no WhatsApp logging/messaging |
| Data residency / PDPL awareness | ❌ | Not applicable yet (no backend); relevant at Phase 2 |
| Repeat public-sector client model | ✅ | Government tagging + agency relationship types fit the UAE market well |

---

## 5. Prioritized gaps — what's most worth building next

**Tier 1 — high value, expected of a CRM, and specifically what an engineering consultancy needs:**
1. **Bid / tender / pursuit management + go/no-go** — the defining AEC CRM workflow and the single biggest gap. A tender register (authority, deadline, bid-bond, status) + a go/no-go scoring step + submission checklist would make this read as a *consultancy* CRM, not a generic one.
2. **Prequalification (PQQ) tracking** — a register of prequalified status per client/authority with document checklists and expiry dates, reusing the document-expiry pattern already proven in HR (visa/passport renewals). High UAE relevance.
3. **Quotes / fee proposals + proposal assembly** — line-item or man-hour fee build-up feeding a proposal that pulls project references from the existing portfolio. Restores the deleted proposal builder in a more structured form; VAT-aware.
4. **Notifications / approvals** — same plumbing gap as the rest of the ERP; makes tasks, go/no-go approvals, and follow-ups actually notify people (Phase 2).

**Tier 2 — strong additions:**
5. **Account 360 unified timeline + auto activity capture** (once email/calendar exists) — merge deals, interactions, docs, and tasks into one chronological view.
6. **Win/loss & pursuit analytics** — win rate by client / sector / service to feed go/no-go decisions; funnel conversion, stage velocity, sales-cycle length.
7. **Structured client-registration & vendor-portal tracking** — promote the free-text "Keep in Mind" portal notes into first-class, expiry-tracked registration records (ADGPG, eSupply, ADNOC portal, etc.).
8. **Lead lifecycle + web-to-lead capture** — a proper lead object and website enquiry capture with routing (lighter priority for a relationship-led consultancy than for a volume B2B seller).

**Tier 3 — nice to have / scale-dependent:**
9. **E-signature** on proposals/contracts (extend the mocked Zoho Sign flow).
10. **Client portal** (proposal/status visibility for major clients).
11. **AI layer** — client smart-summaries, deal-health/forecast signals, email/proposal drafting (Deltek's "Ask Dela" is the AEC benchmark).
12. **Bilingual / Arabic + RTL** and **WhatsApp channel** logging for GCC fit.
13. **Configurable pipelines/stages, custom fields, global search, mobile.**

---

## 6. Quick take

The CRM module is a solid **relationship-and-pipeline core** that is genuinely well-shaped for an engineering consultancy in a couple of ways generic CRMs get wrong — multi-tag accounts (Client *and* Supplier), a two-tier contact taxonomy, subconsultant project history, and tacit "Keep in Mind" relationship intel. What it lacks is the **pursuit half of a consultancy's sales process**:

- **Bid / tender / pursuit management with go/no-go and prequalification** — the workflow by which an AEC firm actually wins work, and the thing that would most make this read as a *purpose-built* consultancy CRM rather than a generic SME sales tool, and
- **The quote → proposal → contract → e-signature chain**, which today stops at a single deal-value number (and whose proposal builder was removed in Batch 6).

Everything else (lead capture, marketing automation, service/ticketing, AI, unified timeline, analytics depth) is the standard CRM breadth that generic suites offer and that can layer on incrementally — most of it gated behind the same Phase 2 backend/email/notification plumbing already called out across the ERP.

---

## Sources
- [Salesforce vs HubSpot vs NetSuite CRM: 2026 Comparison — BrokenRubik](https://www.brokenrubik.com/blog/crm-comparison-guide)
- [HubSpot vs Salesforce vs Zoho vs Pipedrive vs Dynamics — RemoteReps](https://remotereps.com/services/sales-outsourcing/comparison-on-the-top-5-crm-platforms)
- [Best Sales CRM Software 2026 — Pipeline CRM](https://pipelinecrm.com/blog/best-sales-crm-software/)
- [AI Features Every CRM Should Have in 2026 — GigaCatalyst](https://gigacatalyst.com/blog/crm-ai-features-2026)
- [AI Lead Scoring: How It Works — monday.com](https://monday.com/blog/crm-and-sales/ai-lead-scoring/)
- [Best AI CRM Tools for Sales Teams in 2026 — ZoomInfo](https://pipeline.zoominfo.com/sales/ai-crm-tools-sales)
- [CRM Email & Calendar Sync — Nutshell](https://www.nutshell.com/crm/email-calendar-sync)
- [Best CRM for automatic email and meeting capture — Affinity](https://www.affinity.co/blog/best-crm-automatic-email-meeting-capture)
- [The best CRM ticketing system for 2026 — monday.com](https://monday.com/blog/crm-and-sales/crm-ticketing-system/)
- [9 Top CRMs with client portals — Assembly](https://assembly.com/blog/crm-with-client-portal)
- [Best sales forecasting tools 2026 — Outreach](https://www.outreach.ai/resources/blog/sales-forecasting-tools)
- [Sales territory management: Planning tips for 2026 — Highspot](https://www.highspot.com/blog/sales-territory-management/)
- [Lead Capture Forms — Pipedrive](https://www.pipedrive.com/en/products/sales/lead-capture)
- [Deltek Vantagepoint: ERP for A&E and Consulting](https://www.deltek.com/products/erp/vantagepoint/)
- [CRM for Architecture Firms — Deltek](https://www.deltek.com/en/architecture-and-engineering/architecture-software/crm)
- [Deltek Vantagepoint vs Unanet CRM by Cosential — G2](https://www.g2.com/compare/deltek-vantagepoint-vs-unanet-crm-by-cosential)
- [7 Reasons AEC Firms Choose Deltek Vantagepoint CRM — Stambaugh Ness](https://www.stambaughness.com/blog/7-reasons-aec-firms-choose-deltek-vantagepoint-crm-growth/)
- [Bid & Tender Management Software for AEC — Operate](https://operate.io/bid-management-software-aec/)
- [Comprehensive Construction Bid Checklist — ProjectMark](https://www.projectmark.com/blog/construction-bid-checklist)
- [Best Proposal Management Tools for Construction Firms — ProjectMark](https://www.projectmark.com/blog/best-proposal-management-tools-for-construction-firms)
- [Proposal Automation for A&E Firms — Monograph](https://monograph.com/blog/proposal-automation-ae-firms)
- [Best CRM Software in UAE, Dubai & GCC — CorporateStack](https://corporatestack.com/top-crm-software-in-uae/)
- [Government tendering and awarding — The Official Platform of the UAE Government](https://u.ae/en/information-and-services/business/public-private-people-partnership/ppp/government-tendering-and-awarding)
- [Abu Dhabi Government Procurement Gate (ADGPG)](https://www.adgpg.gov.ae/)
- [WhatsApp CRM UAE — Arabic AI, AED Billing — go4whatsup](https://www.go4whatsup.com/uae/)
