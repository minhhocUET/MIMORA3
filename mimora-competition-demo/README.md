# MIMORA Competition Demo

A standalone, frontend-only interactive demonstration of MIMORA. All records are synthetic and stored in the current browser using localStorage.

## Features

- Four entry points: Student, Guardian, Teacher, Platform Admin.
- Student workspace separated into **Học cùng thẻ vật lí** and **Lớp học của con**.
- Official MIMORA physical-card learning space with Chapter 1 (six interactive steps).
- Class-specific warm criteria headers.
- Guardian AI-style engagement summaries based only on synthetic participation frequency. These are illustrative signals, not psychological or medical predictions.
- Separate Guardian–Teacher message threads for each child.
- Optional original UI click chimes and a gentle generated ambient note sequence. Both are off by default and require user opt-in.
- Local demo state, Reset Demo, no production APIs, no database, no API keys.
- Vercel static deployment (`npm run build` -> `public/`).

## Run locally

```bash
npm start
```

Open <http://localhost:3000>.

## Build for Vercel

```bash
npm run build
```

Set Vercel:
- Framework Preset: Other
- Build Command: `npm run build`
- Output Directory: `public`
- Root Directory: the folder containing `package.json`, `vercel.json`, and `index.html`

## Demo notes

- Student, Guardian, Teacher, and Admin experiences are front-end simulations.
- Parent–teacher messages remain in local browser state; they are not sent to a server.
- AI-style notices demonstrate activity-participation trends only. They do not infer emotions, diagnose, or assess SEL progress.
- Audio uses Web Audio-generated tones; sound effects and background notes are disabled until explicitly enabled.

## Joyful visual and audio update

- Original local SVG illustrations are stored in `assets/` and copied into the Vercel static output by `build.cjs`.
- The optional background track is **“Happy Loop” by wipics**, sourced from OpenGameArt and listed as CC0/Public Domain on its asset page: https://opengameart.org/content/happy-loop
- The track only starts after the visitor selects the music control. If the external audio host is unavailable, the demo falls back to a lightweight cheerful melody synthesized locally with Web Audio.
- Music attribution is shown in the page footer for provenance, although the CC0 dedication does not require attribution.
