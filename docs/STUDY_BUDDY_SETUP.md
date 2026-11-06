# Study Buddy: interaction, curriculum coverage and live AI setup

## Public website
Study Buddy is accessible from the top navigation, home page and lesson reader. It works without a sign-in using **on-device guidance**, including:
- Checked and worked calculations: addition (with carrying), subtraction (including borrowing), multiplication (partial products), division (long division/remainders).
- Lesson-grounded answers retrieved from available authored curriculum descriptions, steps and examples. Unknown questions show a clear fallback rather than invented facts.
- Read-aloud TTS using Web Speech `speechSynthesis`, plus optional speech-to-text using `SpeechRecognition`/`webkitSpeechRecognition` when supported. The browser may deny microphone access or lack voices.
- No external API key or real student private data is stored in frontend code.

**The public GitHub Pages site does not have open-ended generative AI**: static hosting cannot protect a private AI API key or authenticate family records on its own. Do not put any AI service key in Vite variables named `VITE_*`, GitHub source, URLs, or browser local storage.

## Optional live generative AI in authenticated Apps Script
The release build includes `TutorAI.gs`. It uses Google Gemini `models.generateContent` with the secret stored in Apps Script Script Properties, requires verified Google parent sign-in and rate-limits usage.

1. In the private Apps Script HTML-service project, add `release/TutorAI.gs` from a current `npm run build` package.
2. Set Script Property `GEMINI_API_KEY` to a valid server-side Google AI key. Set optional `GEMINI_MODEL` to a model available to that account (for example `gemini-3.5-flash-lite`). Do not share the key.
3. Test `askTutor` with a valid parent Google ID token through the HTML-service interface. It rejects unauthenticated callers and does not pass parent identifiers or attempt histories to Gemini.
4. Confirm quota and billing controls, content safety, privacy and parent consent before deploying real accounts.
5. Deploy the Apps Script HTML-service web app separately, with configured Google OAuth. The GitHub Pages website does not automatically use it.

AI-generated responses may be incorrect; confirm important educational explanations with a teacher. Do not allow students to enter private family data into questions.

## Why some subjects do not have content
The full catalogue covers core and optional subjects, but it was created before all materials were authored. The default home view now shows subjects offered in the common curriculum rather than listing every unfilled optional language. A separate *Show additional optional languages* control offers the complete catalogue.

Additional original introductory Arabic, Chinese SK and Tamil SK activities have been added. **Bahasa Iban, Kadazandusun and Semai still require fluent educator-authored lessons**. Even material in the other subjects is draft and not a complete, teacher-verified DSKP mapping. The build generates `release/CURRICULUM_COVERAGE.json` to expose actual content counts.
