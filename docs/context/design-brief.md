# Open Maestro — Design Brief

Purpose: the single source of truth for designing Open Maestro's screens. Paste this into Claude design (with the ui-ux-pro-max skill) and mock each screen to the system below. Every token, font, and component here maps 1:1 to the real React app, so approved mockups port back with no rework.

---

## 1. Product & emotional north star

Open Maestro is an accredited-style **AI-Engineering degree, free forever**, taught by an AI tutor that runs **on the learner's own device** (zero cost, fully private).

North-star feeling: **safe + trust + thrill.** The magic moment: *"I opened it, it feels premium and it's mine — and I'm already learning."*

Design is the differentiator here. The product must feel top-tier from the first frame.

---

## 2. Reference aesthetic (locked)

- **Exebenus (Stuck Pipe Agent)** — calm, dark, *trustworthy* premium; proof-as-hero (metric tables, "explainable"), cinematic video moments. → our credibility layer ($0 + a tutor that scored 100%).
- **EverSwap** — scroll-choreographed reveals, a live progress %, bold display type, and it literally uses a *climb-to-the-summit* metaphor. → validates our mountain homepage.
- **anime.js** — the motion quality bar: timeline orchestration, staggering, springs, SVG line-draw & motion-path.

Net vibe: **cinema-dark premium, kinetic but restrained, emotionally warm.**

---

## 2b. Brand identity & logo — use it, don't go generic

**Source of truth: the Maestro Design System** (in Claude design). Its Brand statement, Buttons, Cards, Corner radii, Gradients, Imagery — painterly, Logo, Marketing UI kit, and brand fonts are authoritative for all brand visuals. Where §3's tokens/fonts below differ, the Design System wins — treat §3 as a fallback to reconcile with the real Maestro tokens (including Maestro's actual brand fonts, not the substitute web fonts).

**This must look unmistakably Maestro — NOT the generic Claude-design default.** Do not fall back to Anthropic Sans, flat white cards, neutral-gray components, emoji-as-icons, or the "blends into claude.ai" look. Commit fully to the identity below on every screen.

**The logo:** the Maestro **shield mark** (a shield containing a checkerboard motif) plus the **"maestro" wordmark** — from the Design System's "Logo — primary." Four variants: wordmark and mark, each in **light and dark**. Use the light variant on dark backgrounds, the dark on light. It is monochrome, which suits the black-&-white-forward base. Note: the repo's current `favicon.svg` is a WRONG placeholder (purple lightning bolt) and must be replaced with the real mark at build time.

Where the logo belongs:

- **App header** (Home, Week, Lesson) — mark top-left, paired with the "Open Maestro" wordmark in Space Grotesk.
- **Welcome (Screen 1)** — the mark enlarged above the headline; animate it in (line-draw / glow-on).
- **Tutor download (Screen 4)** — the mark *is* the tutor orb: it pulses and "charges" as the model downloads. The logo becomes the loading animation.
- **Celebration (Screen 5)** — the mark inside the confetti burst.
- **Favicon / browser tab** (done) and any splash/loading state.

Logo rules: clear space ≥ 1× the mark's height; min size ~20px; pick the light or dark variant for contrast; never stretch, arbitrarily rotate, recolor, or add effects; keep it off busy backgrounds. Follow the Design System's logo usage where it's more specific.

**Wordmark:** use the Maestro wordmark from the Design System. For the product name, pair the Maestro mark with "Open Maestro" — mark + Maestro wordmark, "Open" set in the brand heading font.

---

## 3. Visual system (exact tokens — already in the app)

**Palette direction — black & white forward.** The base is monochrome: near-black backgrounds, white / off-white text, neutral grays for hierarchy. Color is *punctuation, not decoration* — Maestro's brand accents appear only on the things that matter (current position, primary CTA, progress fill, celebration, live/streaming states). Think editorial + one confident accent, not a colorful UI. Drop in Maestro's exact accent hex from the design system you have; the `--accent` purple below is a stand-in and can be swapped for Maestro's brand color.

Colors:

- `--bg-deep: #050507` · `--bg: #0a0a0f` · `--surface: #14141c` · `--surface-glass: rgba(255,255,255,0.05)`
- `--text: #ededf1` · `--text-dim: #8a8f98`
- `--accent: #7c5cff` (brand purple) · `--accent-soft: rgba(124,92,255,0.16)` · `--accent-glow: rgba(124,92,255,0.28)`
- `--line: rgba(255,255,255,0.08)` (hairline borders)
- Secondary glows / celebration only: indigo `#6366f1`, pink `#ec4899`, cyan `#22d3ee`, gold `#f5c542`

Shape & motion tokens:

- Radius: `16px` (cards `24px`) · Easing: `cubic-bezier(0.16, 1, 0.3, 1)`
- Never pure black. Background = deep gradient + two ambient radial glows (top-left purple, top-right indigo).
- Surfaces = **frosted glass**: `background: var(--surface-glass)` + `backdrop-filter: blur(16px)` + hairline border + subtle inset top highlight.
- Primary CTA carries a soft accent glow (`box-shadow: 0 0 24px var(--accent-glow)`), lifts on hover.

Type:

- **Space Grotesk** — display & headings (600–700, tight letter-spacing).
- **DM Sans** — body & UI (400–500).
- Sentence case. No ALL CAPS except tiny eyebrow/badge labels.

---

## 4. Motion system (anime.js v4, modular)

Adopt anime.js (lightweight, tree-shakeable ~10–15 KB for our parts). Map moments → techniques:

- **Entrances** — timeline + `stagger` (rise + fade: translateY 14→0, opacity 0→1, 40–80 ms stagger).
- **Selects / reveals** — `createSpring` (degree card commit, code panel open).
- **Mountain trail + climber** — SVG `createDrawable` (draw the trail) + `createMotionPath` (move the climber along it).
- **Homepage reveals** — Scroll Observer.
- **Milestones** — existing canvas confetti (`Confetti.tsx`) + glow pulse.

Principle: motion serves emotion, never noise. Always honor `prefers-reduced-motion` (snap to final state).

**Interactive touchpoints — animate these:**

- **Screen transitions** (into course → week → lesson): slide / shared-element, never hard cuts.
- **Course card:** hover lift; tap → expands into the Week view.
- **Week accordion:** spring open/close; lessons stagger in.
- **Lesson node / row:** hover glow; current one pulses; on complete a checkmark draws in.
- **Progress bar / ring:** segment fills with a spring + glow on each gain.
- **Buttons:** press scale ~0.97; primary lifts + glow on hover.
- **Chat:** each message rises in; streaming caret; "step locked in" pop.
- **Code panel:** spring reveal; run → output fade-in; success flash.
- **Summit map:** trail line-draws + climber travels its motion-path on load; parallax on scroll.
- **Milestones:** confetti burst + afterglow.

---

## 5. The flow

**First-time user:** Onboarding journey → celebration → Homepage (summit map).

**Returning user (already signed up):** straight to Homepage → tap the course you're on → **Week view** (auto-opens to your current week) → tap your current lesson → Lesson. Always one tap to resume.

**After a lesson:** celebration → back to the summit with progress advanced.

---

## 6. Screens to mock

For each: **Beat** (the feeling), **Layout**, **Interaction + motion**, **Data**, **States**, **Copy**.

### Screen 1 — First impression (welcome)
- **Beat:** safe + thrill, in one breath.
- **Layout:** centered frosted hero; "Open Maestro" badge; huge Space Grotesk headline; one subline; one primary CTA "Begin". Ambient glows drifting.
- **Motion:** timeline entrance — badge → headline (stagger by word) → subline → CTA; slow glow drift loop.
- **Data:** none.
- **States:** default; WebGPU-unsupported note (Chrome/Edge desktop).
- **Copy:** H: "Become an AI engineer." Sub: "A full degree. Free forever. Taught by a tutor that lives on your device." CTA: "Begin".

### Screen 2 — Your name & email (the important capture)
- **Beat:** this is *yours* — make it feel like being greeted, not filling a form.
- **Layout:** frosted card, one field visible at a time (name, then email), big friendly inputs, progress dots showing the journey.
- **Interaction + motion:** field slides in on `Enter`/Next with spring; validation is gentle inline; the tutor's voice frames each ask.
- **Data:** name + email saved locally (no password, no server). Email is the one thing we keep.
- **States:** empty, typing, invalid email, done.
- **Copy:** "First — what should your tutor call you?" → "Where do we send your milestones? (just your email)". Reassurance chip: "No spam. Your learning stays on your device."

### Screen 3 — Choose & commit your degree
- **Beat:** identity + commitment.
- **Layout:** 1–3 degree cards; "AI Engineering" active, others "Coming soon" (locked, dimmed). Selected card lifts and glows; a confirm bar appears.
- **Motion:** card hover tilt/scale spring; on select, card blooms + others recede; "Start this degree" confirm.
- **Data:** chosen degree id (local).
- **States:** none selected, hover, selected/committed, locked card.
- **Copy:** "Choose your path." Card: "AI Engineering — from your first line of Python to shipping AI." Locked: "Data Science · coming soon".

### Screen 4 — Meet + download your tutor (the thrill)
- **Beat:** anticipation — a living thing is being born for you.
- **Layout:** centered; a progress **ring** (or slim bar) with a large %; a single line of copy that **changes as the % climbs**; a soft pulsing orb = the tutor waking up.
- **Interaction + motion:** ring fills with the real download progress; copy crossfades at thresholds; orb pulse speeds up near 100%; at 100% → transition to Screen 5.
- **Data:** real web-llm download progress (0→1).
- **States:** starting, downloading (with %), finalizing, unsupported/fallback.
- **Copy (crossfades):** 0–25% "Waking your tutor…" · 25–55% "Teaching it Python…" · 55–85% "Giving it patience and warmth…" · 85–99% "Almost yours…" · 100% "Meet your tutor."

### Screen 5 — Journey-start celebration
- **Beat:** payoff — the summit is now in view.
- **Layout:** full-bleed moment; confetti; "Your journey begins, {name}" in display type; a single CTA that transitions into the homepage summit.
- **Motion:** confetti burst + headline rise + glow swell; then camera-like push into the mountain.
- **Data:** name.
- **Copy:** "Your journey begins, {name}." CTA: "See the climb →".

### Screen 6 — Homepage: the summit map
- **Beat:** "here's how far I've come, here's the peak."
- **Layout:** a vertical/diagonal **mountain trail**; nodes = lessons/weeks; **climber avatar** at current position, glowing; completed nodes behind (lit), locked ahead (dim). A "current course" panel; tap → shows current lesson → "Continue".
- **Interaction + motion:** on load, trail draws in (SVG line-draw) and climber travels to current node (motion-path); parallax layers on scroll; current node pulses.
- **Data:** course catalog + per-lesson completion (local progress); current lesson pointer.
- **States:** fresh (climber at base), mid-progress, week complete (flag planted), all complete.
- **Copy:** "You're on Week 1 · Lesson 3." Node tooltip: lesson title + status. CTA: "Continue climbing".

### Screen 6b — Week view (course → weeks → lessons)
- **Beat:** "I can see the whole course, and exactly where I am."
- **Layout:** the chosen course opened as a list/accordion of **weeks**; the current week auto-expanded and scrolled into view; its **lessons** shown as rows — current lesson highlighted with "Continue", done lessons checked, locked ones dim.
- **Interaction + motion:** weeks accordion open/close (height spring); on entry auto-open the current week and stagger its lessons in; current lesson pulses; back-to-summit control.
- **Data:** course structure (weeks → lessons) + per-lesson completion + current-lesson pointer.
- **States:** fresh, mid-week, week complete (flag/checkmark), course complete.
- **Copy:** header "AI Engineering · Week 1". Lesson row: title + status. CTA on current: "Continue".

### Screen 7 — Lesson shell + top progress bar
- **Beat:** momentum you can *see*.
- **Layout:** header with lesson title + a **segmented progress bar** up front (one segment per mastery outcome, filling as you go). Below: the tutor chat. Persistent, calm.
- **Interaction + motion:** a segment fills with a spring + soft glow when an outcome is completed; streak indicator.
- **Data:** baked lesson mastery outcomes; completed-step count; chat messages (streaming).
- **States:** greeting, streaming reply, step complete, all steps done → "Next lesson".
- **Copy:** progress label "3 of 6 mastered". Step-complete: "Locked in."

### Screen 8 — Code panel reveal
- **Beat:** a tool unlocks — satisfying, pro.
- **Layout:** within the lesson, a code editor + Run/Submit; output area. Hidden until the tutor invites coding, then it springs open.
- **Interaction + motion:** panel expands (height + opacity spring), editor focuses; Run shows output; Submit disabled until Run has produced output.
- **Data:** Pyodide (in-browser Python) run result.
- **States:** collapsed, revealed, running, output shown, error/traceback.
- **Copy:** toolbar "Python · runs in your browser". Empty output: "Run it to see what happens".

### Supporting states (mock lightly)
Loading, empty, error, offline, and the lesson-complete afterglow (partly built).

---

## 7. Copy voice

Warm, confident, concise, a little thrilling. Second person. Short lines. Never corporate. A sentence should feel like a good tutor talking, not a marketing page.

---

## 8. Reusable components (design once, reuse everywhere)

Primary (glow) button · ghost button · frosted card · badge/eyebrow pill · trust chip · **segmented progress bar** · **progress ring** · degree card · **lesson node + trail** · **climber avatar** · chat bubble (tutor/student) · code panel · confetti burst.

---

## 9. How mockups map to real code

- Screens 1–5 → `features/onboarding/` (extend `Onboarding.tsx`; add steps + `onboarding.constants.ts` copy).
- Screen 6 → new `features/home/` (SummitMap) fed by `content/py101-catalog` + local progress.
- Screen 7 → `features/lesson/` (`LessonView` + a new `ProgressBar`).
- Screen 8 → `features/code/` (`CodeRunner`) + reveal wrapper.
- Milestones → `features/celebration/Confetti.tsx` (built).
- Everything uses the CSS variables in §3 — never hardcode hex.

---

## 10. Priority for the July 5 demo

Demo path a judge walks (build these to "top-tier basic"): **1 → 2 → 4 → 5 → 6 → 6b → 7 → 8.**
Returning-user resume path (Home → course → week → lesson) must feel one-tap and fully animated.
High-emotion, include if time: **3 (choose degree).**
"Keep developing" layer (after): deeper parallax, sound, haptics, more degrees, richer states.

---

## 11. Hard constraints (design within these)

- **$0 & on-device:** no per-user server, no cloud LLM. Onboarding is accountless (name + email stored locally, no password).
- **WebGPU:** tutor needs Chrome/Edge on desktop — design a graceful unsupported state.
- **Light first paint:** the model is a lazy download (Screen 4) — the app must feel instant before it.
- **Accessibility:** contrast ≥ AA on dark, full keyboard path, and `prefers-reduced-motion` fallbacks for every animation.
