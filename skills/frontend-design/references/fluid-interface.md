# Fluid Interface Reference

Use this reference for gesture-driven interfaces, springs, sheets, carousels, direct manipulation, translucent materials, typography, and motion QA.

## Physical contract

A fluid interface:

1. Responds immediately.
2. Tracks the pointer or touch point one-to-one.
3. Starts animation from the current presentation value.
4. Preserves velocity across gesture, animation, interruption, and reversal.
5. Projects momentum toward a plausible resting point.
6. Remains interruptible at every frame.

If any link breaks, the interaction feels like separate scripted states rather than one physical object.

## Response and direct manipulation

- Show press feedback on pointer-down, then commit on release.
- Use Pointer Events and `setPointerCapture` for drags.
- Preserve the offset from where the user grabbed the object.
- Track several recent position/time samples to estimate release velocity.
- Apply a small movement threshold before committing to a drag direction.
- Keep all plausible gesture recognizers active until intent is clear, then cancel the losers.

```js
element.addEventListener("pointerdown", (event) => {
  element.setPointerCapture(event.pointerId);
  const grabOffset = event.clientY - element.getBoundingClientRect().top;
  // Track position and timestamps until release.
});
```

## Interruptibility

- Accept new input during transitions.
- Read the live rendered transform when a gesture interrupts an animation.
- Retarget a spring from its current position and velocity.
- Carry velocity through reversals instead of hard-cutting to a new animation.
- Use independent X and Y springs when axes have different velocities.

CSS transitions and keyframes are suitable for simple state decoration. Prefer a spring or frame-driven animation for anything the user can grab or redirect.

## Springs

Think in:

- **Damping:** overshoot. Critically damped motion settles without bounce.
- **Response:** how quickly the system responds, not a fixed duration.

Starting points:

| Interaction | Character |
| --- | --- |
| Repositioning, menus, routine state change | Critically damped; no overshoot |
| Drawer or sheet released with momentum | Slightly under-damped |
| Flicked or thrown object | Momentum plus restrained bounce |

With Motion:

```js
import { animate } from "motion";

animate(element, { y: 0 }, {
  type: "spring",
  bounce: 0,
  duration: 0.4,
});
```

Reserve bounce for interactions that already carried momentum. Bounce on a passive menu entrance reads as ornament rather than physics.

## Velocity handoff and momentum

The animation after a drag should begin at the pointer's release velocity. Some APIs accept absolute velocity; normalized APIs may require:

```text
relativeVelocity = gestureVelocity / (target - current)
```

Project the likely resting point before selecting a snap target:

```js
function project(initialVelocity, decelerationRate = 0.998) {
  return (initialVelocity / 1000) *
    decelerationRate /
    (1 - decelerationRate);
}

const projected = currentPosition + project(releaseVelocity);
const target = nearestSnapPoint(projected);
```

Use velocity direction as evidence of intent; position alone makes quick flicks feel ignored.

## Boundaries and spatial consistency

- Apply progressive resistance beyond a boundary instead of a hard stop.
- Enter and exit along the same spatial path.
- Set `transform-origin` from the trigger for menus and popovers.
- Make intermediate frames hint toward the destination.
- Keep controls close to the content they affect.

```js
function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) /
    (dimension + constant * Math.abs(overshoot));
}
```

## Materials and depth

Translucency should communicate a floating functional layer:

- Let content move beneath floating navigation, sheets, or toolbars.
- Use heavier material for structural separation and lighter material for controls.
- Scale blur and shadow with surface size.
- Pair modal focus with a scrim; keep parallel non-blocking panels connected without one.
- Animate blur and scale together when a glass surface materializes.
- Prefer a scroll-edge fade or blur to a permanent hard divider.

```css
.toolbar {
  background: rgb(255 255 255 / 60%);
  backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgb(255 255 255 / 40%);
}
```

Keep text over translucent surfaces high-contrast and slightly more robust than text over solid backgrounds.

## Reduced motion and transparency

Reduced motion preserves feedback while removing vestibular movement:

- Replace large slides, parallax, elastic motion, and overshoot with short cross-fades or static state changes.
- Keep color, opacity, and status feedback that aids comprehension.
- For reduced transparency, raise surface opacity and remove blur.
- For increased contrast, use near-solid surfaces and explicit borders.

```css
@media (prefers-reduced-motion: reduce) {
  .sheet {
    transform: none !important;
    transition: opacity 160ms ease-out;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .toolbar {
    background: Canvas;
    backdrop-filter: none;
  }
}
```

## Typography

- Tighten tracking as display text grows; keep body tracking near neutral.
- Use tight leading for large headings and more generous leading for body copy.
- Build hierarchy from size, weight, and leading together.
- Use `rem`/`em` spacing so layout scales with text.
- Prefer system or variable fonts with optical sizing unless brand typography has a clear role.

```css
.display {
  font-size: clamp(2rem, 5vw, 4rem);
  font-optical-sizing: auto;
  letter-spacing: -0.02em;
  line-height: 1.05;
}
```

## Motion QA

- Record at normal speed, then inspect slow motion or frame-by-frame.
- Verify no jump at gesture release, interruption, or reversal.
- Check that visual, audio, and haptic feedback share the same causal moment.
- Keep frame work on `transform` and `opacity`; avoid layout work inside pointer-move loops.
- Test on a low-powered mobile viewport as well as desktop.
- Confirm that reduced-motion mode remains clear and complete.
