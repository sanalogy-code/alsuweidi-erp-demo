---
name: update-erp
description: Sync all documentation for the ALSUWEIDI ERP project (github.com/sanalogy-code/alsuweidi-erp-demo) after a work session - updates SPEC.md and STATUS.md in the repo, and the WN Obsidian vault if reachable. Use this whenever Sana says "/update-erp", "update the ERP docs", "sync the ERP spec/status/obsidian", or after finishing any session of work on the ERP/CRM/HR modules where she'd otherwise have to ask for a docs update by hand.
---

# Update ERP Documentation

Two destinations now (GitHub is the single source of truth — no Google Drive dependency), each independent of the other succeeding or failing.

## Why this exists

Sana works on this project from multiple devices. Every session that changes the codebase should leave documentation in sync: the technical spec + status doc that live in the repo (for developers/AIs who clone it cold, and for Sana herself catching up via `/erp`), and the WN Obsidian vault (her team's actual knowledge base, work-computer only). Running this skill should be the whole request — don't make her ask for each piece by name.

## Step 1: Locate the repo

Same logic as `/erp` — if the current working directory is already a clone of `sanalogy-code/alsuweidi-erp-demo`, use it. Otherwise check `%USERPROFILE%\Projects\alsuweidi-erp-demo`; if it's not there either, this session hasn't been working in the repo, which is unusual for `/update-erp` to be invoked — clone it first (`git clone https://github.com/sanalogy-code/alsuweidi-erp-demo.git`), but this update will only reflect what's actually in the repo, not uncommitted local work that lives elsewhere.

## Step 2: Update SPEC.md

Don't just append a changelog entry — re-derive the spec's content from the actual current source so it stays *accurate*, not just *appended-to*:

1. Read `frontend/src/data/*.js` for the current data model (entities, fields, enums, taxonomies) and update the Mermaid ER diagram + tables in §2 to match. Reflect anything added, removed, or renamed since the spec was last written.
2. Read `frontend/src/pages/*.jsx` and `frontend/src/components/**/*.jsx` for the current feature map and update §3 to match — new tabs, new modals, new modules (a module going from "Coming Soon" to live is exactly the kind of thing to catch here).
3. Re-check §5 (Known Gaps) — if something listed there got built this session, remove it from gaps and fold it into the feature map instead. If a new gap became apparent, add it. This is meant to be an honest, current risk list, not a historical log.
4. If genuinely nothing changed since SPEC.md was last accurate, don't force an edit — say so in the final summary instead of making a no-op commit.

## Step 3: Update STATUS.md

Same repo, root-level file — the fast-skim companion to SPEC.md. Should agree with whatever SPEC.md now says (same facts, different audience — this one's for a quick read, not a developer digging into the data model). Update the "Current status" and "Not yet built" sections to match what's actually true now.

## Step 3b: Refresh STATS.md

Root-level `STATS.md` is the "how long did this actually take" log Sana shares with management. Refresh its numbers from git (the commands are listed at the bottom of the file itself): commit count, working days, LOC, component count, and the "as of" date. Also update the "what got built" list if this session shipped something headline-worthy. Keep the honest footnotes — the 2-day figure is impressive *because* it includes the backend detour and *because* the doc is upfront that Phase 2 is the real engineering.

## Step 4: Commit and push

From the repo root:
```
git add SPEC.md STATUS.md
git commit -m "<describe what actually changed>"
git push origin master
```
This step is expected to always succeed (it's git on a repo you have full access to) — if it fails, that's a real problem to surface, not something to skip past.

## Step 5: Try WN Obsidian

This step is expected to fail gracefully most of the time — the Obsidian MCP connector only reaches a vault open in the Obsidian desktop app on the *same machine* this skill is running on, and WN is usually open on Sana's work computer specifically.

1. Try connecting: `get_server_info` or `list_vault_files`.
2. **If it fails**: stop here, don't retry repeatedly, and don't fall back to the Sana Online personal vault or any Drive location as a substitute — ERP notes belong in WN only. Note in the final summary that this step was skipped and why.
3. **If it connects**: read `Claude Instructions.md` in the vault root first (source of truth for how this vault wants to be organized). Then find the existing ERP project note (search for something like "AL SUWEIDI ERP" or "ERP") and append a dated update summarizing what shipped this session and any course-of-action decisions, rather than rewriting the whole note. Add wiki-links to related notes where relevant. If no ERP note exists yet, create one and add it to `Plans/Dashboard.md` per that vault's conventions.

## Reporting back

End with a short summary: what changed in SPEC.md/STATUS.md (or confirmation nothing needed changing), whether the commit/push succeeded, and whether WN was reachable and updated or skipped. If nothing had actually changed since the last run, say that plainly instead of padding out a summary for edits that didn't happen.
