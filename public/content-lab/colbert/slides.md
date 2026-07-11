# Bi-encoders, Cross-encoders and ColBERT

## Style

- Palette: Dark navy background (#0D1117), white body text, electric blue accents (#4F8EF7) for diagram nodes and labels, amber (#F5A623) for warnings/trade-offs
- Background: Deep dark, consistent across all slides
- Tone: Clean, technical, confident — no decoration for its own sake
- Typography mood: Monospace or semi-monospace for diagrams and code-like labels; sans-serif for body
- Footer: Slide number bottom-right, handle bottom-left — every slide

---

## Slide 1 — Cover

**Headline:** BERT, sentence-transformers — you've been using bi-encoders all along.
**Body:** They work. Until they quietly don't.
**Visual:** Text-only slide. Headline large and centered. Body beneath it, smaller weight. No illustration.

---

## Slide 2 — Bi-encoder

**Headline:** One vector. Whole document. That's the bottleneck.
**Body:** Whole doc → one vector. Specific details average out. Precision lost.
**Diagram:**
```
Query  →  BERT  →  [vector]  ──┐
                                ├──  cosine sim  →  score
Doc    →  BERT  →  [vector]  ──┘
```
Below diagram, a visual note: "Entire document = 1 point in space. Specific detail = gone."

---

## Slide 3 — Cross-encoder

**Headline:** Cross-encoder reads both together. Quality jumps. Speed dies.
**Body:** No precomputation. 100M docs = 100M BERT calls per query. Reranker only.
**Trade-offs (smaller text, amber):** Accurate — but re-embeds everything per query. Can't retrieve.
**Diagram:**
```
[ CLS ] query [ SEP ] document [ SEP ]
              ↓
         BERT (full attention)
    query tokens ←——→ doc tokens
              ↓
         score
```
Amber label on the side: "O(N) forward passes at query time"

---

## Slide 4 — ColBERT

**Headline:** Keep every token. Interact late.
**Body:** Docs encoded offline. Each query token finds its best doc token. Sum = score.
**Trade-offs (smaller text, amber):** Storage ×N. Needs PLAID index.
**Diagram:**
```
Query  →  BERT  →  [q1] [q2] [q3]  ──┐
                                       ├──  MaxSim  →  score
Doc    →  BERT  →  [d1] [d2] ... [dm] ┘

MaxSim: each qi finds best-matching dj → sum
```
Label: "Docs encoded OFFLINE. Interaction happens LATE."

---

## Slide 5 — Production Pipeline

**Headline:** None of these replaces the others. They stack.
**Body:** Bi-encoder retrieves top 1000. ColBERT or cross-encoder reranks. Each does one job.
**Diagram:**
```
100M docs
    │
    ▼
Bi-Encoder          ← fast ANN, retrieve top 1000
    │
    ▼
ColBERT / Cross-Encoder  ← rerank top 1000 → top 10
    │
    ▼
User gets top 10
```
