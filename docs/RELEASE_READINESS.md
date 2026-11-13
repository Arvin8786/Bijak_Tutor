# Release review — 13 November 2026

The public learning pilot can be published after the automated build and browser gates pass. This is not sign-off for paid subscriptions, real student records, a complete KSSR course, or educator-approved teaching material.

## Findings and corrections

- Study Buddy previously extracted the first binary calculation from a longer expression. `2 + 3 × 4` could incorrectly produce `5`. It now parses the complete expression with brackets and arithmetic precedence, rejects unsupported input, and labels rounded division results with `≈`.
- Numeric answers previously used exact text comparison. Numeric questions now accept valid equivalent numeric forms; fraction-equivalence exercises explicitly allow equivalent fractions. Exercises asking for a particular representation retain strict marking. Public practice and the generated Apps Script helper share the same rules.
- Six repeated question prompts occurred within supplementary maths quizzes. Their generated examples are now distinct, with a regression check for every lesson.
- Forty Year 2–6 maths exercises previously displayed a generic answer-check message. Their feedback now explains the applicable method, including equal groups, regrouping, fraction equivalence, perimeter, area and volume.
- A generated “write the first answer” recall exercise could count as independent written evidence. It is now explicitly a choice-based recall task. Recall is not independent mastery.
- Practice Arena answers were omitted from the missed-question review queue. Lesson-linked attempts now use the same local practice history as lesson quizzes. Standalone challenges have no lesson link and are not added to that queue. Live-account assessment remains server-controlled.
- Lesson quizzes now show a worked answer after a mistake, offer a next lesson where one is available, and display the draft-review status in the reader.
- Deployment previously ran alongside browser checks. The Pages deployment now runs the production browser suite before uploading/publishing, so a browser failure blocks that release.

## Content inventory and limits

The repository contains 804 authored lessons, 2,395 lesson questions and 78 additional challenges. The content audit checks every lesson for required reading material, valid answers/choices, unique question prompts/IDs and reachability through the year/stream subject catalogue. It also mechanically checks 117 direct arithmetic expressions. These checks do not verify all contextual word problems or all factual and language claims.

There are 720 generated recall/recognition questions. Repeated supplementary topics across years are enrichment, not proof of distinct year-level official syllabus coverage. All content remains draft; there are zero teacher-approved lessons. Eighteen catalogue combinations have no materials: Iban, Kadazandusun and Semai in SK Years 1–6. These remain visibly unavailable rather than invented language lessons.

`npm run build` produces `release/CONTENT_QUALITY.json` and `release/CURRICULUM_COVERAGE.json`. The reports identify structural failures separately from educational sign-off. `npm test` includes negative fixtures proving that wrong arithmetic answers and duplicate prompts fail validation.

## Verification and remaining acceptance

Run `npm test`, `npm run build`, and the production browser suite. The browser suite exercises 375, 768 and 1280 pixel widths, subject/lesson navigation, games, labs, on-device practice and clearing, Study Buddy arithmetic, the review queue, offline startup and simulated account activation/blocking. GitHub Actions provides the browser environment.

Before a school or commercial launch:

1. Have qualified educators review objectives, language, examples and assessment answers for each subject/year/stream against the applicable curriculum sources. Record the reviewer and reference; do not infer approval from automated tests.
2. Complete the physical iPhone/Android and screen-reader checklist in `FULL_TEST_CHECKLIST.md`; desktop Chromium viewports do not substitute for physical-device acceptance.
3. Deploy the generated Apps Script package to a private test service, configure the administrator, and run the documented two-account and cross-family tests. Include the new generated `AnswerMarking.gs`; initialize the additive `answerFormat` column. The importer intentionally preserves existing reviewed questions, so old private question rows need an explicit reviewed migration to adopt new drafts/answer rules.
4. Close the existing private-service launch gaps: assessment replay protection, consent/deletion/recovery, production capacity/backups, payment reconciliation and a reviewed identity bridge before connecting private accounts to the public static site.

No private Apps Script deployment, real Google-account test, educator approval or physical-device acceptance is claimed by this source update.
