# Phase 1 Sprint Plan — 2 Weeks to Complete CRM + HR

**Start:** 2026-07-02  
**End:** 2026-07-16  
**Goal:** Finish Phase 1 (CRM polished + HR complete) → Show to management → Get sign-off for Phase 2

---

## Week 1: HR Build-Out

Build the five core HR modules (Employee Directory, Leave Management, Attendance, ESS, Benefits).

| Day | Feature | Scope | Hours | Lead | Notes |
|-----|---------|-------|-------|------|-------|
| **Day 1–2** | **Employee Directory** | List view + search + detail modal (name, title, dept, email, start date, docs) | 4–6h | Fable | Use same modal pattern as Contacts. Dummy data in `hrData.js`. Search across name/dept/title. |
| **Day 3–4** | **Leave Management** | Request form → approval flow → balance tracker → leave calendar | 6–8h | Fable (forms) + Sonnet (workflow) | State: pending/approved/denied. Show remaining balance. Calendar shows who's out. |
| **Day 5–6** | **Attendance** | Clock in/out buttons, weekly hours view, overtime calc | 4–6h | Fable (time logic) | Simple: manual clock in/out timestamps. Show hours this week + overtime. |
| **Day 7–8** | **Employee Self-Service (ESS)** | View own profile, edit contact/emergency/banking info | 4–5h | Fable (forms) | Restrict to logged-in user's own data. Inline edit like ContactDetailModal. |
| **Day 9** | **Benefits View** | Display current benefits (health, pension, life, etc.) — display only | 2–3h | Fable | Enrollment data only, no edits yet. Show plan type, effective date, cost-share. |

**Week 1 total:** ~26–32 hours. All in React, same components as CRM.

---

## Week 2: CRM Polish + System Testing

Finish CRM gaps + polish + testing + demo prep.

| Day | Feature | Scope | Hours | Lead | Notes |
|-----|---------|-------|-------|------|-------|
| **Day 10–11** | **CRM Edit/Delete** | Edit + delete modals for Companies and Deals | 3–4h | Fable | Same pattern as ContactDetailModal. Confirm on delete. |
| **Day 12** | **CRM Polish** | Validation, error messages, empty states, sorting, pagination if needed | 3–4h | Fable | "No companies yet" states, form validation (required fields), better error feedback. |
| **Day 13–14** | **Testing + Refinement** | QA across all modules (CRM + HR), fix bugs, demo readiness, polish UX | 4–5h | Manual + Sonnet review | Load dummy data, test workflows end-to-end. Fix any crashes or weird UX. |

**Week 2 total:** ~13–17 hours.

**Phase 1 total:** ~40–50 hours of dev work.

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
