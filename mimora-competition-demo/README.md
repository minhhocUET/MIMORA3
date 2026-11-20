# MIMORA Competition Demo

An independent, frontend-only, synthetic-data demonstration of the MIMORA Box-based learning ecosystem.

## Run locally

Requirements: Node.js 18+.

```bash
npm start
```

Open `http://localhost:3000`.

There are no npm dependencies, API keys, database connections, external authentication services, or migrations.

## Demo walkthrough

The start screen has exactly four role choices:

1. Học sinh
2. Phụ huynh
3. Giáo viên
4. Quản trị viên

### Suggested competition journey

1. **Quản trị viên:** open `Hàng đợi phê duyệt`, preview the pending item, then choose `Phê duyệt & xuất bản`.
2. **Giáo viên:** open `Thư viện nội dung` to see the new item. Switch between `Cô Mai · Giáo viên` and `Thầy Nam · Quản lý trường`. Create a Class Box or inspect the School Box hierarchy and teacher permissions.
3. **Học sinh:** choose Minh Anh or Bảo An. Open a Box and interact with the six steps inside Chapter 1. Try Read-Aloud and AAC.
4. **Phụ huynh:** open `Kích hoạt bộ thẻ` and enter `MIMORA-DEMO-2026` to provision a synthetic Student with a Default Box. Review the linked children and their descriptive progress.

## What is simulated

- Role access is a local demo persona selector, not real authentication.
- All content, students, licenses, activation codes, Box membership and progress are synthetic and stored in browser localStorage.
- The activation code `MIMORA-DEMO-2026` is a demonstration-only code.
- Completing a learning step updates local demo progress only. No production database is contacted.
- `Reset Demo` restores the initial scenario in the browser.

## Important

This project is separate from the MIMORA production application. Do not use it to store real student information or represent simulated features as production-connected services.

## Demo roles and scenario

- **Student:** switch between Minh Anh (Default Box + Class Box) and Bảo An (Default Box only).
- **Guardian:** view linked children, activate the synthetic card deck, and see descriptive Chapter 1 progress.
- **Teacher:** use the Cô Mai persona to manage a Class Box; switch to the Thầy Nam persona to manage the School Box and teacher permissions.
- **Platform Admin:** review and publish the pending SEL item, inspect Box structure and synthetic licenses.

The app intentionally shows exactly one learning chapter:

**Chương 1 — Nhận diện cảm xúc và nhu cầu của bản thân**

Its six internal steps are not separate Chapters.

## Validation performed for this delivery

- `node --check app.js` — passed.
- `npm run build` — passed (static project; no compilation step is needed).
- Static server HTTP response — `200 OK`.
- Headless Chromium interaction checks — role selection, card activation, Admin publish, Teacher Box creation, School Box class creation, Student learning progress, Guardian progress, and Teacher student-join approval passed.
- Responsive viewport check at 390px — no horizontal page overflow on the welcome and Guardian overview screens.
- No uncaught browser page errors in the exercised flows.
