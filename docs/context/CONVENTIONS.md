# Conventions — Open Maestro

Reverse-engineered from Ohad's `chat-mvp` (mentor **Or**'s standard) and adapted to this project's shape: a **static SPA + on-device model + offline baking pipeline, with no per-user backend.** Build new code so it is indistinguishable from `chat-mvp`.

**Golden rule:** match that codebase exactly — file naming, layer boundaries, type discipline. **No `any`.** Files stay small (~150-line soft cap; split at logical seams). Constants over magic values. One responsibility per file.

> **HARD RULE — NO COMMENTS IN CODE. None.** (Ohad's standing rule; overrides any "intent comment" guidance.) Code must be self-explanatory through naming and structure.
> **HARD RULE — `chat-mvp` is READ-ONLY.** Only read and copy from it; never edit it. Build only in `open-maestro/`.

---

## Stack (locked)
- **App:** React + TypeScript + Vite, responsive web SPA. `strict: true`.
- **Runtime AI:** swappable provider abstraction → `cloud-dev` (v1) ↔ `web-llm` on-device (v2) ↔ `BYOK`. No per-user server.
- **Code execution:** Pyodide (CPython in WASM), in-browser, on-device.
- **Content:** static baked JSON + embeddings, shipped with the app.
- **Baking pipeline + judge:** offline Node/TS scripts (Opus 4.8). The only place an expensive model runs; never per-user.
- **Hosting:** Vercel static.

---

## Frontend (mirrors chat-mvp)
- **Feature slices:** `src/features/<feature>/{api,components,context,hooks,types,utils,constants}/`. Graduate to `src/shared/` only when used by 2+ features.
- **Container / presentational split:** `XContainer.tsx` holds logic (hooks, computed props/classes) → renders pure `X.tsx` (props in, JSX out, single return, one component per file).
- **Hooks:** `hooks/use*.ts` return `{ state, handlers }`, never JSX. One responsibility; compose small hooks inside orchestrator hooks.
- **Context:** scoped to the smallest subtree; value type = `ReturnType<typeof useHook>` (never hand-typed); `useXContext()` throws outside its provider.
- **Types:** in `types/index.ts` / `*.types.ts`, never inline. Discriminated unions for variants; `as const` for enum-ish constants; reducers end with `const _exhaustive: never = action`.
- **No fetch in components:** all transport in `features/<x>/api/<x>.api.ts` over a single `src/api/client.ts`. Cross-cutting transport utils (e.g. SSE parsing) live in `src/api/`.
- **Constants:** every magic value (class strings, sizes, keys, labels) → `constants/index.ts` or `<Component>.constants.ts`. No literals in component bodies.
- **Shared primitives:** reuse `src/shared/` (inputs, buttons, modal, avatar, icons); styled via `className` prop, no context.

## AI layer
- Treat the LLM as an **untrusted function.** Keep channels separate: system / user / tool / retrieved-context.
- Grounding: retrieve scoped chunks → feed only those → cite; if nothing relevant, say so (no guessing). (Ported from chat-mvp tutor RAG.)
- Provider is swappable behind one interface; no model hard-wired in features.

## Baking pipeline / judge (offline)
- Same type discipline as the app. Pure functions where possible; deterministic outputs.
- Emits static JSON the app consumes; no runtime dependency on it.
- Layered like chat-mvp where it earns it (compose → unit) — but kept simple; it's tooling, not a server.

---

## Cross-cutting
- **No `any`.** `strict`, `noUnusedLocals/Parameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`. Generics + discriminated unions instead.
- **File length:** ~150-line soft cap; split at the natural seam.
- **`import type`** for type-only imports; group: node → third-party → local.
- **Naming:** kebab-case suffixed files (`*.types.ts`, `*.api.ts`, `use*.ts`, `XContainer.tsx`, `*.constants.ts`); PascalCase components/classes; camelCase functions/hooks.
- **Tests** co-located: `*.test.tsx` / `*.test.ts`.
- **Gate before commit:** `npx tsc --noEmit` + tests pass + lint clean.
- **Agile:** smallest coherent slice; short plain-English plan per slice → Ohad approves → build.
