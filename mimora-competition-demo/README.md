# MIMORA Competition Demo

A standalone, frontend-only interactive demonstration of the MIMORA learning ecosystem. All records are synthetic and stored in the current browser using localStorage.

## Product journey

- Exactly four entry points: **Học sinh**, **Phụ huynh**, **Giáo viên**, **Quản trị viên**.
- Student home separates **Học cùng thẻ vật lí** and **Lớp học của con**.
- Chapter 1 appears only inside the official MIMORA physical-card learning area. Teacher-created class activities are presented as class activities, not as the Default Class Chapter 1.
- Every class has a warm, editable **Lời hẹn của lớp mình** section with class-specific criteria.
- Student learning is one step at a time, with optional AAC, Read-Aloud, large text, a pause/resume flow, and calm/playful/high-contrast display preferences.
- Guardian view includes product activation simulation, linked student accounts, descriptive progress, Care Insights mock data, and one separate message thread per child who has an assigned Teacher.
- Teacher view includes class management, class-specific criteria, student support context, scoped permission controls, school management mode, and parent communication.
- Admin view includes SEL content library, approval/publishing, school/class overview, and license administration.
- Interactions share one coherent local demo state. Reset Demo restores the initial scenario.

## Care Insights and messaging

Care Insights is an illustrative, deterministic summary of synthetic participation counts. It is **not a live AI model**, diagnosis, psychological assessment, or prediction of a child's emotional or health condition. It avoids interpreting student answers or private communication.

Messages are mock conversations stored in the current browser. Guardian–Teacher threads appear only for children who have a Teacher assigned in a class. Each thread is scoped to one child.

## Accessibility and child-centred interaction

- No scores, leaderboards, countdowns, or punitive feedback.
- Children can pause and resume without penalty.
- Optional AAC choices and browser Read-Aloud.
- Calm, playful, and high-contrast display modes.
- Large text and reduced motion controls.
- Background music and click sounds are opt-in and off by default.

## Run locally

```bash
npm start
```

Open <http://localhost:3000>.

## Build for Vercel

```bash
npm run build
```

Vercel settings:
- Framework Preset: Other
- Build Command: `npm run build`
- Output Directory: `public`
- Root Directory: the folder containing `package.json`, `vercel.json`, and `index.html`

## Important demo limitations

- This is an independent interactive prototype, not the production MIMORA system.
- No production backend, TiDB database, email verification, payments, or real authentication are connected.
- All account, license, class, activation, progress, AI insight, and messaging behavior is simulated in browser state.
- Do not enter real child information.
