# BijakLearn Junior — Functional testing guide

This is a **functional content-and-UI test release**. The site runs as a demo with in-browser practice state. It is not a production-ready school application, and its original draft materials are not an official reproduction of KPM textbooks or a completed KSSR review.

## Main testing path

1. Open the published BijakLearn website in Safari/Chrome (phone and desktop).
2. Select **Explore local demo**.
3. Test **🐣 Prasekolah** from the main navigation and from the hero banner.
4. Browse all **Tahun 1–6** using the school-year selector without creating a learner.
5. Change streams among **SK**, **SJKC**, **SJKT** and check that the subject catalogue adapts.
6. Open a subject; open a study topic and confirm explanation, example, three teaching steps and concept map.
7. Switch to **Try the quiz**; test a correct and an incorrect answer, hint feedback, next question and restart.
8. Verify the whole site is responsive at 320, 375, 390, 768, 1024, 1440 pixel widths. Cards should maintain uniform height in each grid row; no text should escape a card.
9. Verify offline installation caching and direct refresh on GitHub Pages at `/Bijak_Tutor/`.

## Preschool coverage

- **ABC explorer:** 26 capital and 26 lowercase letters, picture-word pairs, A–Z selector and optional browser speech.
- **Trace & draw:** 26 letter guides, each with capital/lowercase selection; drag your mouse or finger, hide the guide, erase.
- **Capital/small recognition:** alternating uppercase-to-lowercase and lowercase-to-uppercase matching with gentle retry feedback.
- **Spelling builder:** letter tiles for 26 introductory English words; undo, clear, retry and optional spoken word.
- **BM suku kata:** 12 introductory syllables with pictured words and listening.
- **Counting:** interactive 1–20 stars with add/remove buttons.
- **Colours and shapes:** six colour explorations and four shape explorations.
- **Accessibility:** tabs/keyboard for buttons; tracing is a pointer-only practice feature and must not be used as a graded requirement.

These activities are **learning experiences**, not validated age-based developmental assessments. Text-to-speech depends on the device and browser voices installed.

## Junior study library

The repository includes 35 earlier Tahun 1 Mathematics examples plus 144 original draft lessons across BM, English, Maths, Science, Islamic Education, Moral Education, PE/Health, Art, Music, History, RBT, Chinese and Tamil. Every new draft has an explanation, worked example description, teaching steps, a 3-node concept map and multiple practice items. Separate curated mathematics calculations support Tahun 2–6.

Note: this **is not complete subject-by-subject coverage of the official DSKP for all streams and years**. Some optional-language catalog entries have no lessons, and translations/learning objectives still require qualified teachers. No live parent identity, subscription or authoritative assessment persistence is enabled by this release.

## Known limits

- Demo child profiles, quiz answers and mastery are temporary browser state. Do not enter private real child data.
- Canvas tracing is not automatically scored and does not assess letter formation quality.
- Some formative questions deliberately reinforce the same vocabulary and are not reliable independent mastery evidence.
- Browser speech output may be unavailable for Tamil/Malay if the device lacks a suitable voice.
- Google Apps Script HTML-service backend is a separate deployment and not connected to the GitHub Pages demo.
- Content must be reviewed for school stream/year mapping, factual accuracy, grammar and cultural suitability before live enrolment.
- Parent controls and Premium Kasih approval are untested in a production-secure account system.

## Automated checks

GitHub Actions runs `npm test` and `npm run build`. The test suite validates year ranges, lesson IDs, extra question banks, stream catalogues, preschool alphabet data, page wiring and responsive card CSS. Automated tests do not replace hands-on browser tests or teacher review.

## Bug-report template

Record device/browser, school stream/year, subject/topic, exact action, expected result, actual result and screenshot. Avoid sharing children's names, email addresses, identity documents or private learning records.
