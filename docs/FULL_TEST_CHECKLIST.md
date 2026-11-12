# BijakLearn Junior test checklist

Record the release commit, host URL, device, browser version and whether the app was opened as a browser tab or installed PWA. Use fictional practice profiles and a fresh browser profile for the first visit.

## Automated checks

Use Node.js 22 from the repository root.

```sh
npm install
npm test
npm run build
npm install --no-save playwright@1.56.1
npx playwright install chromium
node tests/browser-smoke.mjs
```

On Linux CI, use `npx playwright install --with-deps chromium` to install system dependencies as well. The browser suite serves the unchanged production bundle under `/Bijak_Tutor/`, exercises three viewport widths, and checks an offline reload after a fresh service worker install. Check the build’s curriculum report in `release/CURRICULUM_COVERAGE.json`.

## Manual acceptance

| Area | What to try and what to expect |
| --- | --- |
| First visit and accessibility | Open in mobile Safari, Android Chrome and a desktop browser. Change the welcome language, navigate using touch and keyboard, and verify visible focus and readable content without sideways scrolling. Check core navigation in Malay, English, Chinese and Tamil. |
| Study library | Browse SK, SJKC and SJKT across Years 1–6. Choose Matematik or Sains and search for **Ulang Kaji Berpandu**. Open a worked example and check that its teaching steps, answer feedback and retry state make sense. Try a search with no results and clear it. Verify that changing streams excludes lessons intended for another stream. |
| Practice | Complete a Quick Quiz and a Daily Challenge, including wrong and correct answers. Verify the final score, retry the Daily Challenge, and confirm the questions stay the same that day. Reveal a flashcard and follow its lesson link. |
| Learning paths and labs | Start the Year 1 Addition Lab path. Read a lesson, complete the lab, finish its quiz with one deliberate mistake, then retry the missed question. Verify Continue Learning opens the latest lesson, counters stay accurate, and a second fictional profile has independent progress. With device saving enabled, check persistence across reload and clearing. Try the clock past 12, an equivalent fraction on the number line, and both outcomes of the shadow prediction. |
| Physical device pass | On an iPhone and Android phone, follow the addition path with touch and a screen reader. Adjust both counter sliders and read the feedback. Check the clock buttons, read-aloud instructions, and an offline reopen from the installed app. Record the device, OS, browser and observed result. |
| Playground and preschool | Open all 19 Playground modes. Try a wrong and a correct answer in games that score, then advance to the next round. Complete a word search, spelling round, life cycle and picture puzzle. Test touch drawing, clear/reset and audio when a browser voice is available. |
| Word Tiles vs Bot | Play a valid word, repeat a used word, attempt an invalid word, switch language, and try the bot difficulties. Check points against the tile values and verify a new rack is playable. |
| Other public flows | Open Learning Packs, a linked lesson, Study Buddy, both learning studios and the membership comparison. Check an arithmetic explanation, a knowledge check and the hobby planner. Add a fictional profile, opt into storage, reload and clear the profile. |
| PWA startup and update | Install or visit online until the service worker activates. Reopen offline and confirm the study library loads. Reconnect and check the current release in `release.json`. On a device with an earlier install, verify that the app picks up the new release when reopened. |
| Authenticated integration | Use a separate Apps Script test deployment with test accounts and private test sheets. Check family access, PIN restrictions and server-side scoring. The public Pages test suite exercises the guest experience. |

The optional Iban, Kadazandusun and Semai catalogue entries await source material and fluent reviewer input. Log defects with the steps, expected and actual result, device/browser and any relevant console error.

### Educator review pilot

Start with **Home → Explore learning paths → Addition Lab**, a Year 1 path containing **Tambah dengan Objek**, **Pasangan rahsia untuk membuat 10**, and **Tambah dengan melengkapkan sepuluh**. A reviewer should compare the objectives against the curriculum references for the chosen school stream, verify every worked example and answer, check age and language suitability, then try Learn, Play, Quiz and Review as a pupil. Record the release, lesson IDs, reference, reviewer, date, and any corrections. Record approval only after the reviewer completes those checks.
