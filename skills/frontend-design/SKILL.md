---
name: frontend-design
description: Design and refine frontend UI across product and marketing surfaces, including hierarchy, copy, responsive composition, interaction, motion, and design review.
---

# Frontend Design

Create interfaces with one legible idea, strong hierarchy, deliberate craft, and
quiet interaction. Treat content, composition, and behavior as one design problem.

## Establish the thesis

Before changing code, infer or write:

- **Visual thesis:** mood, material, and energy in one sentence.
- **Task thesis:** the user's next decision or action, then the minimum context it requires.
- **Interaction thesis:** the few responses or gestures that improve feedback, orientation, or tone.

Inspect the existing product language and design system first. Preserve a strong
local system. When the product is established, make changes feel native rather
than imported from a design trend.

## Choose the surface strategy

### Marketing and editorial surfaces

- Lead with one dominant visual plane and a short promise.
- Make the brand or product unmistakable in the first viewport.
- Prefer full-bleed composition, confident cropping, sparse copy, and chaptered rhythm.
- Let each section explain, prove, deepen, or convert—one job per section.
- Use real-looking, in-situ imagery that carries narrative weight.

### Product UI and dashboards

- Lead with the working surface: navigation, status, data, tasks, controls, or context.
- Make the primary task and current state apparent without explanatory prose.
- Use calm hierarchy, dense but readable information, and one clear action accent.
- Reveal secondary settings, history, and help in context or on demand.
- Prefer layout, dividers, lists, and whitespace over card mosaics.
- A card earns its border and background when the card itself is an interaction or movable object.
- Let obvious controls remain obvious. Add guidance only where the user could
  reasonably hesitate, make an expensive mistake, or fail to recover.

## Compose before components

- Start from real content and states, including empty, loading, error, and constrained data.
- Establish the grid, section cadence, dominant element, and whitespace before choosing components.
- Use scale, alignment, contrast, cropping, and type before adding chrome.
- Default to two typefaces and one accent color unless the existing product system requires more.
- Keep the first viewport within its real height budget, including persistent headers.
- Design the smallest target viewport as a first-class composition, then expand.
- Use component libraries for reliable primitives and utility surfaces; art-direct the composition around them.

## Keep the interface silent

Product copy exists for the end user, not as a commentary track for the builder.

- Use the user's domain language. Reserve implementation terms for products whose
  users actually work with those terms.
- Write labels as nouns, states, or actions. Write sentences only when they change
  a decision, prevent an error, or explain recovery.
- Express functionality through the control, result, status, and spatial
  relationship before reaching for helper text.
- Keep onboarding and documentation out of the everyday working surface. Place
  durable explanation in contextual help when it is genuinely needed.
- Treat technical architecture, automation mechanics, permissions plumbing, and
  internal workflow as invisible unless the user must understand them to act.
- Keep one primary action per local decision. Give secondary actions quieter
  placement rather than equal visual weight.

### Marketing copy

- Give the first viewport a real visual anchor; decorative texture alone is insufficient.
- Choose crops with a calm tonal area when text overlays imagery.
- Avoid generated imagery containing UI frames, embedded typography, fake logos, or collage layouts unless explicitly requested.
- Keep marketing headlines meaningful and support copy to one short sentence where possible.
- Delete repeated claims and filler sections.

## Design the interaction

Every motion needs a purpose and a frequency budget.

- Frequent or keyboard-driven actions should feel immediate; use little or no motion.
- Use routine motion for occasional state changes, spatial continuity, and feedback.
- Reserve delight for rare moments where it will not become friction.
- Respond on pointer-down and track direct manipulation continuously.
- Keep gesture-driven motion interruptible; animate from the live on-screen value.
- Hand release velocity into momentum or spring motion so dragging and animation
  share one continuous trajectory.
- Anchor menus, popovers, and sheets to their source. Keep modal motion centered.
- Default to critically damped springs; reserve bounce for momentum-carrying gestures.
- Gate hover behavior to devices with a fine pointer.
- Provide reduced-motion and reduced-transparency equivalents that preserve comprehension.

For implementation details, formulas, gesture handling, materials, typography, and
motion QA, read [references/fluid-interface.md](references/fluid-interface.md)
whenever the work includes touch, drag, swipe, sheets, carousels, spring motion,
glass/material effects, or motion QA.

## Implement

- Build the smallest component system that expresses the thesis.
- Reuse established tokens and primitives where they reinforce consistency.
- Add bespoke components only where they create the defining composition or interaction.
- Animate compositor-friendly properties such as `transform` and `opacity`.
- Give pressable controls immediate feedback and source-aware overlays a plausible origin.
- Preserve semantic structure, keyboard behavior, focus management, contrast, and tap targets.

Use the optional advisory prompt in [reference.md](reference.md) only when a second design opinion would materially improve a substantial design task.

## Subtract, then verify

Run a visible subtraction pass before calling the design complete:

- For every sentence, identify the decision, error, or recovery it supports. Delete
  it when none exists.
- For every container, identify the grouping or interaction it creates. Flatten it
  when spacing and alignment can do the job.
- For every icon, badge, border, and accent, identify the distinction it carries.
  Remove it when it only decorates.
- Read the surface as an end user. Replace builder-facing language with the user's
  nouns and actions.

Check the implemented result, not just the source:

- Desktop and smallest supported mobile viewport
- Keyboard and focus flow
- Reduced motion
- No horizontal overflow, layout shift, clipped controls, or unsafe-area collisions
- Smooth gesture interruption and reversal where applicable
- One dominant idea per screen or section
- Clear wayfinding: where am I, what can I do, and how do I leave?
- Slow-motion or frame-by-frame review for substantial animation
- Real-device review for touch gestures when practical

Deliver a concise design diff: what changed, why it improves the experience, and any optional polish left.

## Hold the line

Prefer a product-specific composition over a generic SaaS hero and card grid.
Prefer plain layout over dashboard-card mosaics, selective accents over pill soup,
and hierarchy over borders on every region. Use component libraries as primitives,
not as the art direction. Make mobile a composition, not a collapsed desktop.

## Litmus

- Is the product or task unmistakable in the first screen?
- Is there one dominant visual or working element?
- Can the product UI be understood by scanning nouns, states, numbers, and actions?
- Does every visible sentence help the user decide, avoid an error, or recover?
- Does every section have one job?
- Does motion make the interface easier to feel or understand?
- Would the composition still hold together without shadows and gradients?
- Does mobile feel designed rather than accommodated?
