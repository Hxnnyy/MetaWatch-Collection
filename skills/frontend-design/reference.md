# frontend-design — reference

## Gemini prompt template (advisory)

Paste after invoking Gemini in the CLI (`gemini "..."`). Don't use the -p flag, it's deprecated.

```txt
You are my design/UX consultant. You are to return a text response *ONLY*. Make no changes to the codebase.

Context:
- Framework: Next.js (App Router) + TypeScript
- Goal: Distinctive, restrained composition with excellent product hierarchy
- Constraints: mobile-first, accessible, performance-aware
- Motion: Framer Motion + Lenis where appropriate; respects prefers-reduced-motion
- Copy: written only for the end user; no implementation narration or filler

Page/feature:
- Page: [route]
- Surface type: [landing page | dashboard | app shell | modal/drawer | onboarding]
- Primary user goal: [goal]
- Audience: [who]
- Tone: [tone]
- Key content blocks: [list]

Current structure (brief):
- [describe layout, nav, key components]
- [include small excerpts if helpful]

Ask:
1) Propose a clear visual thesis (mood + principles).
2) Specify layout: grid, spacing rhythm, breakpoints, and mobile collapse behavior.
3) Identify at most two defining components or interactions that make the product specific.
4) Provide a motion spec: entrance sequences, scroll-linked effects, micro-interactions, reduced-motion fallback.
5) Audit every visible sentence for end-user relevance and rewrite or remove weak copy.
6) Identify containers and chrome that can be flattened or removed.
7) Give an ordered implementation plan.
```

## Anti-slop checklist

- [ ] Dominant element exists per screen
- [ ] Chapters/rhythm, not uniform blocks
- [ ] Bespoke components, not library-default assembly
- [ ] Motion clarifies hierarchy/orientation
- [ ] Mobile feels first-class and optimised for different devices
- [ ] Cards are justified (not default)
- [ ] Copy serves the surface type (marketing vs. utility)
- [ ] Product copy contains no builder-facing or implementation narration
- [ ] Every sentence changes a decision, prevents an error, or explains recovery
- [ ] Brand/product is unmistakable in first viewport
- [ ] No filler sections or repeated mood statements

## Motion spec defaults (safe starting points)

- Frequency gate: repeated and keyboard-driven actions use little or no motion
- Routine state change: quick opacity/transform response, normally under 300ms
- Section reveal: container stagger, small distances, once-only by default
- Scroll-linked: Lenis for smooth scroll, Framer Motion for parallax/sticky effects
- Reduced motion: disable scroll-linked transforms; keep essential state changes
- Hover: only on fine pointers; quick and subordinate to press/focus feedback
