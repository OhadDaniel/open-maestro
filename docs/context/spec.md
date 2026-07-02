# Open Maestro — Build Spec

> Living build contract. Tight by design: every item serves the magic moment; everything else is an explicit non-goal. Updated as the build teaches us things.
> _Status: §1 approved ✅. §2–§11 drafted for approval._

---

## 1. Mission & magic moment ✅

**Mission.** Build an open version of Maestro: a real product anyone can open with no signup, learn from, and come back to — delivering Maestro's loved core (the conversational AI tutor) **free, at unlimited scale, at ~$0 to Maestro per user**, and made **more emotionally compelling than the paid product.**

**Success bar.** (1) A stranger opens a link and completes a real Maestro lesson taught well. (2) ~$0 per user — no per-user server or LLM bill. (3) Provably handles the TutorBench-Maestro scenarios at or above frontier-model quality. (4) Feels good enough that they want the next lesson. **Real aim: show Masterschool a ceiling above their own — free can out-teach paid.**

**Magic moment.** First open → premium and *safe*, I trust it, a spark of *thrill*; I instantly understand what I'm about to do and I'm *excited to start* → learning feels warm and engaging, I'm *attached*, not lectured at → I actually *get the concept* → progress shows as *milestones* I can see → finishing is *celebrated* as an event; I leave feeling I won and want the next.

One line: **trust+thrill on open → clarity+excitement → attached learning → real mastery → visible milestones → celebrated progress → come back.**

---

## 2. MVP scope — thinnest slice, spine-first

Cut **breadth**, never the arc. Build the risky spine first, dress it right after.

**v1 — the spine (prove the hard part; placeholder UI):**
1. Enter app (plain screen).
2. One lesson: tutor teaches the concept conversationally — grounded + rule-following — *correctly*.
3. A real check-for-understanding (mastery earned).
4. A "done" state.
→ Answers the only scary question: *can a free tutor teach this well?*

**v1.1 — the shell (wrap the working spine; now premium):**
5. Premium landing + anticipation.
6. Visible roadmap / milestones.
7. Celebration / afterglow event.
8. Come-back hook.

**v2 — make it free + provable:**
9. Swap provider → on-device model (true $0).
10. Judge scoreboard: beat the frontier baseline; lock the demo number.

**Non-goals (deliberately NOT yet):** accounts / cross-device sync (progress is local); baking beyond the first course's opening lessons (the rest of the AI Engineering degree is *shown but locked*); a second degree/track (Biz = vision slide); fine-tuning/distillation (stock model only — distillation is a *pitch line*); "upload your own materials" (vision slide); Projects/Discussions/Leaderboards/Community/Shop; native mobile (responsive web only); real grading/credentials; multi-agent crew (one tutor, modes; personas are UI); in-lesson code editor unless the lesson needs it.

---

## 3. Content scope — one degree: AI Engineering

Structure clarified: **Degree → Courses (×18) → Weeks (themed) → ~15 Lessons.** A whole degree is huge, so we focus on **one: the AI Engineering degree.** The pitch writes itself — *anyone, anywhere, can become an AI engineer, free.*

- **Vision / product surface:** the full AI Engineering degree shown as the **roadmap** (courses + weeks as nodes) — communicates the journey and creates anticipation. Most nodes locked.
- **What we actually bake for the demo:** a thin slice — **one course → one week → start with one lesson** — with the pipeline + architecture able to bake the rest. Locked nodes = milestones + vision, not vaporware.
- **TutorBench fit:** the 20 cases are **10 failure modes × 2 tracks.** Covering the AI-Engineering (SWE) content lets us demonstrate **all 10 teaching-failure modes** on this degree. The Biz track → a *"generalizes to any subject"* vision slide (optional single Biz lesson if time allows).
- **v1 first course/lesson:** an intro programming course whose early lessons hit TutorBench SWE concepts (Python loops / recursion / functions). Candidate first lesson maps to a scenario (e.g. recursion → SWE-06 scaffolding gap), so the first slice is already benchmarkable.

**Lessons come from Maestro's real LMS — we do not invent content.** Exact course/lesson IDs need LMS access (login). Ohad to extract. See §11.

---

## 4. Baked content model (the heart — "bake optimization is everything")

The product's intelligence lives in **baked artifacts**, not the runtime model. Baking is **optimized against the judge**, not write-once.

**Per lesson, baked offline by Opus 4.8 → static JSON shipped with the app:**

- `source` — the real Maestro lesson **as delivered: mastery outcomes (the learning objectives) + optional `tutorInstructions` + media.** Lessons are intentionally *thin* — baking expands these objectives into the full teaching layer. (Strip regulatory/admin cruft from the production export.)
- `concept` — what's being taught; prerequisites; Bloom level.
- `explanations` — layered: ELI5 → standard → deep.
- `examples` — worked examples.
- `hintLadder` — progressive hints that *guide, never reveal*.
- `misconceptions[]` — common wrong turns + the corrective teaching move.
- `checks[]` — understanding checks: prompt + acceptance criteria + feedback (right & wrong branches).
- `pedagogyRules` — mode config (e.g. challenge mode hides answers; "one step at a time"; "acknowledge emotion first").
- `failurePlaybooks[]` — the TutorBench scenarios touching this concept + the correct teaching response (pre-solved).
- `celebration` — the afterglow reveal copy: what you can now *do*.
- `retrievalChunks[]` — chunked + embedded source, for grounding the live model.

**Baking pipeline = optimization loop:** generate → judge against scenario rubrics → tune prompts/content → regenerate → keep gains. The baked set is a *trained-by-hand artifact* — that's where we beat frontier models.

---

## 5. Architecture — $0 by construction

Two worlds: **build-time (ours, paid once)** and **ship-time (static, $0/user).**

**Build-time (offline, never touches a user):**
- **Baking pipeline** (Opus 4.8) → emits `/content/{course}/{lesson}.json` + embeddings. Reuses chat-app backend patterns (or a script).
- **Judge** (Opus-as-judge + scenario rubrics) → scores tutor outputs; powers the auto-research loop + demo scoreboard.

**Ship-time (what the user gets — static + on-device):**
- React + TS + Vite **SPA**, baked JSON content, on-device model (web-llm) loaded **lazily/opt-in**. No server. CDN/static hosting.
- **Tutor runtime (client):** controller (state machine: mode, prefs, progress) → each turn: *baked path?* serve baked (≈90%, $0, instant) : *free-form?* **grounding** (retrieve chunks) + **inject rules** → call provider → stream. **Safety net:** low-confidence/off-scope → fall back to baked or "let's look at the lesson."
- **Provider abstraction** (lifted from the chat app): swap **cloud-dev ↔ on-device web-llm ↔ BYOK** with no rewrite.

**Device ladder (graceful, never blocks first impression):** baked (floor, every device, no model) → CPU/wasm (any device, slow) → WebGPU (fast) → BYOK (power users, their key). Nothing essential depends on WebGPU.

**Reuse from the chat app:** provider abstraction, token-streaming chat UX, RAG/grounding pattern (embed → scoped vector search → only matching chunks → "I don't know"), conversation/tutor data model, chat UI. The NestJS backend → repurposed as the **offline baking pipeline.**

> **HARD RULE — `chat-mvp` is READ-ONLY.** Never edit, move, or modify anything in `/Users/ohaddaniel/FellowShipWeeks/Week2/chat-mvp`. Only *read* and *copy* the needed code into the new Open Maestro repo. All building happens in the new repo, nowhere else.

---

## 6. The tutor (agentic core, not a wrapper)

**Loop:** perceive (student turn + lesson state) → reason (what do they understand? which mode?) → decide (serve baked vs generate; which teaching move) → act (explain / hint / check / encourage) → observe (update mastery + state).

**Modes (state, not separate agents):** Explain · Practice · Challenge · Exam-prep. Mode sets which rules + baked assets are active.

**What it genuinely decides:** when to advance vs reteach; which hint level; whether a check passed; when to celebrate.

**Tools (typed, least-privilege):** `retrieve(lessonId, query)` → chunks; `getBaked(lessonId, key)` → asset; `gradeCheck(checkId, answer)` → pass/fail+feedback; `updateProgress(lessonId, state)`; `setPreference(k,v)` (e.g. name). No tool touches a server or costs per-user.

---

## 7. Context engineering & memory

Per turn, the model sees only: active lesson chunks (retrieved) + the relevant baked assets + the pedagogy rules for the current mode + short rolling history + student prefs/mastery. **Never** the whole course. Open-book, tightly scoped → small model stays correct and cheap on tokens. Memory = local progress + preferences (per device, no account).

---

## 8. Emotional / playful design — the game changer

First-class deliverable, not polish. Standard the bar is set by Phantom (premium, makes hard feel safe), Robinhood (celebrated completion), Duolingo (visible journey).

- **First impression:** instant load, premium dark theme, a "here's what you'll be able to do" hook, one confident Start that builds anticipation.
- **Learning feel:** warm tutor voice, smooth streaming, no walls of text, a sense of a companion crew, feedback every step.
- **Milestones:** visual roadmap (path of nodes), nodes light up, lightweight progress signal.
- **Afterglow:** completion is an *event* — animation + a reveal of new ability + an achievement-grade recap + the next node unlocking with anticipation.

**Timing — two halves, opposite deadlines:**
- **Bones — build NOW** (cheap now, brutal to retrofit; they shape data + structure): streaming reveal ✅, memory-aware greeting ✅, **event hooks** (`onStepComplete`, `onCheckPassed`, `onLessonComplete`, `onStreakExtended` — emit them even before anything listens), one-message-at-a-time pacing, and **layout room** (reserve space for a progress rail + a celebration surface).
- **Surface — a protected dedicated pass right after it's clickable** (this is Increment 5, *scheduled*, not "if time"): confetti, sound, spring animations, the afterglow reveal, streak visuals, premium color/type. It bolts onto the event hooks and changes *no* data contracts. You can't design "feel" against something you can't click — ship clickable + deployed first, then polish reactively. (Watch reference videos at the *top* of that pass, not before.)

---

## 9. Locked stack

- **Frontend:** React + TypeScript + Vite (harvested from chat app), responsive web.
- **Runtime AI:** web-llm (MLC) on-device; provider abstraction also supports cloud-dev + BYOK.
- **Content:** static baked JSON + embeddings, shipped with the app.
- **Build-time AI:** Opus 4.8 (baker + judge). _GLM-5.2 only if distillation ever returns._
- **Hosting:** static/CDN (Vercel — `vercel-deploy` skill available).
- **No per-user backend.** Build-time pipeline reuses NestJS patterns from the chat app.

---

## 10. Build order

`judge skeleton → bake lesson 1 → grounding → rules → spine teach (cloud-dev model)` = **v1**
`→ premium shell + celebration` = **v1.1**
`→ swap provider to on-device + harden via judge until we beat frontier` = **v2**

**The snitch (v2):** an autonomous overnight autoresearch-style loop (Karpathy's pattern, Claude-Code-driven) that tunes the baked teaching + prompts against the TutorBench judge until the free, on-device tutor beats frontier — it improves *while you sleep*. CPU-only, no GPU, runs on our constraints.
Stretch / pitch-line only: model fine-tuning + distillation (needs a GPU; not required to win).

---

## 11. Acceptance criteria, evals & open questions

**Acceptance (per MVP item):**
- Lesson teaches: a fresh user reaches the check and passes it after the tutor's guidance, with no factual errors.
- $0: a full session makes zero per-user server/LLM calls on our account (baked + on-device + BYOK only).
- Benchmark: tutor passes the rubrics for its lesson's TutorBench scenarios at ≥ frontier baseline.
- Feel: first paint is premium and instant; completion fires a celebration; next node invites.

**Evals (the judge):** for each scenario — the *should-do* (e.g. "hides the answer in challenge mode", "scaffolds step-by-step", "honors the name") and *should-NOT-do* (leaks answer, validates wrong work, tests before teaching). LLM-judge + per-scenario rubrics, pass/fail. Baseline = a frontier model's score on the same rubrics; goal = beat it with the free on-device tutor.

**Scenario set:** keep the **10 failure modes as the taxonomy**, but the given 10 are too few as a test set — **auto-generate many more instances grounded in our real PY101 lessons** (via TutorBench's 3 task types: explain / feedback / hint) for a robust eval + a credible demo number.

**Honest-comparison rules (non-negotiable — the number collapses on stage without these):**
- Run the frontier baseline on **our exact cases with our exact rubric**. Do NOT claim we "beat the public ~56%" — that figure is frontier on the 1,490-case public TutorBench, not our 20. It's *context/framing only*, never a direct comparator.
- Report **two** frontier baselines: *naked* (no lesson) and *grounded* (same lesson in context). The honest, strong claim is beating the **grounded** one.
- **Blind** the judge to which answer is ours; use a strong judge model; surface per-criterion reasoning so it's auditable live.
- **Hold out** scenarios (+ generated variations) from the tuning loop and report the **held-out** score — not the tuned-on score. Tuning until all 20 pass = memorizing the test.
- **Live proof beats slides:** (1) open the **network tab** during a lesson to show zero outgoing calls (the entire $0 thesis, proven), (2) **battle mode** — judge types a question, our tutor vs frontier side-by-side, scored live (rehearsed + scoped to the taught concept, since a small model can stumble on out-of-scope questions).

**Open questions:**
1. Exact lesson IDs from the LMS (needs login/extraction) — pick the 2 courses' specific lessons.
2. Are the 20 scenario rubrics provided, or do we author them? (Needed early for the judge.)
3. **Show me the chat-app repo** — I want to map exact reusable modules before we build (would meaningfully speed v1).
