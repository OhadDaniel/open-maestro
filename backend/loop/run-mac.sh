#!/usr/bin/env bash
set -uo pipefail

export LLM_BASE_URL="${LLM_BASE_URL:-http://localhost:11434/v1}"
export BENCH_LESSON_LIMIT="${BENCH_LESSON_LIMIT:-4}"
export OPENAI_TIMEOUT_MS="${OPENAI_TIMEOUT_MS:-180000}"

TUTOR="${TUTOR_MODEL:-qwen2.5-coder:3b}"
BRAIN="${STUDENT_MODEL:-qwen2.5:7b}"

cd "$(dirname "$0")/.."

echo "Pulling local models (first run only)…"
ollama pull "$TUTOR"
ollama pull "$BRAIN"

echo "Starting free local autoresearch. Tutor=$TUTOR  Brain=$BRAIN  Lessons/run=$BENCH_LESSON_LIMIT"
echo "Ctrl-C to stop. Progress: loop/loop-state.json  ·  Winner: loop/best-policy.json"

while true; do
  echo "=== $(date '+%H:%M:%S') iteration ==="
  npx tsx loop/autoresearch.ts || echo "iteration failed — retrying"
  sleep 10
done
