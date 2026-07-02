# Open Maestro — Tutor Harness Spec (ITS pipeline)

Golden rule: don't build 8 agents at once. Build the *pipeline* first, then drop in ONE agent per slice. Every slice ships, every slice is testable, the tutor never breaks.

## 1. Shape: a turn becomes a pipeline
Reshape "prompt → model → reply" into 4 jobs — Sense → Decide → Verify → Remember — with ONE orchestrator that wires everything. Agents never call each other; only the orchestrator wires them.

```ts
// harness/orchestrator.ts — the ONE place that wires agents
export async function handleTurn(input: TurnInput, deps: HarnessDeps) {
  const { userMessage, session } = input;
  // 1) SENSE — cheap, before the reply
  const affect        = deps.affectObserver(userMessage, session.history);
  const mastery       = deps.masteryTracer(session);
  const misconception = deps.misconceptionDiagnoser(userMessage, session.lesson);
  // 2) DECIDE — deterministic BRAIN (pick the teaching move)
  const move = deps.controller({ session, affect, mastery, misconception });
  // 3) GENERATE — the ONE main LLM call, streamed
  const ctx   = buildContext({ session, move, misconception });
  const draft = await deps.tutor.stream(ctx, input.onToken);
  // 4) VERIFY — post-draft guards (cheap first)
  deps.answerLeakGuard(draft, session.mode, session.lesson.answer);
  deps.groundingGuard(draft, session.lesson.chunks);
  // 5) REMEMBER — async, NEVER blocks the reply
  queueMicrotask(() => deps.memoryCurator(session));
}
```

Plain: sense the student → decide the move → generate → double-check → remember (background).

## 2. Contracts (zod = source of truth)
AffectSignal { state: engaged|confused|frustrated|bored|confident, confidence 0..1, cues[] }
MasterySignal { skills: [{ id, status: unseen|shaky|mastered }] }
MisconceptionSignal { matched, id?, remediation? }
TeachingMove { action: explain|hint|advance|quiz|encourage|close, rules[], reason }
LearnerProfile { name?, goal?, preferences[], wins[], struggles[] }

## 3. File structure
```
frontend/src/harness/
  orchestrator.ts     // handleTurn — wires all agents
  types.ts            // zod schemas
  buildContext.ts     // assembles final prompt (rules + grounding + memory + move)
  constants.ts        // thresholds, rule strings — no magic values
  sense/ affectObserver.ts  masteryTracer.ts  misconceptionDiagnoser.ts
  decide/ controller.ts (BRAIN, deterministic state machine)  playbooks.ts
  verify/ answerLeakGuard.ts  groundingGuard.ts
  remember/ memoryCurator.ts
backend/harness/ failureMiner.ts  // offline red-teamer → feeds autoresearch
```

## 4. Agile slices (build in order)
- Slice 0 — Pipeline skeleton. Refactor current turn into handleTurn with pass-through agents (empty signals). Done: tutor works exactly as before, now shaped as the pipeline. Zero behavior change.
- Slice 1 — Controller (the brain). Deterministic state machine: mode + lessonPlan step + mastery → TeachingMove with injected rules; ensure the lesson closes. Done: modes behave, no looping/filler, clean end. Test: multi-turn eval.
- Slice 2 — Answer-Leak Guard. In challenge/exam, ensure draft doesn't contain the solution (string/similarity to lesson.answer, tiny LLM only if borderline); regenerate stricter if it leaks. Test: reveal-answer scenario passes.
- Slice 3 — Affect Observer. Detect confused/frustrated/bored/engaged from cues (lag + signal words; tiny LLM only if ambiguous). Frustration → support/pace move before boredom.
- Slice 4 — Memory Curator (async). Extract durable facts, merge + prune into a curated LearnerProfile snapshot; localStorage; inject from turn 1.
- Slice 5 — Grounding Guard + Misconception Diagnoser. Stay on-lesson; route errors to baked remediation.
- Offline Slice — Failure-Miner (backend/): generate new bad-teaching cases beyond the seed set → feed autoresearch (keeps the "beats frontier/Maestro" number honest, no overfitting).

## 5. On-device build rules
- Deterministic-first: an agent uses an LLM call only if a cheap check (regex/heuristic/classifier) can't decide. Every on-device LLM call is felt latency.
- One main LLM call per turn (the tutor). Guards/observers cheap; escalate to a tiny LLM only when flagged.
- Memory is async — never block the reply on the Curator.
- Heavy agents live offline (backend/): Failure-Miner, blind judge, autoresearch optimizer.

VP one-liner: "I refactored the turn into an ITS-style pipeline — sense, decide, verify, remember — with a deterministic controller as the brain and cheap on-device observers, and pushed the heavy agents offline."
