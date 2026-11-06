# ProEase Studio™ / BijakLearn — production security boundaries

**ProEase Studio™** is an attribution requested for this product. The ™ symbol makes no claim of registered trademark status; do not use ® without an actual registration.

## What is protected, and what is visible

The current GitHub Pages site is a **public, static learning preview**. Any HTML, CSS, JavaScript, embedded preview questions and data sent to a visitor's browser can be inspected, copied or reverse-engineered. Changing the URL, minifying or obfuscating the JavaScript, or hiding GitHub navigation cannot prevent this.

The connected **BijakLearn Master DB — Development** spreadsheet is owner-only at the time checked. It now contains `ModuleCatalog` and `ModuleLessons` tabs. The four new module records and 24 introductory lessons are public-preview learning content; they are duplicated in the public PWA for immediate offline usability. **Nothing stored in a public bundle is a protected business secret.**

Proprietary advanced courses, subscriptions, parent and child data, payment references and unreleased assessments should reside ONLY in **owner-restricted backend services and private data stores** and be served after identity, authorisation, plan and curriculum-review checks. Do not store API keys in Sheets: Google Apps Script Script Properties or Google Cloud Secret Manager is more appropriate.

The separately deployable Apps Script backend includes `ModuleService.gs`:
- `getGrowthModule(token, moduleId)` validates a Google identity token and server-side plan entitlements, then reads module content from the private Sheet.
- It does not return correct quiz answers to the browser. `checkGrowthAnswer(token, lessonId, selectedOption)` checks the private answer server-side.
- Private/paid lessons require recorded educational approval before being released.
- Both methods require a separately deployed Google Apps Script HTML-service application with correct OAuth settings and script properties. **The public GitHub Pages app is NOT connected to private learner accounts or premium content.**

## Important limitation: publicly visible backend source

The current GitHub repository is public and contains `apps-script/*.gs` and public learning starter logic. Its source may have been cloned or indexed. A private Sheet does **not** make publicly committed Apps Script source proprietary.

To restrict future source-code access:
1. Create a **private ProEase Studio backend repository** or owner-only Apps Script project.
2. Move proprietary backend modules, account verification, scoring logic and private lesson generators into that private source of truth.
3. Remove private backend source from future commits to the public frontend repository. Update build/CI to deploy the backend from its private project; do not remove source before a secure deploy pipeline exists.
4. Rotate any credentials that were ever committed; deleting the file from current Git history does not invalidate leaked keys or erase prior clones, forks and caches.
5. Keep public frontend/preview content in a separate public project or deploy built assets from a private source repository using authorised CI credentials and minimal permissions.
6. Add security review, monitoring, access expiry, backups, account deletion, staff roles and audit logs before processing children's real data.

Public apps are inherently replicable at the user-interface level. Licences, contracts and intellectual property enforcement complement server-side protection, but there is no technical switch to make browser code unreadable.

## Automatic releases and old PWA versions

The GitHub Actions `deploy-pages.yml` workflow publishes **automatically on every `main` push**. The build now generates `dist/release.json` with the commit revision and stamps the service worker cache identity. The app checks for a new release on startup, focus, and foreground/resume, asks the browser to update its worker and reloads once when a new version is found. Hashed JS/CSS assets remain safely cached; stable files such as the app icon and manifest use network-first fetching.

For an already installed copy built **before** these update mechanisms existed, the user may need to open the published URL in Safari/Chrome once, close and reopen the older installed app, or remove/reinstall its home-screen shortcut once. This cannot be retroactively fixed by JavaScript that the old copy has not downloaded yet.

## Pre-release checklist

- [ ] Confirm the Sheet remains owner-only and restricted sharing is enforced.
- [ ] Rotate or remove any historical credentials (never assume a string scan catches all of them).
- [ ] Move proprietary backend source to a private project and disable public changes to it.
- [ ] Verify Google ID-token audience and child-parent ownership server-side.
- [ ] Require human review and appropriate parental consent for children's personal data.
- [ ] Keep paid assessment answers server-side, with rate limits and suitable replay protection.
- [ ] Run `npm test`, `npm run build`, browser tests and `npm run check:public`.
- [ ] Check successful Pages deployment and `release.json` revision; test an installed iOS/Android app after a second release.
- [ ] Do not advertise full official syllabus approval, AI guarantees or secure payments until verified.

**Do not add actual secret keys, bank details, real children's identifiers or documents to this public repository or to an unapproved prompt.**
