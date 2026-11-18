# ZIP review and Sheet-bound setup

Reviewed attachment: ci_cfbb45e3bb4ea5f4.zip, 191 files, about 1.6 MB uncompressed. Compared against production main 7f571cd8bbf88af5d89d9ab019d25172a60c519d. Most archive differences are trailing blank lines, not new functionality. The archive also contains preschool listening, number-bond and float/sink games, a visual refresh, a transport-template adjustment and source-string tests.

Reused the three activities and audio controls, with corrections: a correct answer can award only once per round; a revealed science result locks the prediction; the listening score survives the next round; letter-name speech is not presented as phonics; dry-leaf and wood explanations describe model limits rather than claiming light objects always float. Styling keeps admin/parent layouts separate and honors reduced motion. Browser regressions exercise the actual activities and repeat-click controls. No private files, passwords, executable dependencies or new payment system were taken from the archive.

## Running from the private Google Sheet

Open BijakTutor Database, then Extensions > Apps Script. The Sheet-bound project contains Code.gs, the related backend modules, generated CurriculumData.gs/ModuleData.gs/AnswerMarking.gs, App.html, Transport.html, and SheetSetup.gs. The canonical source remains in GitHub; `npm run build` writes the complete installable folder to `release/sheet-bound/`.

The bound project has a separate manifest granting access only to the current spreadsheet and the signed-in email for its owner check. It does not copy the production PIN pepper, administrator subject, Drive folder properties, external-service secrets or OAuth grants. The existing standalone production endpoint remains responsible for Google login and authenticated private uploads. This avoids changing the published endpoint and asking every family to reconnect. Do not deploy the maintenance project as another public web app.

In the Sheet, the BijakLearn menu provides:
- Check database setup: validates table headers and reports aggregate row counts without displaying individual family or payment records.
- Set up or repair tables: adds missing tables/columns and missing module rules, preserving existing data and operator choices.
- Import missing draft lessons: imports only absent lesson/question IDs and preserves existing content edits and review state.
- Import missing learning tracks: adds absent tracks without overwriting existing rows.
- Open app and production editor: links to the canonical GitHub app and live backend editor.

The same owner commands are selectable in the editor as setupBoundSheet, checkBoundSheet, importBoundCurriculum and importBoundLearningTracks. setupBoundSheet does not reset credentials, approve accounts, verify payments, grant membership or mark lessons teacher-approved. Imports are explicit menu actions, not part of every setup run.

New-project Google authorization is required once for current-spreadsheet access and the owner email check. No billing is introduced, and file sharing is unchanged. Only the verified owner arvin8786@gmail.com can run maintenance, and the container must be the existing database ID. Standalone production still opens its configured database; the bound maintenance project uses its actual container.
