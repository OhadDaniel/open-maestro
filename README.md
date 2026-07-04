# Open Maestro

**A world-class AI tutor that runs entirely in your browser — free, private, $0 per student.**

🔗 **Live:** [open-maestro.vercel.app](https://open-maestro.vercel.app) · Chrome/Edge with WebGPU

> You just watched a free model in your browser teach a real Python lesson, react to real code output, and close with a celebration — no server, no API bill.

---

## The idea

Great tutoring is expensive because frontier-LLM inference is charged per student, per session. Open Maestro inverts that: **expensive intelligence is spent offline, once — never per learner.**

- **Claude Fable 5** writes the lessons and designs the teaching playbook at build time.
- A **small free model (Qwen3-4B)** delivers them on-device via WebGPU.
- An **autoresearch loop** keeps improving the playbook every night — without ever touching a learner's device or bill.

Cost lives at build time. Marginal cost per student: **zero.** Nothing leaves the device.

## Three model roles

| Role | Model | When it runs | Cost |
|---|---|---|---|
| **Runtime tutor** | Qwen3-4B (`@mlc-ai/web-llm`, WebGPU) | In the learner's browser | $0 |
| **Lesson baking** | Claude Fable 5 | Build time, once | ~$ per course |
| **Autoresearch** | Fable 5 (researcher) + Haiku 4.5 (blind judge) + GPT-4o-mini (student sim) | Overnight, offline | ~$ per run |

The learner's Python runs in-browser too (**Pyodide** — CPython in WASM). Offline-capable, fully private.

## The harness: a deterministic teaching agent

The small model is never asked to make judgment calls it can't handle. Every turn runs a pipeline:

```
Sense  →  Decide  →  Generate  →  Verify  →  Remember
```

- **Sense** — affect (frustrated/confident/confused), per-outcome mastery, misconceptions. Mastery is detected from **real code runs**, not model opinion.
- **Decide** — a deterministic controller picks exactly one teaching move (explain / hint / advance / celebrate / offer-wrap / wrap-lesson). Lesson progression and closure are **owned by code**, not the model.
- **Generate** — one grounded model call: baked lesson chunks + evolved policy + learner memory + the chosen move.
- **Verify** — grounding guard, repetition guard, output-hallucination guard (the tutor may never describe code output it hasn't seen).
- **Remember** — learner profile (name, goal) persists; the first lesson ends with the student's own code printing **their own dream**, and the next lesson greets them with it.

Predictable moments (lesson openings, the interview, wrap celebrations) are **authored content delivered verbatim** — scripted spine, improvised middle. Small models are great mimics and poor composers, so we bake dialogue exemplars for them to imitate.

## Autoresearch: measured self-improvement

A `propose → test → keep` loop evolves the tutor's system prompt. Each candidate is scored over **48 simulated conversations** (12 student personas × 4 lessons) against a **13-criterion pedagogy rubric** by a blind judge — 624 checks per score.

**Result: 55% → 69% teaching quality, overnight, with zero model-weight changes.**

State and receipts: `backend/loop/loop-state.json`.

## Repo map

```
frontend/            React 19 + TS (strict) + Vite
  src/harness/       Sense → Decide → Generate → Verify → Remember
  src/tutor/         tutor-policy.json (the evolved playbook) + session state
  src/ai/            WebLlmProvider / OfflineTutorProvider, think-tag stripping
  src/memory/        learner profile (name, goal) persistence
  public/content/    16 baked lessons (PY101 weeks 1–2)
backend/
  bake/              Fable 5 lesson baking (openings, bridges, exemplars, checks)
  loop/              autoresearch: run-mac-hybrid.sh, loop-state.json
  eval/              judge + persona simulation clients
```

## Run it locally

```bash
cd frontend
npm install
npm run dev          # Chrome/Edge with WebGPU; no WebGPU → deterministic offline tutor
```

Tests and gates:

```bash
npx tsc --noEmit && npx vitest run && npm run build   # 145 tests
```

Re-run autoresearch (needs Ollama + an OpenRouter key):

```bash
export OPENROUTER_API_KEY=...
bash backend/loop/run-mac-hybrid.sh
```

Re-bake lessons (Fable 5 via OpenRouter):

```bash
npx tsx backend/bake/run-bake.ts --force
```

## Roadmap

- Per-lesson simulation testing at bake time (rehearse every lesson against 12 personas before a human sees it)
- checks[]-rubric mastery beyond run heuristics
- Learning-style memory: struggles, wins, pace
- LoRA fine-tune of the on-device model on judge-filtered dialogues

The gap to expensive cloud tutors shrinks every night — by design.

---

Built during the Masterschool hackathon (July 2026) by **Ohad Daniel**, with Claude Fable 5 (planning, content, diagnosis), Claude Opus 4.8 in Claude Code (engineering agent), Claude Haiku 4.5 (blind judge), and GPT-4o-mini (student simulation).
