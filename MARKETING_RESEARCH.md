# Marketing & Content Feature Landscape — Research & Gap Analysis

*Research date: 2026-07-06. Purpose: survey the full breadth of marketing-module functionality found in market platforms — general marketing suites (DAM, social, email, CMS, analytics) **and, crucially, the specialized AEC / professional-services business-development stack** (proposals, project sheets, credentials, resumes, award submissions) — then map it against what the ALSUWEIDI ERP Marketing & Content module already ships, so we can see what's missing and what's worth building.*

**Read this first:** for this firm, "marketing" is **not** e-commerce funnels or demand-gen. It is **business development for qualifications-based selection (QBS)**: winning engineering/consulting work by producing proposals, EOIs, capability statements, project reference sheets, staff CVs, and credentials, backed by a portfolio, a brand, and a modest content/social presence. The gap analysis below weights AEC/professional-services BD needs first, then the general marketing landscape.

---

## 1. How the market organizes marketing functionality

Two different worlds overlap here, and this module lives in both:

**A. General marketing platforms** cluster into roughly six layers (CMSWire, Sprout, Frontify):

1. **Brand & Asset (DAM)** — the central, searchable, rights-managed repository of logos, photography, templates, video, with metadata/tagging, versioning, and expiry.
2. **Content & Campaign** — content calendar, campaign planning, approval workflows, asset production.
3. **Channels** — social media scheduling, email/newsletter, website/CMS, SEO, events/webinars, PR.
4. **CRM-marketing alignment** — lead capture, nurture, list segmentation, attribution.
5. **Analytics & ROI** — web/social/email metrics, campaign attribution, dashboards.
6. **AI layer** (2026 table-stakes) — auto-tagging, copy generation, optimal-timing, sentiment.

**B. The AEC / professional-services BD stack** reorganizes the same primitives around *winning bids* (OpenAsset, Deltek, Unanet, QorusDocs, Zweig Group):

1. **Pursuit CRM** — go/no-go, opportunity pipeline, client/relationship intelligence (Deltek Vantagepoint, Unanet/Cosential).
2. **Project-based DAM** — assets tagged *by project*, so a query returns the photos, sheet, and metrics for one job (OpenAsset is the category-definer — "the only project-based DAM built for AEC").
3. **Proposal automation & content library** — reusable boilerplate, past answers, capability statements, auto-assembled RFP/EOI responses (QorusDocs, Unanet ProposalAI, Responsive, Flowcase).
4. **Project sheets + staff resumes** — templated one-pagers and CVs generated from the DAM/database (OpenAsset Employee Module, Flowcase).
5. **BD analytics** — proposal win rate, hit rate by pursuit type, revenue attribution (Zweig Group metrics).

Our module today is strong on the **AEC "portfolio readiness" workflow** (project → description → approved photos → gate) and **brand basics**, decent on **content calendar** and **CRM-marketing alignment** (win rate is live from CRM), and largely white-space on the **proposal/content-library layer, project-based DAM, channel execution (social/email actually sending), and analytics depth**.

> **Scope note carried throughout:** media/photo *storage* was **deliberately scoped out** of this module (Sana's call, 3 Jul — files are name-only, downloads are stubs). That single decision is what separates our module from a real **DAM**, which is the beating heart of every AEC marketing tool. We still document what a full DAM would add, flagged **[DAM — scoped out]**, so the decision is made with eyes open.

---

## 2. Full market feature checklist vs. what we already have

Legend: ✅ shipped · 🟡 partial / mock · ❌ missing

### AEC / Professional-Services BD core (weight these first)

| Feature | Status | Notes |
|---|---|---|
| Portfolio / project reference database | ✅ | Projects module + Marketing's `PortfolioView`; portfolio-readiness (`description + approved photos + not confidential`), per-project years/images/special-features |
| Portfolio "readiness" gate & workflow | ✅ | Unusually good: project **can't complete** without marketing description + approved photography; 4-step `photoWorkflow` state machine; auto-queued Marketing inbox tasks |
| Curated portfolio packs for BD hand-off | ✅ | `PORTFOLIO_PACKS` by category, managed by Marketing, surfaced in CRM "Portfolio PDFs" — a genuine BD-enablement touch |
| **Project reference sheets ("project sheets")** | ❌ | No templated one-page project sheet generation (the #1 AEC marketing deliverable — OpenAsset/Flowcase's core output). We hold the *data* but can't render a sheet |
| **Staff resumes / CV sheets for proposals** | 🟡 | `CvSearch` finds people by keyword/accomplishment/headshot; **but no templated proposal-CV generation** (OpenAsset Employee Module). Data exists (accomplishments, bios implied), output does not |
| **Proposal / pitch content library** | ❌ | No reusable boilerplate, capability statements, past-answer/Q&A library, approved messaging store (QorusDocs/Responsive/AutoRFP core). Brand templates exist but not *content* |
| **Proposal / EOI assembly & automation** | ❌ | Proposal Builder was **deleted in Batch 6** by decision; nothing assembles a proposal/EOI from project sheets + CVs + boilerplate. Biggest AEC white space |
| **Go/No-Go & pursuit tracking** | 🟡 | CRM deal pipeline (Prospecting→Proposal→…→Won/Lost) covers opportunity stages; **no explicit go/no-go decision record, pursuit scoring, or bid/no-bid log** |
| Win-rate / proposal analytics | 🟡 | Win rate computed **live from CRM deals** (genuinely good) — but no hit-rate by sector/pursuit-type, no time-to-submit, no proposal-effort tracking |
| Credentials / capability statement store | ❌ | No ISO certs, registrations, insurance certs, prequalification packs, safety records repository (QBS submittals need these) |
| **Award / submission tracking** | ❌ | No award-opportunity calendar, submission pipeline, deadlines, results log (a named professional-services marketing function) |
| Client/relationship intelligence for BD | 🟡 | CRM has companies, contacts, tags, project history — no marketing-owned "org chart of the client" or relationship-mapping/warmth scoring |

### Brand & Digital Asset Management (DAM)

| Feature | Status | Notes |
|---|---|---|
| Brand asset library (logos/fonts/templates) | ✅ | `BRAND_ASSETS` (16 assets, 6 categories), logo variants (colour/reversed), EN+AR fonts, templates, stationery — visible to everyone |
| Brand guidelines / usage rules | ✅ | `BRAND_QUICK_GUIDELINES` (logo/font/colour "30-second version") + full Guidelines PDF + Narrative Guide — better than most SME setups |
| **Actual file storage / upload / download** | ❌ | **[DAM — scoped out]** Everything is name-only; downloads are demo stubs. This is the foundational DAM capability |
| **Metadata / tagging / search of assets** | ❌ | **[DAM — scoped out]** No AI auto-tagging, visual search, keyword search across assets (2026 DAM table-stakes per Forrester) |
| **Project-based asset tagging** | ❌ | **[DAM — scoped out]** OpenAsset's defining feature — assets tagged by project so one query returns everything for a job. We link content→project but store no assets |
| Asset versioning / expiry / rights mgmt | ❌ | **[DAM — scoped out]** No version history, no usage rights / model-release / photo-license tracking, no asset-expiry workflow |
| Photography lifecycle | 🟡 | The *workflow* to arrange/approve project photos is strong (`photoWorkflow`); the *photos themselves* aren't stored |
| Brand portal for partners/subconsultants | ❌ | No external-facing brand portal (2026 DAM trend) — likely low priority here |

### Content, Campaigns & Approvals

| Feature | Status | Notes |
|---|---|---|
| Content calendar | ✅ | `ContentCalendar` month grid + list, copy+media primary fields, related-project link, month/custom-range selector |
| Content approval workflow | ✅ | `idea → draft → pending_approval → approved → published`, advanced inline |
| Campaign management / planning | 🟡 | "Campaign" is one `CONTENT_TYPE`; **no multi-asset campaign container, budget, timeline, or multi-channel campaign view** |
| Editorial roles / assignment / due dates | 🟡 | `owner` = "Marketing" (team, not person); no per-person assignment, no editorial workload view |
| AI content generation | ❌ | No AI copy drafting, caption generation, repurposing, or summarization (2026 baseline across Hootsuite/Sprout/QorusDocs) |

### Channels — Social / Email / Website / SEO / Events / PR

| Feature | Status | Notes |
|---|---|---|
| Social scheduling & publishing | ❌ | Content calendar *plans* LinkedIn posts; **nothing schedules or publishes** to any network. No multi-account, no queue, no optimal-timing |
| Social listening / inbox / engagement | ❌ | No unified social inbox, mentions, comment management, sentiment |
| Email / newsletter sending | 🟡 | Newsletters + welcome emails are *designed*; **no send capability** (structurally impossible client-side — needs Phase 2 provider like Resend) |
| Email lists / segmentation / automation | ❌ | No subscriber lists, segmentation, drip/nurture, unsubscribe handling |
| Website / CMS management | ❌ | No page/content management, publishing, or case-study page builder (Corniche case-study lives only as a calendar item) |
| SEO tooling | ❌ | No keyword/rank tracking, on-page audit, or content-SEO scoring (Ahrefs/SEMrush territory) |
| Event / webinar management | ❌ | "Big 5 exhibition" is a calendar chip only — no event pipeline, stand/booth logistics, invitee lists, registration, or webinar hosting |
| PR / media coverage tracking | ❌ | No media contact list, press-release pipeline, coverage log, or share-of-voice |
| Thought leadership / speaking pipeline | ❌ | No tracking of speaking slots, op-eds, whitepapers, byline pipeline (a core professional-services BD activity) |

### CRM-Marketing Alignment

| Feature | Status | Notes |
|---|---|---|
| Shared CRM ↔ Marketing data | ✅ | Win rate live from CRM deals; portfolio packs shared via `portfolioPacksStore`; project→content links; seniority taxonomy shared |
| Lead capture / web-to-lead | ❌ | No forms, landing pages, or web-lead → CRM flow |
| Lead scoring / nurture / MQL→SQL | ❌ | No scoring, lifecycle stages, or marketing-sourced-pipeline attribution |
| List/segment management for outreach | ❌ | No marketing audience lists distinct from CRM contacts |

### Analytics, ROI & Intelligence

| Feature | Status | Notes |
|---|---|---|
| Marketing analytics dashboard | 🟡 | `MarketingAnalytics`: win rate (live), portfolio-ready count, content pipeline by status — real ones are good |
| Social / web analytics | 🟡 | `LINKEDIN_STATS` / `WEBSITE_STATS` are **labelled mock feeds** pending Phase 2 integrations |
| Email analytics | ❌ | No open/click/bounce/unsubscribe metrics |
| Campaign attribution / marketing ROI | ❌ | No spend tracking, cost-per-lead, marketing-sourced revenue, or ROI reporting (30–50% ROI lift is the data-driven-firm benchmark) |
| BD hit-rate analytics by segment | ❌ | Win rate is aggregate only; no breakdown by sector/type/client/pursuit-size (Zweig Group AEC metrics) |
| Predictive / AI insights | ❌ | No optimal-timing, engagement prediction, or content recommendations |

### Experience & Plumbing (shared with rest of ERP)

| Feature | Status | Notes |
|---|---|---|
| Marketing inbox / task queue | ✅ | `MarketingInbox` — cross-module auto-fed (project created→description, near-completion→photos, new joiner→headshot+welcome email), deduped, badged |
| **Notifications** | ❌ | Inbox exists but **nothing notifies anyone** (SPEC-wide Phase 2 gap) |
| Employee headshots & bios | 🟡 | Headshot *task* tracked; headshot *file* not stored **[DAM — scoped out]**; no structured marketing-bio field per employee |

---

## 3. AEC / professional-services–specific depth (why generic tools don't cut it)

The AEC marketing literature is consistent: **63% of AEC marketing teams spend more than 50% of their time on proposals**, and generic marketing software doesn't understand QBS, SF330-style forms, go/no-go, or project-sheet/CV assembly (OpenAsset). The purpose-built stack (Deltek Vantagepoint, Unanet/Cosential, OpenAsset, QorusDocs, Flowcase) is organized around exactly the things our module is thinnest on:

| AEC-specific capability | Status | Why it matters here |
|---|---|---|
| Proposal content library (boilerplate + past answers) | ❌ | The single biggest AEC time-sink; a reuse library is the highest-leverage BD tool |
| Project sheet generation | ❌ | Every EOI/proposal needs one-pagers; we have the data, not the render |
| Proposal-ready staff CV generation | 🟡 | `CvSearch` finds people; can't produce the formatted CV a bid needs |
| Project-based DAM | ❌ | **[scoped out]** OpenAsset's raison d'être; without stored assets, sheets/proposals can't auto-assemble |
| Go/No-Go pursuit tracking | 🟡 | CRM pipeline approximates it; no explicit bid/no-bid decision log |
| Award & submission management | ❌ | A named professional-services marketing function; nothing tracks it |
| Credentials / prequalification pack store | ❌ | GCC/UAE tenders demand ISO certs, trade licences, insurance, prequal docs on tap |
| BD win-rate analytics by segment | 🟡 | Aggregate win rate only |

---

## 4. Prioritized gaps — what's most worth building next

**Tier 1 — highest leverage, directly serves how this firm actually wins work:**

1. **Proposal content library + project sheet generation.** The AEC deliverable. A reusable store of boilerplate/capability statements/past answers, plus templated **project sheets** and **proposal CVs** generated from data we already hold (projects, accomplishments). This is the single feature that would make the module read as *AEC marketing software* rather than a generic content tool. (Note: the Batch-6-deleted Proposal Builder was pointing at this need — the right version is a *content library + template render*, not a freeform builder.)
2. **Award & submission tracking.** Small, self-contained, fits the existing inbox/queue pattern: award/EOI/prequal opportunities with deadlines, submission pipeline, and results log. High BD relevance, low build cost.
3. **BD analytics depth.** Extend the already-live win rate into **hit rate by sector / pursuit type / client / size**, time-to-submit, and proposal-effort — the AEC metrics that management actually asks for.
4. **Notifications.** Same cross-cutting win as elsewhere: the Marketing inbox auto-fills but nothing pings anyone. Small plumbing, large payoff.

**Tier 2 — strong additions that round out the module:**

5. **Credentials / prequalification repository** — ISO certs, trade licences, insurance, safety records, registrations, with expiry tracking (mirrors HR's renewals pattern; essential for GCC tenders).
6. **Reconsider the DAM decision (at least partially).** Full DAM is out of scope, but *project-tagged asset storage* is what makes sheets/proposals auto-assemble. Even a lightweight "attach approved photos to a project, tagged and searchable" would unlock Tier-1 item #1. Worth a deliberate re-decision, not a silent default.
7. **Campaign container** — group multi-asset, multi-channel efforts (e.g. "Healthcare capabilities campaign") with timeline/owner/goal, above the current single-item content calendar.
8. **Email sending + newsletter lists** — turn the *designed* newsletters/welcome emails into actual sends (Phase 2 serverless + Resend, already flagged in SPEC).

**Tier 3 — nice to have / scale- or integration-dependent:**

9. **Social scheduling & publishing** (LinkedIn-first — the only social channel this firm uses) + real LinkedIn analytics replacing the mock feed.
10. **Website/CMS + case-study page management** (publish the case studies currently trapped as calendar chips).
11. **PR / media coverage + thought-leadership/speaking pipeline** tracking.
12. **AI content generation** (draft copy, captions, project-description first drafts, RFP-answer suggestions) — 2026 baseline, and a natural assist for the proposal library.
13. **SEO tooling; marketing ROI/attribution; event & webinar management; lead capture forms.**

---

## 5. Quick take

The module is already **unusually strong on the AEC "portfolio readiness" workflow** — the completion gate, the 4-step photography state machine, the auto-fed Marketing inbox, and a **live win rate from real CRM deals** are things most generic marketing suites *don't* do and most SME AEC firms do by hand. Two things would most make it read as *complete AEC marketing software* to an evaluator:

- **A proposal/content layer** — a reusable content library plus generated **project sheets and proposal CVs** (the deliverables AEC marketers spend >50% of their time on), which is entirely absent since the Proposal Builder was removed, and
- **BD/credentials tracking** — award & submission pipeline, prequalification/credentials repository, and win-rate analytics *by segment* — the qualifications-based-selection table-stakes that generic social/email tools completely lack.

Everything else (social scheduling, email sending, CMS, SEO, AI, campaign containers) is real but incremental, and most of it layers onto patterns already in place. The one strategic decision to revisit deliberately is the **scoped-out DAM**: full DAM stays out, but *project-tagged asset storage* is the hinge that makes the Tier-1 proposal/sheet features actually assemble.

---

## Sources

- [What are the top AEC marketing tools in 2026? — OpenAsset](https://openasset.com/resources/top-aec-marketing-tools/)
- [OpenAsset — Document Creation Tools for AEC Proposals](https://openasset.com/document-creation/)
- [Generate Project Sheets, Resumes & Presentations — OpenAsset Help Center](https://success.openasset.com/en/articles/10594292-generate-project-sheets-resumes-and-presentations-out-of-openasset-with-custom-templates)
- [Best Document Creation Tools for AEC Firms in 2026 — Flowcase](https://www.flowcase.com/blog/best-document-creation-tools-for-aec-firms-in-2026)
- [Top 9 Proposal Software for Professional Services Firms — Flowcase](https://www.flowcase.com/blog/proposal-software-review-9-vendors-that-help-to-power-bid-teams)
- [AI Proposal Software / AEC Proposals — QorusDocs](https://www.qorusdocs.com/proposals-for-aec)
- [Engineering Proposal Software / AEC RFP Automation — Bidara](https://www.bidara.ai/industries/engineering)
- [7 Reasons AEC Firms Choose Deltek Vantagepoint CRM — Stambaugh Ness](https://www.stambaughness.com/blog/7-reasons-aec-firms-choose-deltek-vantagepoint-crm-growth/)
- [CRM for Architecture Firms — Deltek](https://www.deltek.com/en/architecture-and-engineering/architecture-software/crm)
- [12 Proven AEC Marketing Strategies for 2026 to Win Bids — Bolt PR](https://www.boltpr.com/article/aec-marketing-strategies)
- [Marketing Metrics for the AEC Industry — Zweig Group](https://zweiggroup.com/blogs/news/marketing-metrics-for-the-aec-industry)
- [The Best Digital Asset Management (DAM) Platforms for 2026 — MediaValet](https://www.mediavalet.com/blog/best-digital-asset-management-platform)
- [What Is Digital Asset Management? 2026 DAM Guide — Frontify](https://www.frontify.com/en/guide/digital-asset-management)
- [25 Digital Asset Management Systems to Consider in 2026 — CMSWire](https://www.cmswire.com/digital-asset-management/examining-19-enterprise-digital-asset-management-solutions/)
- [21 Best Social Media Scheduling Tools in 2026 — Sprout Social](https://sproutsocial.com/insights/social-media-scheduling-tools/)
- [Social Media Calendar and Scheduler — Hootsuite](https://www.hootsuite.com/platform/publishing)
- [15 Best Email Marketing Platforms 2026 — Brevo](https://www.brevo.com/blog/best-email-marketing-services/)
- [Professional Services PR / Thought Leadership Agency — Profile](https://welcometoprofile.com/industries/professional-services-thought-leadership-pr-agency)
- [The ROI of Intelligence: Measuring AI Value in Professional Services Marketing & BD — InnovAItion Partners](https://innovaitionpartners.com/blog/the-roi-of-intelligence-a-definitive-guide-to-measuring-ai-value-in-professional-services-marketing-and-business-development)
