# Open Maestro — Master Plan (get the 4 parts to their best, then build the app)

Order of intent: (1) make the pieces we have excellent + reliable, (2) build the missing harness, (3) build the full application from Ohad's designs — using parallel agents.

---

## 0. Status snapshot (grounded)

- Lessons: 16 baked (PY101 W1–W2). Correct but voice can be warmer → re-bake with Fable 5.
- Harness: NOT built yet (this is the big gap).
- Memory: Hermes snapshot exists (name/goal capture, localStorage).
- Autoresearch: architecture works (reached best 80% on the real Qwen model), but is **currently broken** because: (a) OpenRouter credit exhausted ($10.20/$10), (b) no retry/error tolerance → one transient API error kills a whole run, (c) ~$1/run hourly is unsustainable, (d) duplicate loop-state files.

---

## 1. Fix the two problem areas (do first)

### 1a. Autoresearch — make it reliable + cheap
- **Retry + tolerance (code):** add exponential backoff on 429/5xx/timeout in `openai-client.ts`; make `evaluateBench` skip a cell that still fails after retries instead of crashing the whole run.
- **Cost control (code + config):** shrink per-run cost — smaller `BENCH_LESSON_LIMIT` (e.g. 3), rotate lessons across runs for full coverage over time, cap concurrency, and run **3×/day, not hourly**. Add a spend log line per run.
- **Single source of truth:** keep loop-state/best-policy only in the connected project folder; delete the stale gpt-era file; stamp benchVersion.
- **Budget decision (Ohad):** top up OpenRouter (recommend $10–20) and/or accept the cheaper cadence. Loop stays paused until this is set.
- Done when: a run completes end-to-end without crashing, logs its spend, and improves (or holds) the score on the real model.

### 1b. Lessons — re-bake with Fable 5
- Swap the baker's model to **Fable 5** (via OpenRouter) for warm, human *voice*; keep a **correctness pass** (reasoning model or the validator) over every Python snippet.
- Re-validate all 16 against `bakedLessonSchema`; write to `frontend/public/content/py101`.
- Done when: all 16 pass schema + a spot-read shows noticeably warmer, clearer lessons with correct code.

### 1c. Confirm everything is on track (health check)
- Lessons load, tutor streams on-device, memory persists, bench runs through. One quick pass, report green/red per part.

---

## 2. Build the harness (the missing brain)

Per `context/harness-spec.md` + `context/build-eval-plan.md`. Slice-by-slice, tutor never breaks, tests each slice, eval runs through the full `handleTurn`:
- Slice 0 skeleton → 1 controller (progression + closure) → 2 answer-leak guard → 3 affect → 4 memory curator → 5 grounding + misconception → offline failure-miner.
- Target behaviors = the 17-row Situation Catalog. Beat Maestro on: brevity, tight steer-back, non-formulaic variety, and actually finishing lessons.

---

## 3. Build the full application (from Ohad's designs)

The product is a fullstack AI university, not just a tutor. Wrap the AI core in:
- **Signup + accounts.**
- **Navigation:** Degree → Course → Weeks → Lessons (catalog + summit/home partly exist).
- **Lesson screen:** the harnessed tutor (from §2).
- **Assessments:** end-of-week mini-exam + end-of-course test (decide: auto-graded MCQ/code via Pyodide = cheap, or AI-graded = more inference).
- **Progress + dashboard/home:** completion, scores, the "climb".
- **Backend decision (Ohad):** real backend (accounts/progress/exams persisted, cross-device) vs local-only for the demo. $0-AI still holds because inference stays on-device; a progress backend is cheap.
- Built from the designs Ohad made in Claude design (he sends them → we implement to match).

---

## 4. Parallel execution (agents working in parallel)

Independent workstreams that can run at once, each in its own git worktree, integrated behind tsc + tests:

- **Stream A — Autoresearch reliability + cost** (backend/loop). Independent. Urgent.
- **Stream B — Lesson re-bake with Fable** (backend/bake + public content). Independent.
- **Stream C — Harness** (frontend/src/harness + useTutorChat). Independent frontend area.
- **Stream D — App shell + screens** (frontend/src/features, routing, App) from Ohad's designs. Needs the designs.
- **Stream E — Backend for accounts/progress/exams.** Only if we go real-backend.

Coordination rules: A and B are offline/backend and fully parallel now. C and D both touch the frontend but different folders — separate worktrees, agree shared types up front, integrate sequentially. Each agent: read `context/CONVENTIONS.md`, build its slice, verify (tsc/lint/tests), hand back a clean diff. Orchestrator (me) merges + resolves conflicts + runs the full gate.

---

## 5. Sequence

1. Now (parallel): **A (fix autoresearch)** + **B (re-bake lessons)** — both offline, both broken/weak, both independent. In parallel: start **C Slice 0–1** (harness skeleton + controller).
2. Then: harness Slices 2–5 + point the (fixed) autoresearch at the harnessed turn.
3. When designs arrive: **D** (app shell/screens) + **E** (backend) if chosen.
4. Continuous: autoresearch (cheap cadence) + failure-miner keep improving quality.

## What I need from Ohad
- The designs (for Stream D).
- Two decisions: autoresearch **budget/cadence**, and **real backend vs local** for assessments/progress.
