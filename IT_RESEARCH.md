# IT & Assets Module — Market Research & Gap Analysis

*Research date: 2026-07-06. Purpose: survey the full breadth of IT Service Management (ITSM) and IT Asset Management (ITAM) functionality found in market platforms (global + UAE-relevant), then map it against what the ALSUWEIDI ERP IT & Assets module already ships, so we can see what's missing and what's worth building next.*

---

## 1. How the market organizes IT functionality

The market splits "IT tooling" into two historically separate disciplines that modern suites (ServiceNow, Freshservice, ManageEngine) now bundle into one platform ([Freshservice features](https://www.freshworks.com/freshservice/features/), [Salesforce ITAM](https://www.salesforce.com/service/it-service-management/it-asset-management/)):

1. **ITSM — IT Service Management.** The *service delivery* side: helpdesk/ticketing, SLAs, the ITIL process set (incident → problem → change → release), a service catalog, a self-service portal, and a knowledge base. This is the "how does IT respond to people" layer.
2. **ITAM — IT Asset Management.** The *inventory & lifecycle* side: hardware assets from procurement to retirement, software licenses & SaaS spend, and the CMDB (configuration management database) that maps devices ↔ users ↔ services ↔ contracts ([ManageEngine ITAM guide](https://www.manageengine.com/products/service-desk/it-asset-management/what-is-itam.html)).
3. **ITOM / Endpoint** — the *operations* layer: discovery, endpoint/device management (UEM/MDM), patching, monitoring, and alerting ([UEM buyer's guide](https://zecurit.com/endpoint-management/top-endpoint-management-tools/)).
4. **Security & Identity** — vulnerability management, endpoint protection, and access lifecycle (Joiner-Mover-Leaver / IAM) that ties directly into HR ([JML guide, miniOrange](https://www.miniorange.com/blog/joiners-movers-and-leavers/)).
5. **Intelligence & AI** — reporting/analytics plus the fast-moving agentic-AI layer (auto-triage, chatbots, ticket deflection) ([Agentic AI in ITSM, itsm.tools](https://itsm.tools/agentic-ai-itsm/)).

**Where our module sits today.** The ALSUWEIDI IT module is a lightweight slice of **ITAM** (a flat asset registry + a software-license list) bolted to a **single-queue request tracker**. It has no ITIL process model, no SLAs, no service catalog, no knowledge base, no CMDB, no discovery/endpoint layer, and no identity/JML automation. It is closest in spirit to **Snipe-IT** (open-source, asset-only) with a basic request form on the side — not to a Freshservice/ServiceNow-class ITSM+ITAM suite. That is the correct scope for a Phase-1 demo; this document maps the white space so the next build priorities are deliberate.

---

## 2. Full market feature checklist vs. what we already have

Legend: ✅ shipped · 🟡 partial / mock · ❌ missing

### A. IT Helpdesk / Ticketing (ITSM core)
| Feature | Status | Notes |
|---|---|---|
| Request/ticket intake | 🟡 | `ItRequestsView` — one form, 4 types (Hardware / Software-license / Repair / Access). No email-to-ticket, no portal channels, no Teams/Slack intake |
| Ticket queue with triage | 🟡 | `queue` mode: pending-first list, approve/reject/fulfil. No priority, no severity, no categories beyond the 4 types |
| **SLA management** | ❌ | No response/resolution targets, no SLA timers, no escalation matrix, no breach flags — market table-stakes ([ManageEngine SLA](https://www.manageengine.com/products/service-desk/help-desk-features.html)) |
| Ticket assignment / ownership | ❌ | Requests aren't assigned to a specific IT agent; whole team sees the queue |
| Priority / impact / urgency | ❌ | No P1–P4, no impact×urgency matrix |
| Approvals workflow | 🟡 | Approve-with-note exists, but single-step; no multi-level or manager approval chain |
| Ticket status lifecycle | ✅ | pending / approved / fulfilled / rejected enum |
| Email notifications on status change | ❌ | Nothing notifies the requester (app-wide gap — no email/notification layer) |
| Omnichannel intake (portal/email/chat) | ❌ | Web form only |

### B. ITIL process management
| Feature | Status | Notes |
|---|---|---|
| **Incident management** | ❌ | No incident entity distinct from a request; no major-incident handling |
| **Problem management** | ❌ | No problem records, no root-cause, no known-error database (KEDB) |
| **Change management** | ❌ | No change requests, no CAB approval, no risk assessment, no change calendar ([ServiceNow/JSM change mgmt](https://www.atlassian.com/software/jira/service-management/comparison/jira-service-management-vs-servicenow)) |
| **Release / deployment mgmt** | ❌ | Not modeled |
| **Service catalog** | ❌ | No catalog of orderable services with per-item forms/approvals — a core Freshservice/ServiceDesk Plus feature |
| **Self-service portal** | 🟡 | "My requests" is a self-service *request* form, but there's no branded portal, no catalog browsing, no ticket-status self-tracking beyond the list |
| **Knowledge base** | ❌ | No KB articles, no how-to repository, no ticket-deflection content ([ServiceDesk Plus KB](https://www.manageengine.com/products/service-desk/help-desk-features.html)) |

### C. Hardware Asset Management (ITAM)
| Feature | Status | Notes |
|---|---|---|
| Asset registry / inventory | ✅ | `IT_ASSETS`, auto-tagged (`IT-0031`…): type, model, serial, purchase date, book value, notes |
| Asset status lifecycle | ✅ | in_use / in_stock / repair / retired |
| Assignment to employee | ✅ | Inline dropdown, `assignedToId` FK → HR `EMPLOYEES`; assign→in_use, unassign→in_stock |
| Procurement → retirement lifecycle | 🟡 | Purchase date + retire status exist, but no procurement/PO stage, no deployment date, no warranty/EOL, no disposal record ([Freshworks lifecycle](https://www.freshworks.com/theworks/insights/best-it-asset-lifecycle-management-software/)) |
| **Warranty & AMC tracking** | ❌ | No warranty-expiry field, no maintenance-contract dates, no renewal radar for hardware |
| **Purchase orders / procurement** | ❌ | No PO entity linking request → purchase → asset creation |
| Asset assignment history / audit trail | ❌ | Only *current* assignee stored; no chain-of-custody log (who held it before) |
| **Asset depreciation** | ❌ | `valueAed` is a static book value — no depreciation schedule, no NBV over time, no method (straight-line etc.) |
| Barcode / QR / asset-tag scanning | ❌ | Tags exist as strings; no scan-to-lookup |
| Consumables / stock (toner, cables) | ❌ | Not modeled |
| Non-IT / facilities assets | ❌ | Furniture, vehicles etc. out of scope (some suites unify these) |

### D. Software & SaaS License Management
| Feature | Status | Notes |
|---|---|---|
| License register with seat counts | ✅ | `SOFTWARE_LICENSES`: seats, seatsUsed, yearly cost, owner; full-seat flag |
| Renewal radar | ✅ | 60-day amber / overdue red, callout card; add-license form (Batch 6) |
| Per-user license assignment | ❌ | Seats are a *count*, not mapped to specific employees — can't answer "who has a Revit seat?" |
| **License compliance / true-up** | ❌ | No entitlement-vs-installed reconciliation, no over-deployment/audit-risk flag ([BetterCloud license mgmt](https://www.bettercloud.com/software-license-management/)) |
| **Software metering / usage** | ❌ | No actual-usage data; can't spot unused seats to reclaim |
| **SaaS spend management** | ❌ | No spend rollup, no shadow-IT discovery, no unused-seat reclamation workflow ([SaaS spend, CloudEagle](https://www.cloudeagle.ai/blogs/saas-spend-management-guide)) |
| Contract / vendor management | 🟡 | `owner` field only; no vendor entity, no contract terms, no renewal owner/notice period |
| Cost analytics (per seat / per dept) | ❌ | Yearly cost stored but not analyzed by cost-centre |

### E. CMDB & Discovery
| Feature | Status | Notes |
|---|---|---|
| **CMDB (config items + relationships)** | ❌ | No CI model, no device↔service↔user↔contract mapping — the backbone of every serious ITSM suite ([Virima CMDB vs ITAM](https://virima.com/blog/cmdb-asset-management-vs-itam-key-differences-explained)) |
| **Automated network discovery** | ❌ | Assets are hand-entered; no agent/agentless scan (Lansweeper's core value) |
| Dependency / impact mapping | ❌ | Can't answer "what breaks if this server goes down" |
| Network / infrastructure inventory | ❌ | No switches, servers, IPs, network topology |

### F. Endpoint / Device Management (ITOM)
| Feature | Status | Notes |
|---|---|---|
| **Unified endpoint / MDM** | ❌ | No device enrollment, no remote config, no mobile management ([UEM 2026](https://zecurit.com/endpoint-management/top-endpoint-management-tools/)) |
| **Patch management** | ❌ | No patch status, no compliance %, no rollout scheduling ([patch mgmt 2026, TechTarget](https://www.techtarget.com/searchenterprisedesktop/tip/12-best-patch-management-software-and-tools)) |
| Remote control / remote support | ❌ | Not modeled |
| Device health / posture (DEX) | ❌ | No endpoint health telemetry |
| Alerting / monitoring / status page | ❌ | No ITOM alert console or service-health monitoring |

### G. Security & Identity (IT↔HR linkage lives here)
| Feature | Status | Notes |
|---|---|---|
| **Access provisioning (Joiner)** | 🟡→❌ | An "Access / accounts" request *type* exists, but nothing provisions accounts or grants "birthright access" on hire ([JML, securends](https://www.securends.com/blog/employee-lifecycle-access-management/)) |
| **Access change (Mover)** | ❌ | No role-change→access-adjustment trigger |
| **Access deprovisioning (Leaver)** | ❌ | HR offboarding has an "access-revocation" checklist item, but it's a manual tick — no auto-revoke, no SaaS-app deprovisioning |
| **Asset return on offboarding** | 🟡 | Offboarding's "IT-assets" checklist item is a *manual* cross-check; it does **not** auto-list the leaver's `assignedToId` assets (see §3) |
| **Vulnerability management** | ❌ | No vuln scanning, no CVE tracking, no risk prioritization ([SentinelOne endpoint vuln](https://www.sentinelone.com/cybersecurity-101/cybersecurity/endpoint-vulnerability-management/)) |
| **Endpoint protection (EPP/EDR) view** | ❌ | No AV/EDR coverage dashboard |
| **Security awareness / phishing training** | ❌ | No training assignment or completion tracking |
| Access reviews / recertification | ❌ | No periodic entitlement review (SOC2/audit evidence) |

### H. Intelligence, AI & Reporting
| Feature | Status | Notes |
|---|---|---|
| Dashboards / stat cards | 🟡 | Active book value + full-seat/renewal callouts only; no proper IT dashboard |
| **Reporting / analytics** | ❌ | No ticket-volume, MTTR, SLA-attainment, asset-age, spend reports; no CSV/Excel export (other modules have `xlsx` export — IT doesn't) |
| **AI auto-triage / categorization** | ❌ | No auto-routing or category prediction ([Freddy AI, Freshservice](https://www.freshworks.com/freshservice/features/)) |
| **Virtual agent / chatbot** | ❌ | No conversational request intake; market benchmark is 40–80% Tier-1 deflection ([eesel AI service desk](https://www.eesel.ai/blog/best-ai-service-desk)) |
| Agentic AI (autonomous fulfilment) | ❌ | No auto password-reset / auto-provision — the 2026 frontier ([Automation Anywhere, agentic ITSM](https://www.automationanywhere.com/company/blog/automation-ai/agentic-ai-itsm)) |

---

## 3. The IT ↔ HR onboarding/offboarding linkage (flagged gap)

SPEC §5 explicitly calls this out: *"IT ↔ HR linkage is manual. Fulfilling a request doesn't auto-create an asset, and offboarding's equipment-return step doesn't auto-list the leaver's assigned assets — both are manual cross-checks today."* This is the single highest-leverage gap because **the data already exists in one place** — `IT_ASSETS.assignedToId` is a live FK into HR `EMPLOYEES`, and HR already runs structured onboarding (`OnboardingChecklist`, `NewJoinerWizard`) and offboarding (`OffboardingTab` with an 8-item leaver checklist that literally includes "IT-assets" and "access-revocation").

The market treats this as the flagship IT↔HR workflow — the **Joiner-Mover-Leaver (JML)** lifecycle ([miniOrange JML](https://www.miniorange.com/blog/joiners-movers-and-leavers/), [Freshservice Employee Journeys](https://www.freshworks.com/freshservice/features/)):

- **Joiner:** when HR creates an employee, IT auto-receives a provisioning ticket — laptop assignment, email/M365 account, birthright app access, license seat allocation. Our seed data even *anticipates* this (asset `IT-0041` note: *"Earmarked for Daniel Okoye (new joiner, starts 15 Jul)"*; request #3 fulfilled by assigning that ThinkPad) — but the linkage is narrated in seed strings, not automated.
- **Mover:** role/department change adjusts access and possibly reassigns equipment. Not modeled at all.
- **Leaver:** HR offboarding should **auto-populate** the leaver's assigned assets (a simple `IT_ASSETS.filter(a => a.assignedToId === leaverId)`) into the return checklist, and fire access-deprovisioning tasks. Today it's a manual tick.

**Why it's the natural next build:** it needs no new external integration — just cross-module state wiring, exactly the pattern already used between Projects→Marketing (auto-queued tasks) and CRM-won-deal→Projects. When state lives in one database (Phase 2), this becomes trivial and would make the IT module read as genuinely integrated rather than a standalone registry.

---

## 4. UAE / regional context (relevant to a Phase-2 build)

The UAE has moved cybersecurity from voluntary guidance to **mandatory resilience** (National Cyber Security Strategy 2025–2031, approved Feb 2025), which raises the bar for what an internal IT system should track ([UAE cybersecurity guide](https://eshielditservices.com/uae-cybersecurity-regulations-guide-2025/), [NESA compliance](https://www.iconnectitbs.com/nesa-compliance-uae/)):

- **NESA / UAE IA Standard v2 (2025)** — 188 controls (60 governance, 128 technical); v2 tightens **cloud security governance, OT security, and supply-chain risk**. An engineering/consulting firm handling government and client project data is squarely in scope for a defensible security baseline, asset inventory, patch discipline, and access reviews — several of which map directly to the ❌ rows above (vuln mgmt, patch mgmt, access recertification).
- **UAE PDPL + data residency** — as of 2026, executive rules push most personal data into **UAE-compliant data centres**; TDRA mandates telecom data residency. Fines reach **AED 5 million** per violation ([ICLG UAE 2025-26](https://iclg.com/practice-areas/data-protection-laws-and-regulations/uae/), [CMS UAE guide](https://cms.law/en/int/expert-guides/cms-expert-guide-to-data-protection-and-cyber-security-laws/uae)). **Direct implication for Phase 2:** when this app gets a real backend, hosting/data-residency must be a deliberate decision — the current Cloudflare Pages + (deleted) Supabase setup would need a UAE-region data store for any real personal/employee data.
- **Asset & access audit trail** — NESA-style compliance expects a hardware inventory, software-license compliance, and evidence of joiner/leaver access control — which reframes several "nice-to-have" ITAM features as *compliance* features for this specific client.

---

## 5. Prioritized gaps — what's most worth building next

**Tier 1 — high value, natural fit, mostly cross-module wiring (low external dependency):**
1. **IT↔HR JML automation** — auto-create IT provisioning task on hire; auto-list assigned assets + fire access-revocation on offboarding. The flagship gap, zero new integrations, uses existing FKs and the established auto-task pattern. *(SPEC §5 explicit.)*
2. **Auto-create asset from fulfilled hardware request** — closes the other half of the SPEC §5 linkage (request → procurement → asset).
3. **SLA + priority on tickets** — response/resolution targets, P1–P4, breach flags, escalation. The most conspicuous missing ITSM primitive; makes the queue read as a real helpdesk.
4. **Per-employee license assignment** — map seats to `EMPLOYEES` so "who has a Revit/P6 seat?" is answerable and offboarding can reclaim seats (ties into JML).

**Tier 2 — strong additions, self-contained:**
5. **Warranty / AMC + hardware renewal radar** — mirror the license renewal radar already built; add warranty & maintenance-contract expiries to the same "expiring soon" pattern.
6. **Asset depreciation** — schedule-driven NBV (Finance module already exists, Batch 7 — natural join for book value & P&L).
7. **Knowledge base + service catalog** — orderable services with per-item forms + KB articles for ticket deflection; converts "My requests" into a real self-service portal.
8. **Assignment/chain-of-custody history** — log every reassignment, not just current holder (audit + NESA evidence).
9. **IT reporting + Excel export** — ticket volume, asset age, spend by owner; reuse the lazy-loaded `xlsx` export layer other modules already have.

**Tier 3 — nice to have / scale- or integration-dependent:**
10. **ITIL change management** — change requests + CAB approval (heavier; only if IT process maturity is a goal).
11. **SaaS spend / usage metering & shadow-IT discovery** — needs SSO/API integrations to be real.
12. **Endpoint/MDM, patch, vulnerability management** — genuine security tooling; likely *integrations* with dedicated platforms (Intune/Lansweeper/etc.) rather than build-from-scratch, but a compliance dashboard view could surface their data.
13. **CMDB + automated discovery** — the enterprise backbone, but overkill for current scale; revisit when infrastructure inventory matters.
14. **AI auto-triage / chatbot / agentic fulfilment** — the 2026 direction of travel; layer on once there's ticket volume and a knowledge base to deflect against.

---

## 6. Quick take

The IT module today is an **honest ITAM-lite registry plus a single-queue request tracker** — solid bones (auto-tagged assets, live HR-employee FKs, a license renewal radar) but missing almost the entire **ITSM discipline** (no SLAs, no ITIL processes, no service catalog, no knowledge base) and the entire **security/endpoint/CMDB** layer. Two things would most make it read as a *real* IT system to an evaluator:

- **Close the IT↔HR loop** (JML: auto-provision on hire, auto-list assets + revoke access on offboarding, per-employee license mapping) — high impact, no new integrations, and it's the gap SPEC already flags by name; and
- **Add ITSM primitives** (SLAs, priority, a service catalog + knowledge base) that turn the request queue into a recognizable helpdesk.

Everything heavier — CMDB, discovery, MDM/patch/vuln management, agentic AI — is either integration-dependent or scale-dependent and can wait, though the UAE's newly-mandatory cybersecurity posture (NESA IA v2, PDPL data residency) means the security/audit-trail items are less "optional" for this client than they'd be elsewhere.

---

## Sources
- [Freshservice Features: ITSM, ITAM, ITOM, ESM & Service Desk](https://www.freshworks.com/freshservice/features/)
- [What is IT Asset Management (ITAM)? — Salesforce](https://www.salesforce.com/service/it-service-management/it-asset-management/)
- [What is ITAM? A comprehensive guide 2026 — ManageEngine](https://www.manageengine.com/products/service-desk/it-asset-management/what-is-itam.html)
- [Best IT Asset Lifecycle Management Software 2026 — Freshworks](https://www.freshworks.com/theworks/insights/best-it-asset-lifecycle-management-software/)
- [13 Best IT Asset Management Software (2026) — InvGate](https://blog.invgate.com/it-asset-management-software)
- [CMDB Asset Management vs ITAM: Key Differences — Virima](https://virima.com/blog/cmdb-asset-management-vs-itam-key-differences-explained)
- [ITSM Tools Comparison: ServiceNow vs JSM vs Freshservice — TechnologyMatch](https://technologymatch.com/blog/itsm-tools-comparison-servicenow-vs-jira-service-management-vs-freshservice)
- [Jira Service Management vs ServiceNow Comparison — Atlassian](https://www.atlassian.com/software/jira/service-management/comparison/jira-service-management-vs-servicenow)
- [ManageEngine ServiceDesk Plus — Help desk features](https://www.manageengine.com/products/service-desk/help-desk-features.html)
- [Software License Management: 2026 Guide — BetterCloud](https://www.bettercloud.com/software-license-management/)
- [SaaS Spend Management in 2026 — CloudEagle.ai](https://www.cloudeagle.ai/blogs/saas-spend-management-guide)
- [Joiner Mover Leaver (JML) in IAM — miniOrange](https://www.miniorange.com/blog/joiners-movers-and-leavers/)
- [Joiner, Mover, Leaver: Employee Lifecycle Access Management — SecurEnds](https://www.securends.com/blog/employee-lifecycle-access-management/)
- [Top Endpoint Management Tools 2026 (UEM Buyer's Guide) — Zecurit](https://zecurit.com/endpoint-management/top-endpoint-management-tools/)
- [12 best patch management software and tools for 2026 — TechTarget](https://www.techtarget.com/searchenterprisedesktop/tip/12-best-patch-management-software-and-tools)
- [What is Endpoint Vulnerability Management? — SentinelOne](https://www.sentinelone.com/cybersecurity-101/cybersecurity/endpoint-vulnerability-management/)
- [Agentic AI in ITSM: The 2026 Complete Guide — OnPoint](https://www.onpointserv.com/post/ai-in-itsm-from-chatbots-to-agentic-systems-the-2026-complete-guide)
- [The 8 best AI service desk tools in 2026 — eesel AI](https://www.eesel.ai/blog/best-ai-service-desk)
- [Agentic AI in ITSM — Automation Anywhere](https://www.automationanywhere.com/company/blog/automation-ai/agentic-ai-itsm)
- [UAE Cybersecurity Regulations 2025 — Complete Compliance Guide](https://eshielditservices.com/uae-cybersecurity-regulations-guide-2025/)
- [NESA Compliance in the UAE: A Complete Guide for 2026 — iConnect](https://www.iconnectitbs.com/nesa-compliance-uae/)
- [Data Protection Laws and Regulations Report 2025–2026: UAE — ICLG](https://iclg.com/practice-areas/data-protection-laws-and-regulations/uae/)
- [Data protection and cybersecurity laws in UAE — CMS Expert Guide](https://cms.law/en/int/expert-guides/cms-expert-guide-to-data-protection-and-cyber-security-laws/uae)
