#!/usr/bin/env bash
set -uo pipefail

if [ -z "${OPENROUTER_API_KEY:-}" ]; then
  echo "Set your key first:  export OPENROUTER_API_KEY=sk-or-v1-..."
  exit 1
fi

export TUTOR_BASE_URL="${TUTOR_BASE_URL:-http://localhost:11434/v1}"
export TUTOR_MODEL="${TUTOR_MODEL:-qwen2.5-coder:3b}"
unset LLM_BASE_URL
export BENCH_LESSON_LIMIT="${BENCH_LESSON_LIMIT:-4}"
export OPENAI_TIMEOUT_MS="${OPENAI_TIMEOUT_MS:-180000}"

cd "$(dirname "$0")/.."

echo "Pulling local tutor model (first run only)…"
ollama pull "$TUTOR_MODEL"

echo "Hybrid autoresearch — tutor=$TUTOR_MODEL (local, free) · brain=Claude via OpenRouter · lessons/run=$BENCH_LESSON_LIMIT"
echo "Ctrl-C to stop. Progress: loop/loop-state.json"

while true; do
  echo "=== $(date '+%H:%M:%S') iteration ==="
  npx tsx loop/autoresearch.ts || echo "iteration failed — retrying"
  sleep 10
done
