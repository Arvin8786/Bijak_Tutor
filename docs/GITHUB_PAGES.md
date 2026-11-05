# GitHub Pages — BijakLearn Junior demo

URL: https://arvin8786.github.io/Bijak_Tutor/

## Why the original page was blank
The repository was previously served as uncompiled source, and the Vite frontend used root-relative /assets and /sw.js paths. GitHub Pages serves this project under /Bijak_Tutor/, so those URLs did not resolve to the compiled application.

## Fix
- Vite base uses relative asset URLs, compatible with GitHub Pages and Cloudflare Pages.
- HTML, PWA manifest, icon paths, and service-worker registration are scoped to the app's deployed path.
- `.github/workflows/deploy-pages.yml` builds the React app and uploads only the compiled `dist/` folder.

## One-time GitHub setting
1. Visit https://github.com/Arvin8786/Bijak_Tutor/settings/pages
2. Under **Build and deployment**, set **Source: GitHub Actions** (not “Deploy from a branch”).
3. Push or manually run **Publish BijakLearn to GitHub Pages** under Actions.
4. Confirm the deployment job succeeds and open https://arvin8786.github.io/Bijak_Tutor/
5. Hard refresh if you previously opened the blank site (Ctrl+Shift+R on Windows or Command+Shift+R on Mac). If needed, clear this site's prior service worker/cache in browser developer settings.

## Testing expectations
On success, the app should show a styled BijakLearn Junior welcome/login demo and clickable practice lessons. This is **NOT** live student authentication, backed-up student data, or verified premium entitlements.

Production priority remains the secure Google Sheets/Apps Script integration and child data privacy review.
