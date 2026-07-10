# PAHF: Personalized Agents from Human Feedback

## Global Style

- Dimensions: 1080×1350 px (4:5 portrait) — all slides must match exactly
- Safe zone: All text and critical elements ≥108 px from every edge (10% of 1080 px)
- Palette: Deep navy (#0A0F1E) background, electric blue (#3B82F6) accent, white primary text, slate-gray (#94A3B8) secondary text
- Typography mood: Clean technical sans-serif — dense, high-contrast, no decorative elements
- Background: Dark solid with a faint grid texture; no gradients, no photography
- Tone: First-person engineering story — peer talking to peer, building through stages

---

## Slide 1 — Cover

**Headline:** I kept re-injecting the same feedback to my AI. Every. Single. Session.
**Body:** Turns out this isn't a model problem. It's an architecture problem. And it has a name.
**Visual:** Dark navy. Large white headline, two lines. "Architecture problem" in electric blue. No icons. Stark and minimal.

---

## Slide 2 — Stage 1: No Memory

**Headline:** "I want a cake."
**Body:** The AI makes a cupcake.

You correct it: "No — a birthday cake."

It fixes it. Next session: cupcake again.

No memory means every session starts from zero. Every correction evaporates.
**Visual:** Two-panel illustration. Left: user speech bubble "I want a cake." Right: AI response showing a cupcake. Below: red X and "Next session → cupcake again." Clean iconography on dark navy.

---

## Slide 3 — Stage 2: Semantic Memory

**Headline:** Memory helps. Until it doesn't.
**Body:** Now the AI remembers "cupcake."

You correct it: "Birthday cake." It updates. Remakes it.

But it already spent tokens generating the wrong cake. And it stored what it inferred — not what you approved.

Next ambiguous request? Full generation. Wrong output. Correction. Repeat. Every tweak costs a round-trip.
**Visual:** Three-step flow. "Remembers: cupcake" → "You say: birthday cake" → "Stores: birthday cake (inferred)." Last node has a warning icon. Slate-gray flow arrows, electric blue warning marker.

---

## Slide 4 — Stage 3: What I Built

**Headline:** Ask first. Lock the plan. Then act.
**Body:** "I want a cake."

AI: "I'm about to make you a cupcake — is that right?"

You: "No. Birthday cake."

AI locks in the plan. Bakes the birthday cake. Memory only updates after you confirm.

Zero tokens wasted on wrong output. And later, if you want a wedding cake instead — you update that one preference. No re-teaching. No full session replay.
**Visual:** Linear flow diagram. "Request" → "AI checks: cupcake?" → "User: No, birthday cake" → "Plan locked" → "Action" → "Confirmed → Memory updated." Electric blue nodes, white labels, dark background.

---

## Slide 5 — Stage 4: PAHF

**Headline:** Meta AI named this pattern in early 2026: PAHF.
**Body:** Personalized Agents from Human Feedback.

Semantic memory learns from what it did.
PAHF learns from what you approved.

Three-step loop:

1. Pre-action clarification — ask before assuming
2. Grounding — retrieve approved preferences before generating
3. Post-action feedback — only confirmed corrections update memory
   **Visual:** Circular loop diagram. Three labeled nodes: "Clarify" → "Ground" → "Feedback" → back to "Clarify." Center label: "PAHF." Electric blue connectors. "Meta AI · 2026" in slate-gray at bottom.

---

## Slide 6 — CTA

**Headline:** What feedback do you re-inject every session?
**Body:** For me it was tone, structure, and "stop explaining what you're about to do."

If you've felt this — you've hit the exact gap PAHF was designed to close.

**Visual:** Dark navy. Headline in large white text. Single electric blue underline. No icons, no clutter. Author name or handle in slate-gray at bottom right.
