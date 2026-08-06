# URVI ARCHITECTS

A cinematic, scroll-driven interior architecture film. One continuous timeline,
no pages, no autoplay — every frame of video and every piece of motion is
advanced by the reader's scroll position.

---

## Run it

```bash
npm install
npm run dev
```

Then open the printed localhost URL. Production build:

```bash
npm run build
npm run preview
```

> **Note on repo size.** Both video renditions are committed directly (~230MB
> total), so a clone is self-contained and the site runs immediately. If the
> history ever gets heavy from re-encodes, move `public/assets/videos/**/*.mp4`
> to Git LFS at that point.

---

## The timeline

The whole site is one camera move, cut into eight pinned chapters:

| # | Chapter | Clip | What the scroll drives |
|---|---------|------|------------------------|
| — | Hero | `hero-chair` | Chair rotates, explodes, reassembles, then lifts out of frame |
| 01 | Living Room | `living-table` | Table scales; lighting drifts cool morning → warm afternoon |
| 02 | Kitchen | `kitchen-island` | Island rotates; perspective tilt settles; contact shadow tightens |
| 03 | Bedroom | `bedroom-bed` → `pendant-light` | Bed assembles, curtains part, then the pendant descends |
| 04 | Materials | *(live WebGL)* | Cube rotation and the highlighted label share one progress value |
| 05 | Blueprint | `blueprint-villa` | Drawing extrudes; the 3D massing model builds on the same clock |
| — | Finale | `villa-assembly` | Villa assembles; three statements rise through one optical centre |
| — | Contact | — | Released from the pin; the wordmark draws itself up |

---

## How the hard parts work

### Scroll-scrubbed video that doesn't stutter

Naive scrubbing sets `video.currentTime` on every scroll event. Three things go
wrong, and `src/hooks/useScrollVideo.js` addresses each:

1. **Seek storms.** Assigning `currentTime` faster than the decoder can serve
   frames queues seeks and the element stalls. The hook keeps a *target* value
   and commits at most one seek per frame, and only once the previous `seeked`
   event has fired.
2. **Sub-frame thrash.** Requests are quantised to the source frame grid, so
   micro-scrolls don't trigger decodes that produce an identical picture.
3. **Cold start.** No `src` is attached until the element is within 120% of the
   viewport; it is then primed to frame 0 so the first scroll pixel already has
   a decoded frame to show.

The encoding matters as much as the code. Every clip is re-encoded at `-g 1` —
**every frame is a keyframe.** With a normal GOP, seeking to an arbitrary time
forces the decoder back to the previous I-frame and re-decodes forward; that
latency *is* the stutter people mean when they say scrubbed video feels broken.
It costs roughly 3× the bitrate and it is the correct trade here.

### One RAF loop

Lenis is driven from GSAP's ticker rather than its own `requestAnimationFrame`.
Two RAF loops means scroll position and animation state are read on different
frames, which is a permanent, un-debuggable source of micro-jitter.

### No renders on scroll

Pointer position (`usePointer`) and scroll state (`useScrollStore`) live in
mutable module objects, not React state. The 3D scene and the chrome read them
inside their own frame loops. A scroll frame can therefore never schedule a
React render — the only `setState` calls in the whole film are the active
material index and the active chapter name, both of which change a handful of
times across the entire page.

### One camera, one scene

`components/three/Scene.jsx` holds a single persistent canvas. Chapters declare
a shot (position, target, FOV); the camera *damps* toward the active one, so
chapter changes read as a continuous move rather than a cut. Objects are gated
per chapter and scale in and out rather than appearing.

### Two video renditions

`lib/assets.js` picks a tier at load from viewport width, `deviceMemory`,
`hardwareConcurrency`, and the Network Information API (`saveData`,
`effectiveType`). Desktop gets 1080p; phones, low-memory devices, and
data-saver users get 720p — so the story is never gated behind a 157MB download.

---

## Structure

```
src/
  components/          Reusable primitives
    three/             Scene, objects, GLSL shaders
    Chapter.jsx        Pinned section wrapper
    ScrollVideo.jsx    Scroll-scrubbed <video>
    SplitText.jsx      Dependency-free char/word/line splitting
    Reveal.jsx         rise | clip | scale | lines
    Nav.jsx            Fixed chrome, inverts on dark chapters
    Preloader.jsx      Overture; gates scroll on real buffer state
  sections/            The eight chapters
  hooks/               useLenis, useScrollVideo, usePointer, useScrollStore
  lib/                 gsap config, asset manifest, material data
  styles/              Tailwind layer + type scale
public/assets/
  videos/hd/           1920×1080, CRF 16, all-keyframe
  videos/sd/           1280×720,  CRF 16, all-keyframe
  images/              Stills, used individually — never composited
```

---

## Typography

The display face is **Instrument Serif**, standing in for **Canela** /
**PP Editorial New**, which are licensed. To go fully brand-accurate, drop the
licensed `.woff2` files into `public/assets/fonts` and replace the
`font-display` stack in `tailwind.config.js` and the `@font-face` block at the
top of `src/styles/index.css`. Body copy is **Inter**, standing in for
**Neue Montreal**.

---

## Motion rules

Nothing appears — everything arrives, via some combination of fade, blur, scale,
rotation, slide or clip. Easing is `cubic-bezier(0.16, 1, 0.3, 1)`: a fast
departure and a long, decelerating tail. Only `transform`, `opacity`, `filter`
and `clip-path` are animated, so no animation in the project can trigger layout.

Reduced motion is respected: Lenis is skipped, pin durations shrink to 35%,
camera movement is damped to a quarter, and the grain overlay is removed. The
storytelling is preserved — it is adapted, not stripped.

---

## Palette

| | |
|---|---|
| Background | `#F7F5F2` |
| Text | `#151515` |
| Accent | `#A98D67` |
| Secondary | `#D8CEC0` |
| Dark | `#101010` |
