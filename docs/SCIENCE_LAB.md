# Virtual Science Lab sandbox

An open, full-width stage with three original qualitative models (`src/labModels.js`). Nothing is measured: every number is a classroom approximation and the screen says so.

- **Plant growth:** sunlight and water sliders, a 14-day "time machine" slider, play/pause, four quick settings (dark cupboard, sunny window, too much water, hot and dry), a prediction step, a growth chart that keeps the previous plant for comparison, and a plain-language reason for each outcome (thriving, pale and tall, wilting, rotting roots, scorched, dead).
- **Float or sink:** six objects and three liquids using simple density; the child predicts first, then drops the object.
- **Light the bulb:** battery, wire and switch toggles; the bulb lights only when the loop is complete.
- **Discoveries:** 12 things to find, kept on this device only. Each new discovery adds a star to the daily streak (`src/dailyStreak.js`).

All text is in `src/labCopy.js` for English, Malay, Chinese and Tamil. `tests/unified-language.test.js` fails if any language is missing a key or a placeholder. No external API, personal data or certified assessment. Educator review of the models is still pending.
