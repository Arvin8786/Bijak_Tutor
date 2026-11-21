# Bright Horizons visual refresh

A single book-and-star brand mark is used by the welcome page, sign-in page, learner header, parent console, administrator console and installed app metadata. Brand.jsx owns the displayed mark and wordmark; public/icons/app-icon.svg is the canonical artwork. The school-friend illustration is a separate learning mascot, not an alternative app icon.

The shared theme in src/design-system.css defines indigo actions, mint and warm-yellow accents, navy text, accessible focus rings, generous rounded cards, consistent form fields, meaningful selected states and responsive layouts. The common stylesheet is loaded after module styles. Parent and admin consoles retain their role-specific content, with a desktop workspace sidebar and touch navigation on phones. Console status cards display actual backend values; the redesign does not invent activity or learning results.

Animation is decorative and respects both the app’s Calm mode and the operating system’s reduced-motion preference. No external font service, visual dependency or paid asset is introduced. Existing game feedback, input validation, reports, account controls and payment flows retain their behavior.

Validation includes the full unit/build suite, the existing production and demo browser flows, shared-icon loading, desktop/phone console overflow checks, and fictional-role screenshots generated as a GitHub Actions artifact. No real child, family or payment data appears in design fixtures.

## Studio theme (src/studio.css)

`studio.css` is the last stylesheet loaded. It turns the learner view into a studio-style workspace: on screens 1100px and wider the navigation becomes a sticky left sidebar (header on top, content on the right); on phones and tablets the same navigation becomes a single swipeable tab strip so lessons start near the top of the screen. It also adds depth (layered shadows, inner highlights), spring hover motion, striped progress bars, tactile "pressable" answer buttons, a glowing mission banner and calmer lab sliders. Headings use solid colour so emoji always remain visible. All motion is switched off by Calm mode (`data-motion=off`) and by `prefers-reduced-motion`. No new fonts, images or external services are used.
