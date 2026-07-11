# PAHF: Personalized Agents from Human Feedback

## Angle
PAHF replaces static profile prompting with a memory-driven read/write loop — here's the framework, and the problem it solves.

## Audience
Mid-to-senior ML engineers and applied AI builders who've felt agents fail to remember users across sessions.

## Stress Point
Fine-tuning and static profiles fix personalization at the wrong layer. Even semantic memory alone still guesses — it retrieves past preferences but has no clarification loop, so it over-assumes and misunderstands. PAHF fixes both problems at inference time: it asks before acting, and only writes back preferences you explicitly approved.

## Hook
"Semantic memory retrieves your preferences. PAHF only writes back the ones you actually approved."

## Key Insights
- **Normal agents:** no memory, guesses every time — same correction every session
- **Memory-augmented agents:** retrieves semantically similar preferences but stores inferred corrections, not approved ones — over-assumes confidently
- **PAHF:** asks before acting, locks in the plan, only writes back what you confirmed
- **Critical distinction:** semantic memory learns from what it did; PAHF learns from what you approved
- **Core example:** "I want a cake" → cupcake (no memory) → birthday cake after correction but unapproved (semantic memory) → AI asks first, you confirm birthday cake, memory updates only after approval (PAHF)

## Slide Structure (confirmed)
1. Cover — "I kept re-injecting the same feedback every session. There's a name for this problem."
2. Stage 1: No memory — "I want a cake." AI makes a cupcake. You correct it. Next session: cupcake again.
3. Stage 2: Semantic memory — Remembers cupcake, updates to birthday cake after correction. But stored an inferred preference, not an approved one.
4. Stage 3: What I built — AI asks first. You confirm. Memory only updates after approval.
5. Stage 4: PAHF — Meta AI named this in early 2026. Semantic memory learns from what it did. PAHF learns from what you approved.
6. CTA — "What feedback do you re-inject every session?"

## Status
*FROZEN — confirmed with user, do not edit*
