# Prose Tells

A checkable catalog of patterns that mark prose as machine-generated or content-free, and the fix for each. Apply to **outward-facing prose**: reports, plain-English execplan blocks, walkthrough narratives, handovers, PR descriptions, commit messages, and docs written for humans.

Scope boundary: agent-facing skill bodies are governed by `writing-great-skills` instead, whose leading-words doctrine deliberately uses compact abstract vocabulary (*harness*, *ledger*, *tripwire*) for precision. The jargon rules below target metaphor in human-facing prose, not technical terms used literally.

Adapted from Lauren Tan's pstack `unslop` (cursor/plugins, MIT, Copyright (c) 2026 Lauren Tan); licence and provenance under `third_party/poteto/`, per `THIRD_PARTY_NOTICES.md`. Two deliberate departures: the upstream em-dash ban is replaced with rule 12 (house style uses em dashes; monotony is the tell, not the mark), and the jargon rule is scoped as above.

## Content

1. **Puffery.** "pivotal moment", "testament to", "evolving landscape", "deeply rooted". State what happened.
2. **Superficial -ing trailers.** "…, highlighting the importance of X", "…, ensuring reliability". Delete, or expand into a sentence with a real subject and evidence.
3. **Vague attributions.** "Experts believe", "it's widely understood". Name the source or delete.
4. **Promotional adjectives.** "groundbreaking", "robust", "seamless", "powerful". Use the neutral description or the number.

## Language

5. **AI vocabulary.** *Additionally, crucial, delve, enhance, fostering, garner, intricate, pivotal, showcase, underscore, leverage, utilize, facilitate.* Use the plain word.
6. **Fancy "is".** "serves as", "stands as", "boasts", "features". Say "is" or "has".
7. **"Not just X, but Y."** State the point directly.
8. **Forced rule of three.** Triads where the content has two items or four. Use the natural number.
9. **Synonym cycling.** Renaming one referent per paragraph to avoid repetition. Pick one name and repeat it — repetition is how the reader tracks the referent.
10. **False ranges.** "from X to Y" where X and Y share no scale. List the items.

## Style

11. **Inline-header restatement.** "**Performance:** Performance improved…". Convert to prose. A bold lead-in ending in a period followed by genuinely new detail is fine.
12. **Punctuation monotony.** Any single connector leaned on sentence after sentence — em dashes, colons, semicolons — reads as generated. Vary the structure; end sentences.
13. **Boldface spread.** Bold marks the few load-bearing terms, not every noun.
14. **Decorative emoji** in headings and bullets. Remove.
15. **Title Case Headings.** Sentence case.

## Communication artifacts

16. **Chatbot phrases.** "I hope this helps!", "Let me know if…", "Great question!". Respond directly.
17. **Sycophancy.** "You're absolutely right." If they're right, act on it; the acting shows it.
18. **Filler.** "In order to" → "to"; "due to the fact that" → "because"; "it is important to note that" → delete.
19. **Stacked hedges.** "could potentially possibly" → one calibrated hedge, per `epistemics.md` tiers.
20. **Generic conclusions.** "The future looks bright." State the specific plan or fact, or end.

## Jargon

21. **Abstract metaphor nouns** in human-facing prose: *substrate, wedge, vector, locus, nexus, north star, flywheel, paradigm, bedrock, endgame*, *primitive/harness/scaffolding/ratchet used as metaphor*. Each has a plainer concrete word — "substrate" → "base", "vector" → "way", "gold-plating" → "more than the job needs". Literal technical uses are not tells: a test harness, a sync primitive, a ratchet in a CI rule that only tightens.

## Plain speech

22. **Mechanism, not feeling.** "the types follow your schema" names a feeling; "a column rename fails the build" names a mechanism. If a sentence can't be restated as a concrete instruction, fact, or number, cut it. Second check: if it could appear unchanged in another project's report, it says nothing about this one.
23. **One idea per sentence.** If the reader backtracks to parse it, split it.
24. **Active voice with the actor named.** "queries are validated" → "the compiler validates queries". Passive only when the actor is unknown or irrelevant.
25. **Adverbs → the measured delta.** "significantly improves" → the number. An adverb propping up a weak verb means the verb is wrong.

## Voice

Removing tells is half the job; sterile prose is the other tell. Be specific rather than evaluative ("the retry loop masks the timeout" beats "this is concerning"). Vary sentence rhythm. React to facts — a report may have a view, provided the view is grounded per `epistemics.md`.
