---
title: "PAHF: Personalized AI Feedback"
date: "2026-06-15"
description: "The system design behind persistent, preference-aware AI drafting — and why naively re-prompting a model with user corrections fails every time."
---

# PAHF: Personalized AI Feedback

I kept re-injecting the same feedback to my AI. Every single session.

Same tone correction. Same structure note. Same *"stop explaining what you're about to do."* I write a lot — creative and technical — collaboratively with AI. And every new session, I was starting from scratch.

---

I assumed this was a memory problem. It wasn't.

Adding semantic memory helped partially. The agent could retrieve that I preferred concise writing. But it still guessed wrong constantly — and worse, it stored what it *inferred* from my corrections, not what I actually approved. So the memory got polluted fast.

---

## The Cupcake Problem

Think of it this way.

You ask an AI for a cake. It makes a cupcake. You correct it — birthday cake. It updates its memory. But it already spent tokens on the wrong output, and it stored "birthday cake" from an inferred correction, not a confirmed one.

Next time you ask for something sweet? **Confident wrong answer again.**

---

## What Actually Fixed It

The fix I built: **the agent asks before it acts.**

> *"I'm about to make you a cupcake — is that right?"*

You say no. It locks in birthday cake. Then it acts. Memory only updates **after you confirm** the final output. And if you later want a wedding cake instead, you update that one preference — no full re-teach, no session replay, no wasted tokens.

---

## The Pattern Has a Name

Turns out Meta AI named this exact pattern in early 2026: **PAHF** — Personalized Agents from Human Feedback.

The core idea: a three-step inference-time loop.

1. **Pre-action clarification** — eliminate assumption errors before generating
2. **Grounding** — retrieve approved preferences before generating
3. **Post-action feedback** — only write back what you confirmed

> Semantic memory learns from what the agent *did*.  
> PAHF learns from what you *approved*.

That distinction is the whole thing.

---

I built this as a sidecar service — any frontend can plug in.

What feedback do you find yourself re-injecting every session?

#AI #MachineLearning #AgenticAI #PAHF
