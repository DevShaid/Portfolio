# Audio for Slide Transitions — Implementation Plan

## Approach: Web Audio API Synthesis (zero external files)
Generate all sounds programmatically using the Web Audio API. No MP3s, no CDN, no loading — instant, lightweight, and fits the premium aesthetic.

## Sounds

| Trigger | Sound | Character |
|---------|-------|-----------|
| **Slide transition** (scroll/dot/keyboard) | Soft whoosh | Filtered noise sweep, airy, 0.4s |
| **Hero entrance** (page load) | Deep tonal hit | Low sine + sub-bass, warm impact, 0.6s |
| **Page nav click** (leaving a page) | Subtle exit sweep | Quick reverse whoosh, 0.2s |

All sounds are quiet, ambient, and non-intrusive — volume ~15-25%.

## Implementation in `script.js`

### 1. New `SFX` module (top of IIFE, after utilities)
- Creates `AudioContext` lazily on first user interaction (required by browser autoplay policy)
- Three methods: `sfx.whoosh()`, `sfx.tone()`, `sfx.exit()`
- Each method builds an audio graph from oscillators/noise → filters → gain → destination
- Master volume control

### 2. Hook into existing code (3 integration points)
- **`goToSlide()`** — call `sfx.whoosh()` when a slide transition starts
- **`animateAboutSlideshow()` / `animateExperienceSlideshow()` / `animateContact()` / `animateHero()`** — call `sfx.tone()` on hero entrance
- **`initPageTransitions()` link click** — call `sfx.exit()` on page nav

### 3. Files changed
- `script.js` only — no HTML/CSS changes needed
