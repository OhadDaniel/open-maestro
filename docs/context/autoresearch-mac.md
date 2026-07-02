# Run autoresearch free on your Mac

Goal: improve the tutor for $0 by running the loop on your Mac — the tutor is the **real on-device model** (Qwen via Ollama), and the brain (student, judge, researcher) is a local model too. Nothing hits a paid API.

## One-time setup

1. **Install Ollama** (the local model runner):
   ```
   brew install ollama
   ollama serve        # leave this running in its own terminal (or it runs as a service)
   ```
2. **Get the repo on your Mac** and install deps:
   ```
   cd open-maestro/frontend && npm ci
   cd ../backend && npm ci
   ```
3. **Reset the baseline for the local model** (the stored score was from a different model):
   ```
   rm -f open-maestro/backend/loop/loop-state.json
   ```

## Run it

```
bash open-maestro/backend/loop/run-mac.sh
```

That's it. On first run it pulls two models (`qwen2.5-coder:3b` = the tutor, `qwen2.5:7b-instruct` = the brain), then loops forever:
- establishes the baseline on the real local model,
- each round: proposes a policy tweak → re-tests on our real lessons → keeps it only if the score goes up,
- writes progress to `backend/loop/loop-state.json` and the current winner to `backend/loop/best-policy.json`.

Stop anytime with Ctrl-C. It only runs while the script + Ollama are running.

## Knobs (optional env vars)

- `BENCH_LESSON_LIMIT=4` — lessons tested per round (raise for wider coverage, lower for speed).
- `STUDENT_MODEL` / `JUDGE_MODEL` / `RESEARCHER_MODEL` — bump the brain to `qwen2.5:14b-instruct` (or `qwen2.5:32b-instruct` if your Mac has the RAM) for sharper judging/proposals.
- `TUTOR_MODEL` — set to `qwen2.5-coder:7b` to test the better-device on-device model.

## Want the *best* brain (still cheap, not fully free)

Local models judge/propose fine but Claude is sharper. To keep the tutor local + free while the brain is Claude, set an OpenRouter key and use the **hybrid** mode instead of all-local:
```
export TUTOR_BASE_URL="http://localhost:11434/v1"   # tutor stays local & free
export OPENROUTER_API_KEY="sk-or-..."               # brain = Claude (Haiku judge, Fable researcher)
unset LLM_BASE_URL
npx tsx open-maestro/backend/loop/autoresearch.ts
```
Only the brain calls cost money then (cents), and the tutor — the thing being measured — is still the real free on-device model.

## Promote a winner

When `loop-state.json` shows the score climbing, tell me — I'll copy `best-policy.json` into `frontend/src/tutor/tutor-policy.json`, verify, and deploy so the improvement ships to real users.
