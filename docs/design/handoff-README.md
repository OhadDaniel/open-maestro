# Handoff: Open Maestro — On-Device AI-Engineering Degree (Web App)

## Overview

Open Maestro is a free, accredited, self-paced AI-engineering degree taught end-to-end by an AI tutor that runs **on the student's device**. The product's emotional thesis: *safety + trust + thrill*. The magic moment: "I opened it, it feels premium and it's mine, and I'm already learning."

The experience is built on two metaphors that must survive implementation:

1. **The climb** — the degree is a mountain. Levels are camps, weeks are pitches, lessons are steps. Black-&-white painterly climber photography melts into a near-black UI.
2. **The living tutor** — the Maestro shield-mark is a presence (breathing glow, cursor-lean, typing, memory), never a mascot.

## About the Design Files

The files in this bundle are **design references created in HTML** — a working prototype showing intended look, motion, and behavior. They are NOT production code to copy directly. Your task is to **recreate these designs in the target codebase's environment** (React + Tailwind + shadcn/ui per the Maestro design system, or whatever stack the team uses), following its established patterns. `Open Maestro.dc.html` runs on a prototype runtime (`support.js`, auto-generated); treat the markup, inline styles, and the logic class inside it as the spec, not as shippable modules.

- Motion in the prototype uses **anime.js**; the Maestro design system prescribes **framer-motion** for component motion in production. Map timings/easings 1:1.
- The prototype wraps every screen in a fake browser chrome (traffic lights + URL pill) for presentation; do not build that.
- Prototype-only UI: the top toolbar, bottom nav pill, "All screens" overview, and A/B variant toggles are review tooling, not product.

## Fidelity

**High-fidelity.** Colors, type, spacing, radii, copy, and motion timings are final design intent. Recreate pixel-perfectly using the design-system tokens listed below. The A/B variants (Welcome, Celebration, Home) are alternates pending a product decision — implement the chosen one, keep the other behind a flag if cheap.

## Flows

- **First-time**: 01 Welcome → 02 Name+email → 03 Choose degree → 04 Tutor download → 05 Journey celebration → 06 Lesson 0 ("Getting to know you") → 07 Home.
- **Returning**: 07 Home (summit map) → 08 Week view (auto-opens current week) → 09 Lesson (tutor chat) → 10 Code panel → 11 Lesson complete (modest) → 12 Week cleared (big) → back to 08/07.
- Continuous-zoom navigation pairs: Home→Week and Week→Lesson zoom IN (origin at the tapped element); reverse navigation zooms OUT. Everything else cross-fades.

## Screens

All screens are dark (`#000` cinematic base; app surfaces per tokens). Design canvas: 1240×760 content area (16:10-ish desktop web).

### 01 · Welcome (two variants)
- **A — editorial left**: full-bleed basecamp image (`assets/climb-1-basecamp.png`, object-position 64% 42%), black gradient melts image into UI on the left. Left column (x≈92px, width 600): 66px logo-mark with breathing lavender glow, kicker "Accredited · Free · On-device" (12px, tracking .22em), H1 62px/1.04 "Your AI engineering degree starts here.", sub 19px `fg-2`, CTA row: primary pill "Begin" (56px tall, evergreen `#CEF585`, dark ink) + ghost "Sign in".
- **B — cinematic centered (preferred by client)**: summit image (`climb-5-summit.png`), radial scrim. Centered: 96px orb with breathing glow + static hairline ring + **rotating 1px lavender arc** (conic-gradient ring, 22s linear infinite), hairline-flanked kicker "The first AI-native university", **76px two-line masked headline** — each line rises from an overflow-hidden wrapper (translateY 115%→0, 780ms, easeOutQuint, 130ms stagger); line 2 "all the way up." carries a one-time gradient shimmer (off-white→lavender→lime→off-white, background-clip:text, 3s, starts at 1.1s). CTA "Begin the climb" is **magnetic** (leans toward cursor up to ±12px, spring back on leave). Editorial corners: top-left wordmark (20px tall); bottom-left "EST. 2026 · MAESTRO UNIVERSITY", bottom-right "FREE · NO CREDIT CARD · WORKS OFFLINE" (11px, tracking .18em, uppercase, `fg-3`). 9 dust motes (2–4px, ~.12–.32 alpha) drift slowly upward. Cursor parallax: image translates −13x/−9y px, orb +8x/+6y (lerp .09).

### 02 · Your account ("greeted, not a form")
- Left column (x≈96, w 556): step dots (1 of 3), 48px mark + "Hi — I'm Maestro, your tutor." speech, two underline-only inputs (no boxes): "What should I call you?" (36px display font input) and "Where should I save your progress?" (28px). Border-bottom 2px `border-strong` → accent on focus; caret accent. Typing a name reveals live echo "Nice to meet you, {first}." CTA "Continue". Trust line: lock icon + "Everything stays on your device. We'll never share it."
- Right 62%: climber image (`climb-account.png`) with slow Ken-Burns drift (17s alternate), 5 accent waypoint dots pulse up the ridge in sequence (walking cadence, 240ms stagger, loop).

### 03 · Your degree
- Left (w 540): step dots (2 of 3), eyebrow "ASSOCIATE OF APPLIED SCIENCE", H1 58px "AI Engineering", chips: lavender-tinted "Accredited" (shield-tick), neutral "60 credits", "Self-paced". Body 17px.
- Right: "Pick your focus" + 3 selectable track cards (Applied Machine Learning — selected default; LLMs & Generative AI; ML Systems & Infrastructure). Card: 16px radius, icon tile 46px, title 17px/600, sub 13px; selected = 1.5px accent border + `rgba(206,245,133,.07)` fill + soft glow + filled check; unselected = 1px `border` + hollow ring. Selection animates scale .985→1 (easeOutBack 280ms). CTA "Commit to this degree". Footnote "This becomes your path. Your tutor is tailored to your focus."
- Backdrop right 54%: `climb-peakface.png` at .3 opacity (climber facing the huge peak = commitment).

### 04 · Download tutor (signature moment)
- Pure black radial stage. Step dots (3 of 3) + "BRINGING YOUR TUTOR TO YOUR DEVICE".
- **Charging orb**: 264px — 6px track ring (`n300`) + accent progress ring (stroke-dashoffset drives %, drop-shadow glow), 100px logo-mark centered, radial glow that grows/brightens with progress (opacity .34→.96, scale .9→1.18). Cursor parallax on the whole orb.
- 62px tabular % counter + status line that changes with progress: <15% "Waking your tutor…", <40% "Downloading the model to your device…", <70% "Unpacking 3.8B parameters…", <93% "Tuning to your focus — Applied ML…", <100% "Almost yours…", 100% "Your tutor is ready."
- 3 checklist steps tick at 34/66/93%: "Model weights", "Tokenizer & tools", "Tuned to your focus". Footer: cpu icon + "Runs entirely on your device · Works offline".
- Prototype simulates 5.2s (easeInOutQuart). **Completion burst**: radial flash (lime→lavender, 1s), 3 expanding pulse rings, 20 spark particles (lime/lavender/sunset), mark scales 1→1.2→1 (elastic), ring stroke fattens 6→11→7. Then CTA "Meet your tutor" rises in.

### 05 · Journey celebration (two variants)
- **A**: vista image right-content layout; badge "JOURNEY STARTED" (confetti-outline icon, accent); H1 60px "You've started your climb."; chips "AAS · AI Engineering" + "Applied ML"; CTA "Start my first lesson" → Lesson 0.
- **B (centered)**: above-the-clouds image (`climb-clouds.png`, .55). Gold **medallion** 132px (gold outer ring, lavender inner hairline, 62px mark, breathing gold glow; pops in scale .68→1 elastic). Eyebrow gold "DAY 1 · YOUR CLIMB BEGINS", H1 "Welcome to Maestro.", serial line "CLIMBER Nº 4,213 · ASCENT BEGAN JULY 2, 2026" (11–12px tracked caps). CTA "Start my first lesson".
- **Celebration motion (NO confetti anywhere)**: *alpenglow* — a warm diagonal light band (gold/off-white ≤.2 alpha) sweeps across (translateX −60%→60%, 1.5s easeInOutSine) + soft radial bloom (2s) — plus light *spindrift*: ~16 thin white streaks (2px × 18–44px) blow right→left with slight downward drift and fade.

### 06 · Lesson 0 — "Getting to know you" (first lesson, premium interview)
- Full-bleed near-black; basecamp image ghosted at .14; walking-climber GIF (`walk-peak.gif`, 300px, radial-vignette-masked, .5 opacity) whispers in the bottom-right; cursor parallax.
- Header: 36px mark + "Lesson 0 · Getting to know you" / "Your first lesson, before the climb"; right: 3-segment progress + counter ("Question 1 of 3" → "Lesson 0 complete").
- 4 stage panels, cross-fading (out: fade+rise −18px 250ms; in: fade+drop 26px→0 520ms; children stagger 65ms):
  1. "Before we climb, Ray — what brings you to the mountain?" — 2×2 answer cards (Switching careers / Building my own ideas / Leveling up at work / Pure curiosity, each with a one-line sub).
  2. "How much time can you give each week?" — 3 cards (2–3 hours · A steady pace / 5–7 hours · The classic climb / 10+ hours · A fast ascent).
  3. "Have you written code before?" — Never / A little / Comfortable.
  4. Wrap: "Thanks, Ray — here's how this works." + 3 feature rows (lavender chat icon "Lessons are conversations — you talk it through with your tutor, no lecture videos." / lime cpu "Yours, on your device — runs locally, offline, private." / sunset route "A path that adapts — your answers shape every week of the climb.") + CTA "Take me to my summit" + "Lesson 0 complete · Your path is set".
- Answer select: accent border + tint, 430ms later auto-advance. Chosen answers accumulate in a small echo pill bottom-left ("Career switch · 5–7 hrs a week · some code before"). **Answers must persist** — they drive later memory callbacks.

### 07 · Home — the summit map (two variants) + constellation sky
- App chrome: 240px left sidebar (dark `#1c1c1b`, compact nav: Home, Learn, Practice, Profile, Discussions, Services; locked section: Projects, Leaderboards, Community, Shop; footer avatar "Ray Chen · AAS · AI Engineering").
- **A — immersive map (centerpiece)**: full-bleed ridge image. Greeting "Back at it, Ray" (38px) + streak flame pill "12". Sub: "Level 3 of 5 · you're 35% of the way to the next camp".
  - **Trail**: completed path (accent, 3.5px, glow) **draws in** (stroke-dashoffset, 1.5s easeInOutSine) from basecamp through Level 2 to the "You're here" node; remaining path is a dashed ghost line. Milestone nodes pop in staggered (scale .4→1, easeOutBack): done = lime-ringed check; current = 48px solid-accent node with logo-mark, double ping rings (2.6s loop), "You're here" pill; locked = hollow gray (lock / diamond for Summit). Labels: Level 1 Foundations, Level 2 Python basics, Level 3 Functions & input, Level 4 Data & loops, Summit First model.
  - **Constellation sky** (top band of the image): 10 stars = mastered concepts (print(), comments, running code; variables, strings, numbers, naming; functions, parameters, return values). Weeks 1–2 stars are **connected** (1px lavender .3 lines — completed constellations); Week 3's three stars are loose (its constellation completes when the week does). Stars fade in after the trail (90ms stagger), lines draw via dashoffset, then each star twinkles (opacity .5↔1, 1.5–3.3s, random phase). Hover: star scales ×2 + label chip "functions · Week 3". Caption top-right: sparkle icon + "Your sky · 10 concepts mastered".
  - Resume card bottom-right (blur panel): 48px 35% ring, "PICK UP WHERE YOU LEFT OFF / Functions & input / PY101 · Lesson 4", CTA "Continue" → zooms into Week.
- **B — expedition ledger**: 452px left panel with vertical level timeline (checks, connectors, current-level card with CTA, locked rows), right side cinematic vista with caption "The ridge · Level 3 / Keep climbing." + 76px 35% ring. Timeline nodes/connectors cascade in.

### 08 · Week view
- Breadcrumb "AI Engineering › Level 3 · Functions & input". H1 34px + course meta + 8px progress bar (35%).
- Accordion of 5 weeks (16px-radius cards): W1, W2 complete (lime check headers, lesson lists with check-circles); **W3 current — auto-open**, 1.5px accent border + tint + glow, "In progress · 3 of 4 done", 3 done lessons + highlighted next-lesson row ("Input & output · Lesson 4 · up next") with "Continue" pill → zooms into Lesson; W4/W5 locked at .7 opacity ("Unlocks after Week 3/4"). Accordion animates height via JS (grid-rows trick unreliable — see Implementation notes), chevron rotates 180°.
- Right rail (w 308): **living card** — `walk-ridge.gif` (animated climber, 150px crop) + "The ridge / Level 3" + 52px 35% ring "3 lessons to go"; streak card (flame, "12 days"); tutor card (cpu, "Tutor ready · on your device").

### 09 · Lesson — tutor chat
- Header: back chevron, "Input & output / PY101 · Lesson 4", **segmented progress bar up front**: 5 segments, seg 1 filled, seg 2 animates 0→55% on entry (900ms, easeInOutQuart, 420ms delay), "Step 2 of 5".
- Thread (max-w 660 centered): tutor bubbles (32px mark avatar, `surface-1`, 4/20/20/20 radius), user bubbles (deep evergreen `#1A3426`, 20/4/20/20), inline code ticks, syntax-highlighted PYTHON code card (header bar + line numbers; strings sunset, fn names evergreen-text).
- **The tutor types**: last message appears via typing indicator (3 bouncing dots bubble, ~1.75s) then the real message + suggestion chips fade in. First bubble includes a **memory callback** ("Last time we covered print() and comments…").
- Suggestion chips, right-aligned (user side), asymmetric radius 9999/9999/0/9999: primary accent chip "Open the code panel" (code icon) + ghost chips "Explain input()", "Show an example".
- Composer: muted surface, 16px radius, placeholder "Message Maestro", attach/mic ghost buttons, white send circle.

### 10 · Code panel (springs open)
- Split: chat pane fixed 500px left (compact header with 5-seg bar "3 / 5", short bubbles, composer), **code pane slides in from the right** (translateX 101%→0, 560ms easeOutCubic).
- Editor: `#0e0e0d`, header "main.py" + accent status dot + **Run** pill (accent, play icon) + collapse chevron. Menlo 14px/26px, line numbers, blinking block caret (1.1s steps).
- **Run** → console panel accordions open below (max-height 0→260, 440ms): `$ python main.py`, "What's your name? Ray", accent "Hello, Ray!", "[Finished in 0.1s]". ~750ms later tutor reply fades in ("Nice — it greeted you by name…"), then accent chip "Finish lesson" → Lesson complete.

### 11 · Lesson complete (modest — deliberately quiet)
- Same app chrome; thread dimmed to ~.16 behind. Centered 440px card (`surface-1`, 24px radius, deep shadow): 72px lime-ringed check **pops** (scale .3→1 elastic, 8 tiny sparks at 640ms — no confetti), "Lesson complete" 26px, "Input & output · Lesson 4 of 4", stats row (clock 12 min · play 2 runs · sunset flame Day 13), divider, CTAs "Finish Week 3" (accent) + "Back to week" (ghost).
- Header bar's 5th segment fills 0→100% on entry. Below the card, the tutor's camp log **typewrites** (~17ms/char, starts at 1.1s): mark + "Clean run, Ray — one step from camp."

### 12 · Week cleared (big celebration)
- Full-bleed dark-pitch image. **The week's route draws up the wall** (accent path, 1s easeInOutQuad; glow filter applied only after the draw for perf) with 4 lesson dots popping alongside (170ms stagger, easeOutBack), ending in a gold **camp node** (46px, diamond icon, double gold ping rings, elastic pop at ~1.05s) labeled "Week 4 / unlocked".
- **Celebration stack**: alpenglow sweep + bloom, ~16 spindrift streaks, and at ~1.65s **a star is born** — a bright point lifts off from the camp node, flies to the sky (800ms easeOutCubic), lands among 3 faint stars, flares (expanding ring), the neighbors brighten, and constellation lines draw in. The user's sky permanently gains a star.
- Content bottom-left: gold tag "WEEK 3 CLEARED" (check-circle), H1 58px "That's Week 3, done.", sub "Functions & input is behind you — and the route to Week 4 just opened.", stat pills (book "4 lessons" · clock "58 min with your tutor" · sunset flame "13-day streak"), **memory line** (mark + "You told me you're switching careers — Week 4 is where it starts to show."), CTAs "Onward to Week 4" (accent) + "Back to my summit" (ghost).

## Interactions & Behavior (global)

- **Continuous zoom**: Home→Week (origin 63% 54% = the current-level node), Week→Lesson (origin 46% 64% = the next-lesson row). Outgoing scales 1→1.55 + fades (520ms easeInQuad); incoming fades/scales .94→1 (480ms easeOutCubic, 110ms delay). Reverse = zoom out (incoming 1.45→1 from the same origin). All other transitions: 300ms fade-out / 520ms fade+rise-in.
- **Per-screen entrances**: content blocks stagger in (opacity 0→1, translateY 18→0, 560ms easeOutCubic, 70ms stagger).
- **Cursor parallax** (Welcome, Lesson 0, Download only): lerped at .09/frame; image −13x/−9y, orb +8x/+6y. Desktop only.
- **Magnetic CTA** (Welcome B): translate toward cursor (±12x/±8y −2y), 180ms ease-out return.
- **Hovers**: primary pills lift −2px + shadow bloom; cards border→`border-strong`; press scale .97–.98.
- **Reduced motion** (`prefers-reduced-motion`): kill parallax, magnetic, typing simulation, typewriter, motes, twinkle, celebrations (show end states instantly); keep opacity/color feedback ≤150ms. The prototype also exposes a manual `reduceMotion` flag — mirror with a user setting.

## State Management

- `user`: { name, email, track, weeklyHours, codingExperience, why } — captured in 02/03/06; `why` and `track` drive memory callbacks (09 first bubble, 12 memory line) and download status copy ("Tuned to your focus — Applied ML").
- `progress`: { level, levelPct, week, lessonIndex, lessonStep, masteredConcepts[] } — drives trail geometry, segmented bars, constellation stars, week accordion states.
- `streak`: { days, lastActive } — flame pills (07/08/11/12).
- `downloadState`: 0–100 + phase — ring, status line, checklist; completion gates the CTA.
- `identity`: { climberNo, ascentStart } — serial line (05B).
- Lesson chat: message list, typing flag, code-panel open, console output, run count.

## Design Tokens

Source of truth: Maestro Design System (`colors_and_type.css`). Key values used here:

- **Fonts**: Wix Madefor Display (headings), Wix Madefor Text (UI/body), Menlo (code).
- **Cinematic base**: pure `#000` for full-bleed image screens (deliberate deviation); app surfaces: bg `#232322`-family — sidebar `#1c1c1b`, surface `#1A1A19`, surface-1 `#232322`, surface-2 `#2A2A29`, editor `#0e0e0d`.
- **Neutrals (dark ramp)**: fg `#ECEBE4`, fg-2 `#A8A8A4`, fg-3 `#6F6F6D`, border `#3C3C3A`, border-strong `#525250`, n300 `#3C3C3A`, n500 `#6F6F6D`.
- **Accents (punctuation only)**: evergreen `#CEF585` (progress, current position, primary CTA; ink on it = `#0A0A0A`), lavender `#A6B2F7` (tutor glow, constellation, accreditation), sunset `#FF8B62` (streak, code strings), gold `#EAAD5E` (milestones: medallion, camp node, week-cleared tag).
- **User bubble green**: `#1A3426`.
- **Radii**: inputs underline-only; cards 16; hero cards/modals 24; pills/buttons 9999 (every button is a pill). Browser-frame 16 (prototype only).
- **Type scale in use**: H1 58–76px display; section 26–38; body 15–19; meta 11–13 (tracked caps .1–.26em for eyebrows/corners).
- **Motion tokens**: instant 80ms / fast 150 / base 200 / moderate 300 / slow 450 / emphasis 600; easings productive `cubic-bezier(.2,0,.38,.9)`, emphasized `cubic-bezier(.2,0,0,1)`. Prototype hero timings: trail 1500ms, download 5200ms, line-mask reveal 780ms, typing 1750ms, star-born sequence ~2.4s total.

## Motivation & Dopamine UX Spec (researched — build into the Lesson chat next)

Grounding: anticipation releases more dopamine than reward receipt; variable schedules beat fixed; loss aversion (streaks) is the strongest retention lever, but extrinsic rewards must hand off to intrinsic mastery (autonomy / competence / relatedness) or engagement collapses when rewards lose meaning. No leaderboards — they cheapen the "it's yours" intimacy.

Priority build order:
1. **Staged verdicts** — tutor visibly considers (~400ms beat) before every verdict lands with a micro-flare. Highest-frequency anticipation loop.
2. **Embers to the bar** — every correct step sends a light particle from the message into the segmented progress bar, which micro-fills. Watchable accumulation.
3. **Rare "Maestro insights"** — unpredictably-timed gold-edged insight cards (pro tricks / mountain lore) that file into a logbook. Variable reward where the reward IS knowledge.
4. **"Today's pitch" card** — 3 micro-goals opening each session ("reach the ledge · run clean code · no hints"), checked off live.
5. **Altitude gained** — lesson-complete counts up "+140m"; total altitude = degree-long score (replaces XP).
6. **Momentum ribbon** — consecutive good answers build a quiet glow around the composer; fades gently on a miss, never punishes.
7. **Weatherproof days** — streak-with-grace: struggle but show up and the tutor grants the day ("Rough pitch today. Still counts.").
8. **The tutor notices** — frustration-aware tone shift + "different route up" offer after repeated misses; memory callbacks on re-encountering old concepts.
9. **The orb warms** — tutor glow subtly warms with cumulative effort (attachment mechanic, not a mascot).

## Assets (`assets/`)

- **Brand**: `maestro-logo-on-dark.svg` (wordmark+shield), `maestro-logo-mark-on-dark.svg`, `maestro-logo-mark.svg` (dark-on-light), `maestro-avatar.svg`.
- **Climb photography (B&W, client-supplied)**: `climb-1-basecamp.png` (Welcome A, Lesson 0 ghost), `climb-2-darkpitch.png` (Week cleared), `climb-3-ridge.png` (Home A, degree-era), `climb-4-vista.png` (Celebration A, Home B), `climb-5-summit.png` (Welcome B), `climb-account.png` (Account), `climb-clouds.png` (Celebration B), `climb-peakface.png` (Degree), `climb-ledge-white.png` (reserved — light-surface artifact, e.g. summit passport).
- **Living GIFs (320×320, B&W, client-supplied)**: `walk-ridge.gif` (Week-view rail card), `walk-peak.gif` (Lesson 0 cameo).
- **Icons** (`assets/icons/*.svg`): 24px stroke/fill set (untitled-ui style), normalized to solid `#000` + recolored to `currentColor` at runtime — in production, inline them or use the codebase's icon pipeline with `currentColor`.

## Files

- `Open Maestro.dc.html` — the full prototype: all 12 screens' markup + inline styles (spec source of truth) and a `Component` logic class containing every behavior: navigation/zoom (`go`), parallax (`initParallax`), magnetic CTA (`initMagnetic`), constellation (`buildSky`), download sim (`enter_download`), quiz (`gkShow`/`quizPick`), typing (`enter_lesson`), typewriter (`typeText`), celebrations (`alpenglow`, `spindrift`, `starBorn`), accordion, track select, run-console.
- `assets/` — everything above.

## Implementation notes (hard-won)

1. **Don't animate layout with CSS transitions on elements you also set inline styles on** — the prototype hit stuck-transition bugs (a live CSS transition overrides inline `opacity`/`!important`). Drive show/hide + accordion heights from the animation library (or `Web Animations API`) writing inline styles, as the prototype does.
2. **Expensive filters during path animation**: apply `drop-shadow` glows to SVG paths only AFTER the dash-draw completes (screen 12 stutters otherwise).
3. **transform-origin zooms**: set origin on the outgoing screen to the tapped element's center (percentages above), reset after.
4. **GIF scale**: the walking GIFs are 320px — display ≤~480px (rail card, cameo) or they pixelate.
5. **Descenders in masked line reveals**: give each overflow-hidden line wrapper bottom padding (6–10px) or "p/g/y" clip.
6. Sequence budgets: no dead gaps >300ms between celebration beats; overlap stages (dots pop *while* the trail draws).
