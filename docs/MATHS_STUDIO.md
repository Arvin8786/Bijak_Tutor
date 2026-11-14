# Original Maths Studio

Two tabs, all text in English, Malay, Chinese and Tamil (`src/labCopy.js`).

- **Whiteboard:** a canvas with pen, eraser, four colours, three sizes, undo/redo, clear (tap twice) and plain/squares/lines paper (`src/Whiteboard.jsx`). The drawing stays in memory on the device and is never uploaded. A problem for the chosen year is shown (`makeProblem` in `src/mathGuide.js`); the child types their steps, one per line, and an answer.
- **Study guide:** an on-device checker, not an AI service. It recognises common slips (forgotten carry, smaller digit taken from larger, forgotten borrow, wrong operation, swapped numbers, place-value and shifted-row errors, off by one), checks each typed line such as `7 + 8 = 15`, and gives hints and worked steps. It cannot read handwriting on the board.
- **Practice quiz:** year/topic selection, 5/10/15/20-question sessions, worked feedback, mistake review and temporary session history over the existing original question bank. Question and lesson text remains in the bank's own language.

Correct answers earn 1–3 stars (fewer hints, more stars) that feed the daily streak, stored only on this device.

No code, questions, branding or assets were copied from BijakMath; its public site informed feature selection only. Topic filters are discovery aids, not official syllabus mappings.

Open-ended AI help would need a server-side proxy so no API key is shipped in the public site. Until that exists, the guide above is the safe default.
