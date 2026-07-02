# Open Maestro — brief for a Claude Fable 5 agent

## TL;DR

Open Maestro is a **free, private, on-device AI-engineering degree** taught by an AI tutor
that runs **inside the learner's browser at ~$0 per student**. It's a hackathon build
(demo July 5). It's live at **open-maestro.vercel.app** and auto-deploys from
`main` on `github.com/OhadDaniel/open-maestro`.

The one idea that makes it work: **a small, free, on-device model teaches at a high level
because strong models designed its content and its playbook offline.** Cost lives at build
time, never per student.

## Why it exists (the reason behind the work)

Masterschool-style degree quality, but free, private (nothing leaves the device), and
scalable to zero marginal cost per learner. The learner "climbs a mountain": the degree is
the mountain, each week is a level, each lesson is a step.

## The LLM architecture — three model roles

This is the heart of the project. There are three distinct LLM roles, and only one of them
runs per learner.

### 1. Runtime tutor — on the learner's device (the only per-user model)

- **web-llm** running **`Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC`** over **WebGPU**, fully in
  the browser. Upgrades to **`Qwen2.5-Coder-7B-...`** when the device reports enough memory
  (`pickBestModel()` in `frontend/src/ai/webllm-provider.ts`).
- Wrapped behind a `TutorProvider` interface (`streamMessage`). Real path = `WebLlmProvider`
  (needs WebGPU → Chrome/Edge). Fallback when there's no WebGPU = `OfflineTutorProvider`, a
  deterministic tutor grounded directly in the baked lesson content (so the app still works
  everywhere, and is testable headlessly).
- The learner's Python runs in-browser via **Pyodide** (CPython in WASM). No code leaves the device.
- **$0 per student, private, offline-capable.** This is the economic thesis.

### 2. Offline lesson baking — build time only

- **Claude Fable 5** (`anthropic/claude-fable-5` via OpenRouter) turns raw course material
  into rich "baked" JSON: three explanation levels, a hint ladder, checks, misconceptions,
  retrieval chunks, pedagogy rules, and a celebration. See `backend/bake/`.
- Ships as **static JSON** with the app (`frontend/public/content/py101/*.json`) — 16 lessons
  across PY101 weeks 1–2. Never called per user.

### 3. Autoresearch — build-time optimization of the tutor's *playbook*

- A `propose → test → keep-best` loop that evolves the tutor's **policy** (the system prompt:
  persona + progression rules + exemplars), scored by a blind judge over 12 student personas
  × lessons × a 13-criterion pedagogy rubric. See `backend/loop/`.
- Roles in the hybrid setup (`backend/loop/run-mac-hybrid.sh`, `backend/eval/openai-client.ts`):
  - **tutor-under-test** = local **Qwen2.5-Coder-3B** via Ollama (free; same family as the app)
  - **blind judge** = **Claude Haiku 4.5** (OpenRouter)
  - **researcher** (rewrites the policy each round) = **Claude Fable 5** (OpenRouter)
  - **student simulator** = GPT-4o-mini (OpenRouter)
- Output = `frontend/src/tutor/tutor-policy.json`, read as the on-device model's system prompt.
- **Result so far: blind-judge score 55% → 67%**, and that 67% policy is **promoted and live**.

## Strategy in one line

Expensive intelligence (Claude Fable 5) is spent **offline** — once — to write the lessons and
to design the teaching playbook. A small free model then delivers that playbook on-device,
per learner, at no cost. Autoresearch is how the playbook keeps getting better without ever
touching a learner's device or bill.

## The harness — how the on-device tutor actually behaves

Every tutor turn runs a deterministic pipeline (`frontend/src/harness/`):

**Sense** (affect, mastery, misconception signals) → **Decide** (a deterministic controller +
playbooks choose one teaching "move") → **Generate** (a single provider call, grounded in the
baked lesson + policy + the learner's memory + the chosen move) → **Verify** (answer-leak guard,
grounding guard) → **Remember** (memoryCurator writes the learner profile, async). Signals use
zod contracts. 37 unit tests cover it.

## What's built and verified live (done)

- **Position-driven content** — the lesson is a pure function of the learner's real (week, lesson)
  over the 16 baked lessons; finishing advances; finishing a week's last lesson clears the week.
- **Tutor-led opening** — the tutor opens each lesson itself through the harness + web-llm,
  grounded in that lesson and greeting the learner by name (no hardcoded dialogue).
- **Real code loop** — Pyodide runs the learner's actual code; the tutor reacts to the *real*
  output or traceback through the harness (no canned reply).
- **Reopen completed lessons** for review without corrupting progress.
- **Fresh-signup fixes** — a new account genuinely starts at Week 1 / Lesson 1 with nothing
  done (previously it faked a returning user at Level 2 with everything cleared); the climb's
  green trail aligns to the real level; the sidebar shows the real name.
- **Promoted the 67% autoresearch policy** into the shipped tutor.

Definition of done here is **operating the deployed app in a real browser**, not "tests pass."

## What we have

- Live app (Vercel, auto-deploy from `main`), public repo, 37 passing tests, clean typecheck + lint.
- The autoresearch loop runnable on a Mac (`run-mac-hybrid.sh`); `loop-state.json` holds the best policy.
- Stack: React 19 + Vite + TypeScript (strict), the harness, Pyodide, baked JSON. No per-user backend.

## What's left

- **Slice 4** — the Lesson 0 interview writes to the learner's memory (name/goal persisted, so
  the tutor and UI greet the learner by their real name on every reload).
- **Slice 5** — remove the remaining mock provider and the arrow-key "slideshow" navigation;
  confirm the real web-llm provider is threaded end-to-end.
- Bake PY101 weeks 3–4 (only weeks 1–2 are baked today).

## How to work in this repo (Fable 5 notes)

- **Conventions are non-negotiable:** `docs/context/CONVENTIONS.md`. No comments in code. No `any`.
  Small, single-responsibility files. Constants over magic values. Match the existing structure.
- **Build/deploy loop:** develop in a VM checkout, run `tsc --noEmit` + `vitest` + `vite build`,
  then push — Vercel deploys `main` automatically. Verify the deployed URL live.
- **WebGPU reality:** the real Qwen model only runs on Chrome/Edge with WebGPU. Headless/CI and
  unsupported browsers fall back to `OfflineTutorProvider`, which is grounded but deterministic —
  so verify model-specific behavior on a real GPU browser.
- **Don't over-build.** Do the simplest thing that satisfies the slice; the tutor policy is data
  (`tutor-policy.json`), so improve teaching by re-running autoresearch, not by hardcoding rules.
- When you have enough to act, act; verify against real tool results before reporting progress.
