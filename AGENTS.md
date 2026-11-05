# BijakLearn Junior — AI coding agent instructions

## Project context
- Canonical repository: `Arvin8786/Bijak_Tutor`; branch: `main`.
- Frontend: React + Vite Progressive Web App.
- Hosting target: Cloudflare Pages, connected to GitHub with automatic deploys.
- Build: `npm run build`; static output: `dist/`; tests: `npm test`.
- Backend and database: Google Apps Script + private Google Sheets; **no Firebase**.
- Cloudflare-hosted frontend currently runs in **demo mode**; the secure live PWA-to-Apps-Script bridge is not finished.
- Primary curriculum for SK/SJKC/SJKT Tahun 1–6. Most subjects are catalog entries; drafted lessons are not teacher-approved.

## Cloudflare onboarding
Official guide: https://developers.cloudflare.com/agent-setup/codex/
Cloudflare Skills/MCP are installed separately in Codex via `/plugins` (select Cloudflare). An authenticated Cloudflare API operation requires the account owner's OAuth consent. See `docs/CLOUDFLARE_ONBOARDING.md` for exact Pages settings.

For Cloudflare Pages using Git integration, do not generate a competing Wrangler deployment project or change the output directory. Do not put account tokens, API secrets, or private identifiers in GitHub. Use Cloudflare's dashboard Git integration and `main` deployments.

## Quality and safety
1. Run `npm test` and `npm run build` after changes.
2. Do not treat the local demo login or client-computed mastery as secure production features.
3. Do not collect real child information, student learning records, financial details, or scholarship documents in the public demo.
4. Server-side marking, verified identity, family isolation, anti-replay and access control are deployment blockers for the live service.
5. Create reusable, original child-friendly lessons with verified syllabus mappings; content without qualified review is a draft.
6. Maintain accessible, mobile-first UX; PWA service worker must never cache private API responses.
7. Preserve existing functioning Google Sheets/Apps Script source and avoid adding Firebase.
