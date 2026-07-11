# How Do You Eval and Correct Your AI Agent

## Angle
Your agent is live. Thread length is short. User retention is dropping. You have no idea what's going wrong.

## Stress Point
Silence isn't success — it's just the absence of complaints you can hear. Most teams have zero signal on output quality until a user loudly breaks something.

## Hook
Your agent is live. Thread length is low. Retention is dropping. You have no idea what's going wrong.

## Act 1 — Flying blind
No observability, no evals, nothing measuring quality. You shipped the agent and assumed working = not broken. But the agent can respond perfectly and be completely wrong. You just can't see it.

## Act 2 — The wrong fix
You grab a third-party eval tool. Beautiful dashboard, generic scores — relevance, coherence, helpfulness all 8/10. Feels like signal. But these metrics know nothing about your domain, your users, or what your agent is supposed to do. You went from blind to blindfolded.

## Act 3 — The eval evolution (two paths, one stack)

Two things can go wrong in any agent:

**Hard failures** — exceptions, crashes, tool call failures, malformed JSON structured outputs, wrong classification format. Your code can detect these.
→ Write unit tests. Fast boolean assertions on structure, format, JSON schema, tool call responses. Run on every change. Cheap, automatic, no LLM needed.

**Soft failures** — agent responds, but it's wrong, off-tone, misses intent, or gives a plausible-sounding bad answer. Code can't catch these.
→ You already have an eval you never ran — your chat logs. First classify conversations by sentiment — pull out the frustrated ones: short threads, repeated rephrasing, abrupt drop-offs. Then extract what those users were actually trying to do. Cluster the failures. The patterns surface from data you already own.
→ Build your golden eval dataset separately: cluster all user queries by topic and intent, find the top 200 most frequent, manually pick 50–100 representative ones, hand them to a domain expert to label good/bad with one-line reasoning. Not the engineer — someone who knows what a correct answer looks like for this domain. This is your ground truth.
→ Write a judge prompt. Run LLM-as-judge on the same pairs. Measure agreement score between LLM and the expert labels.
→ Iterate the judge prompt until it thinks like the domain expert does.
→ Now run that eval against the failure clusters from your chat logs. Fix the agent. Watch the numbers move.
→ Lock it in with a unit test so it never regresses.

## The evolution
Nothing → catch what breaks (unit tests) → measure what degrades (domain evals) → fix with proof (numbers move) → lock it (regression tests)

## Closing question
How did your eval setup evolve in the last AI agent you worked with?

## Key points
- Deployed ≠ working. Short threads and low retention are your first real signal — not error logs.
- Generic eval tools give you precision without accuracy — scores that look good and mean nothing.
- Hard failures need unit tests. Soft failures need human-labeled domain evals.
- You must label data yourself before you can trust any automated eval.
- The agreement score between you and your LLM judge is the only metric that matters early on.
- Fix → measure → numbers move. That's proof. Not a feeling.
