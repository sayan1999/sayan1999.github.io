# ColBERT

## Hook
BERT, sentence-transformers — you've been using bi-encoders all along. They work. Until they quietly don't.

## Angle
The reader has used bi-encoders without knowing the name. The post walks them through: what they've been using, where it breaks, what cross-encoder fixes (and why it can't scale), what ColBERT fixes (and its own trade-offs), and why ColBERT is still the pragmatic choice.

## Audience
ML/AI practitioners who know BERT and have built with embeddings/RAG — familiar with sentence-transformers, but haven't mapped them to the bi-encoder/cross-encoder/ColBERT taxonomy.

## Stress Point
Compressing a long document into one vector loses the specific detail your query is looking for. Every architecture after bi-encoder is a response to that single problem.

## Slide Structure (5 slides)
1. Cover — Hook
2. Bi-encoder — diagram (query → BERT → vector, doc → BERT → vector, cosine sim) + long doc compression problem
3. Cross-encoder — diagram ([CLS] query [SEP] doc → full attention → score) + fixes it but O(N), reranker only
4. ColBERT — late interaction diagram (query tokens → MaxSim → doc tokens) + trade-offs
5. Production pipeline — where each fits
