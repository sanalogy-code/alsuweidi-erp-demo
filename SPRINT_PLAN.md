# Phase 1 Sprint Plan — 2 Weeks to Complete CRM + HR

**Start:** 2026-07-02  
**End:** 2026-07-16  
**Goal:** Finish Phase 1 (CRM polished + HR complete) → Show to management → Get sign-off for Phase 2

---

## Week 1: HR Build-Out (Daily Quick Wins)

Ship small pieces daily. Each task = 30 mins to 1 hour, visible progress every day.

| Day | Task | What | Est | Commit |
|-----|------|------|-----|--------|
| **Day 1a** | Employee List | HR tab → list view of all employees (name, title, dept) | 30m | `Add HR Employee list view` |
| **Day 1b** | Employee Search | Add search box to filter by name/dept/title | 30m | `Add HR employee search` |
| **Day 1c** | Employee Detail Modal | Click name → modal (name, title, email, start date, documents) | 45m | `Add HR employee detail modal` |
| **Day 2a** | Leave Request Form | Modal to request leave (type, dates, reason) | 45m | `Add leave request form` |
| **Day 2b** | Leave Requests List | Show all leave requests (pending/approved/denied) | 30m | `Add leave requests view` |
| **Day 2c** | Approve/Deny Leave | Buttons to change request status | 30m | `Add leave approval actions` |
| **Day 3a** | Leave Balance | Show remaining vacation/sick/unpaid days | 30m | `Add leave balance display` |
| **Day 3b** | Leave Calendar | Visually show who's out (heatmap or simple list) | 45m | `Add leave calendar view` |
| **Day 4a** | Attendance Clock In/Out | Buttons to record clock in/out | 45m | `Add attendance clock in/out` |
| **Day 4b** | Attendance Hours View | Show hours logged this week + total | 30m | `Add attendance hours summary` |
| **Day 5a** | ESS: View Own Profile | Employee sees their own data only | 30m | `Add ESS profile view` |
| **Day 5b** | ESS: Edit Contact Info | Inline edit name, email, phone (own data only) | 45m | `Add ESS edit contact info` |
| **Day 6a** | Benefits Display | Show current health, pension, life insurance | 30m | `Add benefits view` |
| **Day 6b** | Benefits Details | Click benefit → see plan type, effective date, cost-share | 30m | `Add benefits detail modal` |

**Week 1 total:** ~9 hours, 14 small commits, daily visible progress.

---

## Week 2: CRM Polish + System Testing (Daily Wins)

| Day | Task | What | Est | Commit |
|-----|------|------|-----|--------|
| **Day 7a** | Edit Company | Company detail → edit modal (name, industry, location, status) | 45m | `Add company edit modal` |
| **Day 7b** | Delete Company | Confirm dialog, remove from list | 30m | `Add company delete` |
| **Day 8a** | Edit Deal | Deal detail → edit modal (title, value, stage, close date) | 45m | `Add deal edit modal` |
| **Day 8b** | Delete Deal | Confirm dialog, remove from pipeline | 30m | `Add deal delete` |
| **Day 9a** | Form Validation | Required fields, error messages (all forms) | 45m | `Add form validation` |
| **Day 9b** | Empty States | "No companies yet", "No contacts yet", etc. | 30m | `Add empty state messages` |
| **Day 10a** | Polish CRM | Sort options (by name, by value, by date) | 30m | `Add CRM sorting` |
| **Day 10b** | Polish HR | Consistent styling, button placement, spacing | 45m | `Polish HR UI` |
| **Day 11a** | Test CRM end-to-end | Add/edit/delete contacts, companies, deals. Log interactions. Export. | 1h | Test + document issues |
| **Day 11b** | Test HR end-to-end | Request leave, approve, view balance, clock in/out, view benefits. | 1h | Test + document issues |
| **Day 12a** | Fix bugs | Any crashes, validation issues, UX weirdness | 1h | Fixes |
| **Day 12b** | Demo walkthrough | Full workflow: add contact → log interaction → request leave → approve → view benefits | 30m | `Ready for demo` |

**Week 2 total:** ~9 hours, 12 commits, tested & demo-ready.

**Phase 1 total:** ~18 hours of dev work, 26 small commits, daily shipped features.

---

## Data Model Additions (by Day)

**HR Module state shape** (add to `frontend/src/data/hrData.js`):

```javascript
// Employees (already have in CRM as Contacts? Reuse or separate?)
employees: [
  { id: 1, name, title, dept, email, phone, startDate, status: 'active', ...}
]

// Leave requests
leaveRequests: [
  { id, employeeId, type: 'vacation'|'sick'|'unpaid', startDate, endDate, 
    days, reason, status: 'pending'|'approved'|'denied', approvedBy, approvedDate }
]

// Leave balances (calculated from requests + company policy)
leaveBalances: [
  { employeeId, vacation: 20, sick: 10, unpaid: 0, used: { vacation: 5, sick: 2 } }
]

// Attendance records
attendance: [
  { id, employeeId, date, clockIn, clockOut, hoursWorked, overtime }
]

// Benefits enrollment
benefitsEnrollment: [
  { id, employeeId, planType: 'health'|'pension'|'life', planName, 
    effectiveDate, cost, employerContribution, employeeContribution }
]
```

---

## Implementation Notes

### Fable's job (Days 1–3, 5–7, 9–12):
- Build modals, forms, list views (boilerplate-heavy)
- Implement leave approval logic (state management)
- Add attendance calculations (time math)
- Polish: validation, error states, empty states
- **Use Fable for:** repetitive UI patterns, form handling, state logic

### Sonnet's job (Days 4, 8, 13–14):
- Review leave approval workflow (is it right?)
- Code review for correctness
- Testing strategy validation
- Final polish & QA sign-off
- **Use Sonnet for:** design decisions, logic verification, edge cases

---

## Testing Checklist (Day 13–14)

Before showing to management:

- [ ] **CRM:** Add/edit/delete contact works. Edit/delete company/deal works. Export works. Interaction logging works.
- [ ] **HR:** Directory searchable. Leave request → approval → balance updates. Attendance tracking shows hours. ESS can edit own info. Benefits display correctly.
- [ ] **Overall:** No console errors. All modals close properly. Data persists on refresh (it's dummy data, so resets — that's fine, but should reset consistently).
- [ ] **Mobile:** Works on tablet (resize to 768px). Not required to be perfect, but shouldn't break.
- [ ] **Demo:** Walk through a full workflow: add contact → log interaction → request leave → approve leave → view benefits.

---

## Deliverable (End of Day 14)

- ✅ Cloudflare Pages updated with complete Phase 1 code
- ✅ Demo URL: https://alsuweidi-erp-demo.pages.dev
- ✅ All CRM features working
- ✅ All HR features working
- ✅ Ready to show management

---

## Next (After Management Sign-Off)

Once management validates Phase 1, move to **Phase 2** (backend design + IT asks).  
See [BACKEND_PLAN.md](BACKEND_PLAN.md) for next steps.

---

## How to Use This Plan

- Check off completed days ☑️
- If a day slips, compress the next feature (cut a feature, don't skip QA)
- Daily commits to master (or feature branches if you prefer)
- Push to Cloudflare at end of each day to validate UI in production
- Update this file if scope changes
