# How Do You Eval and Correct Your AI Agent

## Style

- **Dimensions:** 1080×1350 px, 4:5 portrait
- **Palette:** Background #0F1117 (near-black), primary text #F0F0F0, accent #3B82F6 (electric blue), warning red #EF4444 for failure states
- **Background:** Solid dark, no gradients
- **Tone:** Sharp, technical, zero fluff — built for engineers
- **Typography mood:** High contrast, clean sans-serif, bold headlines that land like statements

---

## Slide 1 — Cover

**Headline:** Your agent is live. You have no idea if it's working.

**Body:** Thread length is low. Retention is dropping. No error fired. No one complained loud enough. You just have no signal.

---

## Slide 2 — Deployed ≠ working

**Headline:** No errors doesn't mean it's working.

**Body:** You grabbed a third-party eval tool. Relevance: 8/10. Coherence: 9/10. Looks like signal. But it knows nothing about your domain, your users, or what a correct answer even looks like.

---

## Slide 3 — Hard failures → unit tests

**Headline:** Some failures your code already sees.

**Body:** Exceptions, tool call failures, malformed JSON structured outputs. Write fast boolean assertions on format, schema, and tool responses. Run on every change. No LLM needed.

---

## Slide 4 — The eval you already have

**Headline:** Your chat logs are a passive eval you never ran.

**Body:** Classify frustrated conversations — short threads, repeated rephrasing, abrupt drop-offs. These users were already telling you what's broken. Cluster the failure patterns that surface.

---

## Slide 5 — Build your ground truth

**Headline:** Pull top 200 queries. Let an expert label 50–100.

**Body:** Not you the engineer — a domain expert who knows what a correct answer looks like. Binary labels, one-line reasoning each. That dataset is your golden standard for everything that follows.

---

## Slide 6 — LLM-as-judge → fix → lock it

**Headline:** Now build the judge that thinks like your expert.

**Body:** Run a judge prompt on the labeled pairs. Measure agreement score. Iterate until it matches expert judgment. Fix the agent. Run the eval — **numbers move**. Unit test the fix so it never regresses.

---

## Slide 7 — Closing question

**Headline:** How did your eval setup evolve in the last AI agent you worked with?

**Body:** Drop it in the comments — zero evals, fancy dashboard, or something in between.
