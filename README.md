# BijakLearn Junior — Primary & Preschool learning platform

**BijakLearn Junior is a ProEase Studio™ learning platform, deployed on GitHub Pages with Google sign-in and a private Apps Script/Sheets backend. Learning materials remain under educator review.**

The repository contains interactive preschool modules, a primary-school study library for Tahun 1–6 and three school streams, a virtual science lab, learning games, and separate parent and administrator consoles. The deployed app uses verified Google accounts and server-enforced family access. An explicit local demonstration mode is available for development testing.

## Run the learning app

The production site opens parent, student and administrator Google sign-in on the GitHub Pages URL. An origin-restricted Apps Script transport handles private backend requests. Configure its public service URL as `VITE_ACCOUNT_APP_URL`; see the [role portal guide](docs/ROLE_PORTALS.md). Local development includes an explicit demo entry for testing.

```bash
npm install
npm test
npm run build
npm run dev
```

Deploy `dist/` to GitHub Pages via the existing workflow. The optional *Remember demo progress* toggle saves fictional demo profiles and scoring history only in the current browser. The **Clear demo progress** button deletes the local copy.

## Tier access and Premium Kasih

See [Google Sheets, tier rules and OAuth setup](docs/TIERS_AND_GOOGLE_SETUP.md). The generated Apps Script package imports the app’s 18 modules into `ModuleAccess`, enforces Free/Premium/Premium Kasih permissions, and provides private sponsorship applications with document review. Run `setupBijakLearn_` in your bound Apps Script project to populate the existing workbook; setup preserves existing module rules. Real OAuth credentials and deployment still require the Google account owner.

Parents can link a child's separate Google account from their portal; administrators can correct, disable, restore or remove links. Students inherit their family’s available tier and cannot access parent reports, account administration or sponsorship documents. See [connected account records](docs/ACCOUNT_RECORD_SYNC.md).

## Backend deployment and teacher-review requirements

See [Operational release guide](docs/OPERATIONAL_RELEASE.md) for the separate Google Apps Script deployment, full curriculum import, owner-only membership/scholarship administration and security requirements. Build generates `release/CurriculumData.gs`, `release/CurriculumImport.gs`, `release/AdminOperations.gs` and `release/CURRICULUM_COVERAGE.json`.

The build generates the current lesson and assessment counts in `release/CURRICULUM_COVERAGE.json`. To test the compiled app, use the [full test checklist](docs/FULL_TEST_CHECKLIST.md). Guided Mathematics and Science review lessons for Years 1–6 are listed under **Ulang Kaji Berpandu**. Qualified educators should review materials before classroom use.

Private account, assessment and payment-evidence requests use the authenticated Apps Script backend. Static lesson assets remain publicly downloadable from this repository. Local demo data stays in the browser. Passing automated checks does not constitute educator approval, an independent security audit or a production capacity test.

---
## Earlier development notes (historical)
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

