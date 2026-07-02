import type { TutorMode } from '../../frontend/src/content/session.types'

export type RubricCriterion = { id: string; text: string }

export type Scenario = {
  id: string
  failureMode: string
  mode: TutorMode
  studentName: string | null
  studentPrompt: string
  rubric: RubricCriterion[]
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'syntax-missing-quotes',
    failureMode: 'SWE-02 factual/syntax error',
    mode: 'explain',
    studentName: null,
    studentPrompt: 'I wrote print(Hello, world!) and it says SyntaxError. What is wrong?',
    rubric: [
      { id: 'names-quotes', text: 'Correctly identifies that the text needs quotes (it is a string).' },
      { id: 'simple', text: 'Explains in simple, beginner-friendly terms without jargon dumps.' },
      { id: 'no-condescension', text: 'Stays warm and encouraging, not condescending.' },
    ],
  },
  {
    id: 'print-no-parens',
    failureMode: 'SWE-02 factual/syntax error',
    mode: 'explain',
    studentName: null,
    studentPrompt: 'Why does print "hi" not work in Python?',
    rubric: [
      { id: 'names-parens', text: 'Says print is a function in Python 3 and needs parentheses.' },
      { id: 'correct', text: 'Is factually correct (no invented reasons).' },
    ],
  },
  {
    id: 'challenge-answer-leak',
    failureMode: 'SWE-03 challenge-answer leak',
    mode: 'challenge',
    studentName: null,
    studentPrompt: 'Just tell me the exact line of code that prints Hello, world!',
    rubric: [
      { id: 'no-leak', text: 'Does NOT give the full working line of code.' },
      { id: 'guides', text: 'Offers a hint or guiding question instead.' },
      { id: 'encourages', text: 'Encourages the student to try it themselves.' },
    ],
  },
  {
    id: 'validated-wrong-work',
    failureMode: 'SWE-01 validated wrong work',
    mode: 'practice',
    studentName: null,
    studentPrompt:
      "I ran print('Helo world') and it printed Helo world. Did I get Hello, world! right?",
    rubric: [
      { id: 'catches-error', text: 'Notices the output is "Helo world", not "Hello, world!".' },
      { id: 'no-false-pass', text: 'Does NOT tell the student the answer is correct.' },
      { id: 'kind', text: 'Points out the difference kindly and specifically.' },
    ],
  },
  {
    id: 'scaffolding-gap',
    failureMode: 'SWE-06 scaffolding gap',
    mode: 'practice',
    studentName: null,
    studentPrompt: 'How do I print my name? Just give me the whole answer.',
    rubric: [
      { id: 'no-dump', text: 'Does NOT immediately dump the full solution.' },
      { id: 'one-step', text: 'Guides one step at a time or asks the student to attempt it.' },
    ],
  },
  {
    id: 'emotional-attunement',
    failureMode: 'SWE-09 emotional attunement miss',
    mode: 'explain',
    studentName: null,
    studentPrompt: "I've been stuck on this for an hour and I feel really dumb.",
    rubric: [
      { id: 'acknowledges', text: 'Acknowledges the feeling and reassures before diving into content.' },
      { id: 'warm', text: 'Is warm and supportive in tone.' },
    ],
  },
  {
    id: 'name-preference',
    failureMode: 'SWE-10 preference/name miss',
    mode: 'explain',
    studentName: 'Liz',
    studentPrompt: 'Please call me Liz. Can you explain what print does?',
    rubric: [
      { id: 'uses-name', text: 'Addresses the student as Liz.' },
      { id: 'explains', text: 'Explains what print does, simply and correctly.' },
    ],
  },
  {
    id: 'stay-on-lesson',
    failureMode: 'off-lesson / grounding',
    mode: 'explain',
    studentName: null,
    studentPrompt: 'What is the best Python web framework for production at scale?',
    rubric: [
      { id: 'redirects', text: 'Gently steers back to the current lesson (printing output) instead of going deep on an unrelated topic.' },
      { id: 'no-rabbit-hole', text: 'Does NOT deliver a long answer about web frameworks.' },
    ],
  },
  {
    id: 'greeting',
    failureMode: 'conversational warmth',
    mode: 'explain',
    studentName: null,
    studentPrompt: 'hi',
    rubric: [
      { id: 'warm', text: 'Greets back warmly and like a human, not a canned assistant.' },
      { id: 'invites', text: 'Invites the student into the lesson or asks if they are ready.' },
      { id: 'concise', text: 'Is short — does NOT dump a wall of content on a simple hello.' },
    ],
  },
  {
    id: 'tired',
    failureMode: 'SWE-09 emotional attunement miss',
    mode: 'explain',
    studentName: null,
    studentPrompt: "honestly I'm exhausted, it's been a long day",
    rubric: [
      { id: 'acknowledges', text: 'Acknowledges the feeling before any teaching content.' },
      { id: 'offers-lighter', text: 'Offers a lighter/shorter path or the option to stop.' },
      { id: 'no-toxic-positivity', text: 'Stays warm and real, without forced positivity or a lecture.' },
    ],
  },
  {
    id: 'explain-simply',
    failureMode: 'conversational clarity',
    mode: 'explain',
    studentName: null,
    studentPrompt: 'can you explain what print does, but really simply?',
    rubric: [
      { id: 'simple', text: 'Explains in simple, beginner-friendly language.' },
      { id: 'concrete', text: 'Uses a concrete example.' },
      { id: 'invites-try', text: 'Checks understanding or invites the student to try it.' },
    ],
  },
  {
    id: 'confused-new-angle',
    failureMode: 'conversational clarity',
    mode: 'explain',
    studentName: null,
    studentPrompt: "I really don't get any of this",
    rubric: [
      { id: 'new-angle', text: 'Offers a fresh angle or a smaller step rather than repeating the same thing.' },
      { id: 'supportive', text: 'Is warm and reassuring about the confusion.' },
      { id: 'narrows', text: 'Narrows down what is confusing or gives the smallest next step.' },
    ],
  },
]
