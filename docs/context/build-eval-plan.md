# Open Maestro — Build & Evaluate Plan (the coherent agent)

Goal: a tutor that handles a real, unpredictable student like a great human teacher — on-device, free. The harness must hold the lesson tight through ANY student behavior.

Coherence principle: **the Situation Catalog is the spine.** It is (1) the behavior spec the harness is built to satisfy, (2) the eval test suite, and (3) the target the autoresearch optimizes. Build and eval share one source of truth, so they can't drift apart.

Decisions locked: out-of-scope → answer briefly then steer back; every situation matters; eval = expanded situational rubric + blind Claude judge AND head-to-head vs the real Maestro tutor. Build slice-by-slice, tutor never breaks, but design for the full space.

---

## 1. The Situation Catalog (behavior contract)

Each row: what the student does → what a great tutor does → which agent owns it.

| # | Student situation | Desired tutor behavior | Owner |
|---|---|---|---|
| 1 | Correct, on-track answer | Affirm briefly, advance | controller: advance |
| 2 | Partial / almost right | Affirm what's right, nudge the gap | controller: hint |
| 3 | Wrong answer | Guide to the fix, never reveal it | controller: hint + answerLeakGuard |
| 4 | Wrong but confident | Name the mistake kindly + why, re-check | misconception + controller: explain |
| 5 | "I already know this" (true) | Light verify → advance/skip, no re-drill | mastery + controller: advance |
| 6 | "I already know this" (bluff) | Quick check exposes gap → teach it | mastery + misconception + controller: quiz→explain |
| 7 | "I'm lost" / doesn't understand | Re-explain simpler, smaller step, analogy | affect(confused) + controller: explain-simpler |
| 8 | Out-of-scope but Python | Brief correct answer, then steer back | groundingGuard(steer-back) + controller |
| 9 | Off-topic (non-Python) | Warm redirect, don't answer | controller: redirect |
| 10 | Wants to skip ahead | If truly ready, fast-track; else why-now + redirect | mastery + controller |
| 11 | Frustrated | Acknowledge feeling first, ease difficulty, encourage | affect(frustrated) + controller: encourage |
| 12 | Bored / disengaged / one-word | Raise relevance, concrete prompt | affect(bored) + controller: quiz/engage |
| 13 | Asks for the answer outright | Gently refuse, give the next hint | controller: hint + answerLeakGuard |
| 14 | Gibberish / empty | Gentle re-prompt | controller: re-prompt |
| 15 | "I'm tired" / wants to stop | Brief empathy, respect the decline, soft close | affect + controller: close-soft |
| 16 | Outcomes all met | Clean close, celebrate, point to next | controller: close |
| 17 | Meta: "why learn this?" | Short motivation, back to the lesson | controller: explain-brief + redirect |

This catalog grows as the failure-miner finds new cases. It is the checklist for "did we handle everything."

---

## 2. Build plan (slices — tutor always working, tests each slice)

Same pipeline as the harness spec (Sense → Decide → Verify → Remember, orchestrator-wired). Each slice adds coverage of catalog rows; nothing ships broken.

- **Slice 0 — Pipeline skeleton.** Refactor the turn into `handleTurn` with pass-through agents. Zero behavior change. Covers: nothing new; proves shape.
- **Slice 1 — Controller (brain).** Deterministic move-picker from mode + lesson step + mastery. Guarantees lessons **close**. Covers rows 1, 2, 5, 16, and the base of most others (no looping/filler). Highest leverage.
- **Slice 2 — Answer-Leak Guard.** Covers rows 3, 13 (never reveal the solution in challenge/exam).
- **Slice 3 — Affect Observer.** Covers rows 7, 11, 12, 15 (adapt to confused/frustrated/bored/tired).
- **Slice 4 — Memory Curator (async).** Personalizes every row (uses name/goal/wins/struggles). Harvests durable facts, merge + prune.
- **Slice 5 — Grounding Guard + Misconception Diagnoser.** Covers rows 4, 6, 8, 9, 17 (steer-back on out-of-scope; route errors to baked remediation).
- **Offline — Failure-Miner (backend/).** Generates NEW hard cases → grows the catalog → feeds autoresearch (anti-overfit).

Mastery signal comes from **real events** (code-runner results, check-passed, step-complete), not chat-parsing. Controller stays coarse (pick the move); the model keeps its warm voice within the guardrails. One main LLM call per turn; cheap gates before any extra call; memory async.

Parallel track — **baked-lesson quality pass:** re-bake lesson *voice* with **Fable 5** (warm, human prose) + a correctness pass over any Python. Better content raises the ceiling the harness teaches from.

---

## 3. Evaluation plan (prove it handles everything)

**Rule:** the bench runs through the **full `handleTurn` harness** on the **real Qwen model** — not `buildTutorSystemPrompt` in isolation. Otherwise we optimize/score something that isn't what ships.

Three layers:

1. **Situational bench (primary).** For each catalog row × representative lessons: a simulated-student persona whose opener + follow-ups *trigger that situation*. Run through the harness on Qwen. A **blind Claude judge** scores an **expanded rubric** = the general rubric + situation-specific criteria (e.g., row 8: "answered briefly AND returned to the lesson"; row 5: "did not re-drill known material"). Metric: **pass-rate per situation** + overall. A situation isn't "done" until its pass-rate is high and stable.

2. **Head-to-head vs real Maestro.** Run identical hard scenarios through our tutor and the real Maestro tutor; a blind judge picks the better teacher (or scores both). Metric: **win-rate vs Maestro** per situation. (Dependency: collect ~15–20 real-Maestro transcripts on the hard rows — see §6.)

3. **Failure-mining (anti-overfit).** The offline miner generates fresh bad-teaching cases beyond the seed set; new failures become new catalog rows + bench scenarios. Keeps the "beats Maestro" number honest.

Guardrails: track a **regression matrix** (situation × pass-rate) so improving one situation can't silently break another. The autoresearch loop already runs this shape (personas × lessons × rubric on Qwen + Claude); we extend its personas/rubric to the full catalog and point it at the harnessed turn.

---

## 4. The improvement loop (how it all ties)

Situation Catalog → harness handles each → situational bench scores each on the real model → **autoresearch (Claude Opus proposes) tunes the controller playbooks + policy** → keep only if the regression matrix improves → **failure-miner adds new situations** → repeat. Memory personalizes throughout; Fable-baked content raises the ceiling.

Four pillars, four axes of great teaching: baked lessons = *what*; harness = *how, every turn*; memory = *who*; autoresearch = *better forever*.

---

## 5. Have vs. need

Have: baked lessons (16), autoresearch loop (Qwen tutor + Claude researcher/judge via OpenRouter), memory profile (Hermes snapshot), a 12-persona × 13-criteria bench, provider abstraction, on-device runtime.
Need: the harness (orchestrator + controller + guards + observers + curator), the full Situation Catalog encoded as personas + rubric, the bench routed through the harness, head-to-head-vs-Maestro harness, the failure-miner, the Fable re-bake pass.

---

## 6. Sequencing & the one dependency

Order: Slice 0 → 1 → 2 (demo-worthy core; fixes the real failures) → extend the bench to the catalog in parallel → Slices 3 → 5 → failure-miner → Fable re-bake. Autoresearch keeps running throughout, retargeted at the harness once Slice 1 lands.

Dependency on you: for head-to-head, we need **real Maestro tutor transcripts** on the hard rows (I can't access Maestro). ~15–20 short exchanges covering rows like already-knows, doesn't-understand, off-topic, wrong-but-confident. You paste them; I turn them into the comparison set.
