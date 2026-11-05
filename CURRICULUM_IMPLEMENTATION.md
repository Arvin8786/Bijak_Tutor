# BijakLearn Junior v5 — Current syllabus, skill-first architecture

## Implementation summary

- Adds a **versioned** Tahun 1 Matematik (SK) skill map in `content/primary/tahun-1/matematik/skill-map.json`.
- Six sequenced skill pathways, four NEW original demonstration lessons for counting/quantities/number matching/order; two earlier sample lessons for adding and subtracting.
- Each lesson uses visual/short steps, a mind map, four questions in different modes and a transfer task.
- Skill-level standards and prerequisites are separate from lesson identifiers. Changing syllabus standards does not require replacing lesson IDs.
- Learning map in React now shows objectives, reference standards and prerequisite links.
- Apps Script adds `CurriculumVersions` and `SkillMap` worksheets, seeded only when absent; existing parent/attempt records are preserved.

## Existing Google Sheet upgrade

1. Back up the existing spreadsheet securely; never place it in a public GitHub repository.
2. Deploy updated `apps-script/Code.gs` with the normal Apps Script process.
3. In the Apps Script editor run `upgradeCurriculumV5()` under the admin account. It creates the two new tabs, preserves previous records, and seeds any absent demonstration lessons and questions.
4. Check `CurriculumVersions` and `SkillMap` sheets. Items remain `DEMO_NOT_REVIEWED`; a qualified curriculum reviewer should confirm standards and questions before enabling them for real students.
5. No Google Sheets dataset, student information, credentials or answer keys should be committed into GitHub.

## Source documents

- KPM-domain DSKP directory: https://sites.google.com/moe-dl.edu.my/dskpskfp1/tahun-1
- Document Penjajaran KSSR (Semakan 2017) Edisi 3 for Year 1 Mathematics: https://ecentral.my/wp-content/uploads/2024/09/DOKUMEN-PENJAJARAN_KSSR-MATEMATIK-TAHAP-1_EDISI-3-compressed.pdf

**Important:** The learning activities are our own demonstrations. The skill mapping is based on publicly listed KSSR/penjajaran standards and is not a claim of complete curriculum coverage. DSKP and Edisi 3 sometimes organise standards differently. Check the version and exact standard wording before publication; SJKT/SJKC versions require independent confirmation.

## Future syllabus transition

Keep `skillId` and `lessonId` stable. Add new rows to `CurriculumVersions` for future curricula; insert revised mappings in `SkillMap` with a distinct version key. Do not overwrite historic mappings or past student mastery. For the production migration, upgrade the mapping key to `(skillId, versionId, school)` rather than treating `skillId` as globally unique, and allow multiple standards per skill.

## Current PWA integration limitations

The Cloudflare-hosted installable PWA still runs in transient demo mode; no live Sheets data is persisted there. Apps Script has functioning source for its hosted version, but production Google login and security have NOT been validated end-to-end. The trusted API bridge, child-specific sessions and server-side master progression gating remain prerequisite tasks before use with real students.

## Development

`npm install && npm test && npm run build` (Node 20+). Run without Google credentials for the public demonstration interface.

## Verification performed in this environment

- 9/9 Node built-in test cases passed (`npm test`).
- Apps Script source parsed successfully as JavaScript using Node's syntax checker on a temporary `.js` copy.
- Full Vite production build could not be run: npm package installation could not contact the registry (`EAI_AGAIN`). This package must be built and browser-tested on a machine with working npm access before deployment.