# BijakLearn Junior — integrated development PWA

**This is a development release, not a student-ready production service.** It contains the subject catalogue for Tahun 1–6 across SK, SJKC, SJKT, with initial draft lessons only for a subset of Year 1. See `docs/PRIMARY_SUBJECT_MATRIX.md`. Authentication, billing and progress are **demonstration only** on the Cloudflare-hosted PWA. A production-secure PWA-to-Apps Script API bridge has **not** been completed.

```bash
npm install
npm test
npm run dev
npm run build
```

The client PWA is deployed from `dist/`; Google Sheets is the single planned system of record; Apps Script is the backend for its *separate HTML-service deployment*. To use Apps Script directly you must configure Google ID client, spreadsheet Script Properties and build `dist-gas/` per `scripts/package-gas.mjs`. The static Cloudflare PWA **does not** authenticate to Apps Script yet.

**Do not store real student details or payment evidence until privacy/security review is finished.**

# BijakLearn Junior v6 — Year 1 Mathematics curriculum pilot

## What is included

This package extends v5; it does **not** replace or complete the full Malaysian Years 1–6 curriculum. It adds **29 original draft lessons** and **116 associated draft assessment questions** across the eight KSSR Semakan Tahun 1 Mathematics topic areas. Previous demo lessons remain, bringing the number of Year 1 Mathematics example/draft lessons to 35. The full primary catalogue, teacher review, full visual asset library, genuine multilingual lessons and production security testing remain incomplete.

Each added lesson includes a child-friendly explanation, illustrated/visual example *description*, three teaching steps, a three-branch text mind map, and four assessment prompts: choice, independent numeric entry, real-life application and explanation. Illustrations are emoji/simple cards, not a finished image or animation library.

**Content status:** `DRAFT_TEACHER_REVIEW`. Curriculum codes were mapped from published KSSR documents but must be validated by qualified subject teachers, especially against any applicable alignment updates and SK/SJKC/SJKT differences. No approval status is fabricated. Do not use unreviewed items for consequential learner progression.

## Local demonstration

```bash
npm install
npm test
npm run dev
```

The local demonstration does not persist verified student progress. The hosted Apps Script Google Sign-In version is separate and must be deployed and security-tested.

## Google Sheets backend import (owner only)

1. Make a backup of your existing spreadsheet.
2. Configure `SPREADSHEET_ID`, `GOOGLE_CLIENT_ID` in Apps Script project properties, and verify script permissions.
3. Replace Apps Script `Code.gs` with the packaged upgraded version.
4. From the editor, run `initializeDatabase()` if setting up a new spreadsheet.
5. Run `importCurriculumV6()` from the Apps Script editor. It adds missing lessons, questions and SkillMap entries without overwriting existing rows.
6. Review `SkillMap` entries marked `DRAFT_TEACHER_REVIEW` and test the entire student quiz flow with test accounts.
7. Run `importCurriculumV6()` again to confirm it returns zeros (idempotency).

CSV mirrors in `content/` are for audit, teacher review and controlled importing. Do not blindly paste duplicates into the live spreadsheet. **Never publish student data or financial/scholarship documents in GitHub.**

## PWA constraints

The PWA frontend is configured for an HTTPS host (such as Cloudflare Pages). The Apps Script `google.script.run` backend works only inside Google Apps Script HTML Service; a Cloudflare-hosted PWA still needs the separately designed secure bridge. Therefore Cloudflare deployment presently runs in **local demo mode**, not as a live production subscription app.

## Security/production blockers

- Secure PWA-to-Apps-Script login/API bridge has not been completed.
- Children presently share a parent-signed-in session; dedicated parent/student identity separation is needed.
- Full curriculum, original graphic assets, translations and teacher-approved answers have not been produced.
- Apps Script / Sheets throughput has not been load tested.
- Parent PIN security, scholarship application privacy and anti-cheating need a formal production review.
- Browser install and actual device testing are not yet complete.

## Sources and copyright

Curriculum reference (do not republish): https://asiemodel.net/wp-content/uploads/2022/08/34-DSKP-KSSR-Semakan-Matematik-Tahun-1.pdf
Topic structure confirmed against DSKP: Nombor Bulat Hingga 100, Operasi Asas, Pecahan, Wang, Masa dan Waktu, Ukuran dan Sukatan, Ruang, Pengurusan Data. All lesson wording and questions here are newly drafted, not a copied textbook.

## QA

`npm test` verifies basic content consistency, all eight areas, unique lesson IDs, question answer presence, mastery logic and PWA metadata. Passing source tests is **not** equivalent to teacher approval or a deployable production service.