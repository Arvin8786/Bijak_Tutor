# AI helper + Video Lessons setup

## 1. How maths questions are answered (cheapest first)
1. **On the device (free, instant):** the built-in solver handles arithmetic, fractions, percentages, ratios, averages, speed/distance/time, area/perimeter, money, time and simple word problems, with worked steps.
2. **Only if that cannot solve it:** the app asks your Apps Script, which calls your AI provider (e.g. Bluesminds). If the model returns an arithmetic expression, our own calculator re-computes it and flags any mismatch ("Python-style" checking, but inside Apps Script, which cannot run Python).
3. Repeated questions are served from a shared cache (sheet `TutorCache`) at zero cost. Questions containing personal details are never shared/cached.
4. A global daily cap (`AI_DAILY_LIMIT`) protects your $90 credit.

## 2. Add your key (never put it in GitHub or the app)
Apps Script editor -> Project Settings -> Script Properties:

| Property | Value |
|---|---|
| AI_BASE_URL | provider's OpenAI-compatible address ending in `/v1` (from the Bluesminds dashboard) |
| AI_API_KEY | your key |
| AI_MODEL | model name from the dashboard (pick a cheap/fast one) |
| AI_DAILY_LIMIT | e.g. `300` |
| GEMINI_API_KEY (optional) | free Google key as second fallback |

AI answers are Premium-only by default (Study Buddy module). Change this in the `ModuleAccess` sheet.

## 3. Deploy
1. Run `npm run build`; copy every file from `release/` into Apps Script (new: `AiGateway.gs`, `VideoLibrary.gs`, `ArithmeticCheck.gs`; regenerated: `ModuleData.gs`).
2. Run `setupBijakLearn_` once (creates `Videos`, `TutorCache`, and the `video-library` module row).
3. Deploy -> Manage deployments -> New version.

## 4. Video lessons
Admin console -> **Video lessons** tab: paste a YouTube link (watch, youtu.be, shorts, embed) or 11-character ID, add title/subject/year, Save. Hide or Remove any time; changes appear immediately. Learners only see this list, inside the app, in a privacy-enhanced player.
Note: YouTube cannot be forced to show zero suggestions. The app uses `rel=0` (only same-channel suggestions) and covers the player when the video ends. For a perfectly clean experience upload your lessons to your own channel (public or unlisted).
