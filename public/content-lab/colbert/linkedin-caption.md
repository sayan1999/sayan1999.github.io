# Caption

BERT, sentence-transformers — you've been using bi-encoders all along. They work. Until they quietly don't.

A bi-encoder encodes your query into one vector and your document into one vector, then scores them with cosine similarity. Fast. Scalable. Works great on short text.

But feed it a long document and it starts losing. The model compresses everything — every sentence, every specific detail — into a single 768-dimensional vector. Your query asks something precise. The answer is in the document. The embedding averaged it away.

The fix seemed obvious: cross-encoders. Feed query and document together, let every token attend to every other token, and score them jointly. Quality jumps. The model can finally tell if a document actually answers the query, not just whether it's on the same topic.

The problem: you can't precompute anything. Every query requires a full BERT forward pass per document. At 100M documents, that's 100M BERT calls per query. Cross-encoders are rerankers, not retrievers.

ColBERT reframes the question. Instead of one vector per document, keep every token's own embedding. Encode query and document separately — so documents stay precomputable. Then interact late: for each query token, find its best matching document token and sum the scores. MaxSim.

Token-level matching means a specific phrase in a 10,000-word document can still surface. Nothing gets averaged away.

The trade-off: storage multiplies by the average token count. Infrastructure gets complex. But for long-document retrieval, it's the only architecture that doesn't force a choice between speed and precision.

In production: bi-encoder retrieves the top 1000, ColBERT or a cross-encoder reranks. Each stage does what it's actually good at.

What part of your retrieval pipeline have you found hardest to get right — the retriever, the reranker, or the chunking strategy upstream?

#RAG #InformationRetrieval #NLP #VectorSearch
