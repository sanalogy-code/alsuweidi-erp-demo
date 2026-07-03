---
name: erp
description: Catch up on the ALSUWEIDI ERP project (github.com/sanalogy-code/alsuweidi-erp-demo) at the start of a session, on any device. Clones or pulls the repo fresh, reads SPEC.md and STATUS.md, tries the WN Obsidian vault if reachable, and gives Sana a short "here's where we left off" briefing instead of her having to re-explain context. Use this whenever Sana says "/erp", "catch me up on the ERP project", "let's continue the ERP work", or starts a new session clearly picking the ERP/CRM/HR project back up.
---

# Catch Up on ALSUWEIDI ERP

## Why this exists

Sana works on this project from multiple devices. GitHub is the single source of truth — no Google Drive dependency, no per-device sync setup. This skill's job is to get the current code + docs onto whatever machine it's running on and reconstruct context fast, so the first message of a session can be "let's continue" instead of a context dump. It's the read counterpart to `/update-erp` (which pushes changes back to the repo, and to WN when reachable, after a work session).

## Step 1: Locate or clone the repo

Check whether the current working directory is already a clone of `sanalogy-code/alsuweidi-erp-demo` (e.g. `git remote -v` matches). If so, work there.

If not, use `%USERPROFILE%\Projects\alsuweidi-erp-demo` as the conventional local path on this device:
- If it already exists there, that's the repo to sync (Step 2).
- If it doesn't exist yet, `git clone https://github.com/sanalogy-code/alsuweidi-erp-demo.git` to that path. This is the normal case the very first time this skill runs on a given device.

## Step 2: Sync

1. `git status` — if there are uncommitted changes, don't touch or discard them; just note what's there.
2. `git fetch origin`, then check if `origin/master` is ahead of local `master`.
3. If ahead and the working tree is clean, `git pull` to catch this device up. If dirty, don't pull — surface the conflict instead of guessing what to do with it.

## Step 3: Read SPEC.md, STATUS.md, and BACKLOG.md

All live in the repo root now (moved off Google Drive intentionally — see STATUS.md's "Documentation & source of truth" section for why). SPEC.md is the detailed technical spec (architecture, full data model with ER diagram, feature map, known gaps); STATUS.md is the fast-skim companion with the same facts. BACKLOG.md is the agreed to-do list — Sana batches work from it rather than making one-off changes, so include its "Next batch" items and any decisions-pending in the briefing.

## Step 4: Try WN Obsidian

Try connecting via the obsidian-mcp-tools MCP (e.g. `get_server_info` or `list_vault_files`). This only succeeds when Obsidian desktop is open with the ALSUWEIDI vault active on this exact machine — it's the one piece of context that can't live in the repo, since it's a local desktop app tied to a specific work computer.

If it fails, skip gracefully and note in the briefing that WN wasn't reachable this time — don't treat it as an error, don't substitute the personal Sana Online vault. If it connects, find the ERP project note and read its latest entries for anything not yet reflected in SPEC.md/STATUS.md (e.g. a decision made during a work-computer session that hasn't propagated back to GitHub yet).

## Step 5: Quick reality check

Before presenting the briefing, `curl` the live URL (https://alsuweidi-erp-demo.pages.dev) and compare its served JS bundle hash against what a fresh `npm run build` of the now-synced local repo would produce — or at minimum confirm the site responds and roughly matches what STATUS.md claims is live. If there's a mismatch (local has commits not yet reflected in a live deploy, or the live site looks older than the docs describe), flag it plainly rather than presenting stale info as current.

## Step 6: Give the briefing, then stop

Synthesize Steps 1-5 into a short briefing — not a full re-print of SPEC.md/STATUS.md, an actual summary:

- One line on current status and the live URL
- What's built (module by module, brief)
- What's in progress or was explicitly deferred
- Any standing action items still outstanding (check for the leaked-credential rotation specifically — it's been open a while and easy to forget)
- Anything new from WN that hadn't propagated to the repo yet, if applicable
- Whether this was a fresh clone or a pull, and whether anything was ahead/behind

End by asking what Sana wants to work on — don't start building anything or assume the next task. The point of this skill is to make resuming fast, not to make decisions for her.
