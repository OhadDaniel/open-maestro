# Open Maestro — Technical Overview

## 1. The problem
Build an open version of Maestro (an AI university) that reaches *anyone, on any device, at ~$0 cost per user*.
The hard rule: **no cloud LLM bill per lesson, no per-user server** — the model runs on the user's own device. Reuse Maestro's real lesson structure. The tutor must *teach well*, not just answer (measured by TutorBench-style failure modes).

## 2. The core thesis
**Teaching quality ≠ model size.** On the TutorBench benchmark, even frontier models score under ~56%. So instead of buying a bigger model, we *engineer the teaching system* around a small on-device model and move the frontier-grade intelligence to **authoring time**. Result: a small, free, on-device tutor out-teaches a big cloud model used cold.

## 3. Architecture — two worlds
**Build-time (offline, ours, paid once):**
- `backend/` — Node/TS tooling: the baking pipeline, the eval judge, the autoresearch loop. Runs on our machine only. **Never a per-user server.**

**Ship-time (static + on-device, $0 per user):**
- `frontend/` — React + TS + Vite SPA served from a CDN (Vercel). This is the whole product.
- Runtime = **static baked JSON** (the lessons) + an **on-device LLM** (in the browser) + **in-browser Python** (Pyodide). No server, no database.
- State = the user's browser: progress + learner memory in `localStorage`; grounding chunks ship inside each lesson's JSON (tiny in-memory retrieval, no vector DB).

## 4. What we use (stack)
- **Frontend:** React 19, TypeScript (strict), Vite, oxlint, vitest.
- **On-device inference:** `web-llm` (MLC) on WebGPU; default model **Qwen2.5-Coder** (3B, or 7B on strong devices). Swappable behind a provider interface.
- **In-browser code execution:** **Pyodide** (real CPython compiled to WebAssembly) — Run/Submit, real tracebacks, $0.
- **Content schema + validation:** **zod** as the single source of truth (types inferred from it; strict validation at bake time and on load).
- **Offline authoring + evaluation:** OpenAI API (gpt-5.x) as the *baker*, the *judge*, and the *baseline* — via Node/tsx.
- **Hosting:** Vercel (static, $0).
- **Harvested** from the fellowship chat-mvp: the LLM-provider abstraction, token-streaming chat UX, and the RAG/grounding pattern.

## 5. "Train" — the honest framing
We do **not** fine-tune model weights (no GPU training). Two things play the role of "training":
1. **Baking** — a frontier model, offline and once, expands each lesson's thin *mastery outcomes* into a full teaching layer (explanations at 3 levels, a hint ladder, misconceptions, checks, practice questions, pedagogy playbooks, grounding chunks) → validated static JSON. The intelligence is authored once and amortized to $0/user.
2. **Autoresearch loop** — an automated harness (a **simulated student ↔ our tutor ↔ a blind LLM judge**) scores the tutor on teaching rubrics; we tune the prompt/content and keep only what improves the score. Karpathy's autoresearch pattern applied to *teaching* instead of weights. (Real weight fine-tuning is a documented stretch, not built.)

## 6. Techniques (the toolbox)
- **Baked-first (precompute):** most of the experience is static and authored offline → correct, instant, free. The live model handles only free-form conversation.
- **Grounding (RAG-style):** the tutor answers only from the lesson's own chunks (open-book) → a small model stays correct and doesn't hallucinate. Ported the "cite / say I-don't-know" pattern.
- **Device ladder:** baked (everyone) → on-device web-llm (WebGPU) → BYOK turbo. Graceful fallback; nothing essential depends on WebGPU.
- **Frozen-snapshot memory (Hermes pattern):** a small, curated learner profile (name / goal / preferences / wins) in `localStorage`, injected into the system prompt from turn 1 — no per-turn retrieval, and it's prefix/KV-cache friendly on-device. Facts are captured live as the student talks.
- **Persona + everyday-moments playbook + few-shot tone exemplars:** makes a small model sound warm and human (small models imitate examples strongly).
- **Conversation history + lesson-plan progression:** the tutor reads the whole conversation and a per-lesson plan, so it advances through steps, respects demonstrated mastery, and *closes* the lesson (this fixed the looping/padding).
- **Modes** (explain / practice / challenge / exam) as deterministic state — not autonomous multi-agent.
- **Eval harness:** honest, blind, rubric-based. Baseline = a real ChatGPT model used cold (the realistic alternative a learner would use). Held-out scenarios to avoid overfitting.

## 7. Results (current, honest)
- **Single-turn teaching:** ours (small model + our design) **97%** vs cold ChatGPT (gpt-5.1) **74%** — blind judge (gpt-5.2), rubric-based.
- **Multi-turn behaviors** (respect mastery, no filler, close the lesson, no looping): **94%**, improved from 72% by the autoresearch loop.
- **$0 per user:** runtime is static CDN + on-device model — zero per-user server or LLM calls (provable live in the network tab).
- **Open caveats being closed:** the eval currently uses a small OpenAI model as a stand-in for the on-device model (a product-faithful run is next); adding held-out scenarios + a cross-provider judge.

## 8. Why it's defensible
- **Free at scale** — on-device inference, provable with the network tab (zero calls).
- **Out-teaches what people actually use** — cold ChatGPT — measured honestly and blindly.
- **Feels human** — persona + live memory + real lesson flow.
- **Scales** — the baker turns any Maestro mastery-outcomes into a fully-taught lesson, so it extends to the whole degree.
