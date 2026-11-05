# Cloudflare + Codex onboarding for BijakLearn Junior

## 1. Official setup
Read https://developers.cloudflare.com/agent-setup/codex/ (the agent-specific guide linked from Cloudflare's agent setup).
Cloudflare supports Codex CLI and Desktop. On macOS, using CLI:
```bash
npm install -g @openai/codex
git clone https://github.com/Arvin8786/Bijak_Tutor.git
cd Bijak_Tutor
codex
```
Within Codex use `/plugins`, find and install **Cloudflare**. That installs Cloudflare Skills and registers Cloudflare MCP servers. On the first authenticated Cloudflare tool call, approve OAuth in the browser, selecting only permissions needed for Pages. If a connection needs troubleshooting:
```bash
codex mcp list
codex mcp add cloudflare --url https://mcp.cloudflare.com/mcp
```
The manual MCP command is a fallback if the plugin did not install it. Never commit OAuth tokens.

## 2. Deploy this existing React/Vite repository with Cloudflare Pages
- Open https://dash.cloudflare.com/ and sign in or create a Cloudflare account.
- Go to **Workers & Pages** → **Create application** → **Pages** → **Import an existing Git repository**.
- Approve Cloudflare's GitHub app for **Arvin8786/Bijak_Tutor** (repository-only access if offered).
- Configure project:
  - Project name: `bijaklearn-junior` (or any available Pages project name)
  - Production branch: `main`
  - Framework preset: `React (Vite)`
  - Root directory: `/` (repository root)
  - Build command: `npm run build`
  - Build output directory: `dist`
  - Node version: compatible supported version such as Node 22, if a version choice is shown
- Click **Save and Deploy**.
- Check the build log; open the **actual** `https://<your-project>.pages.dev` URL shown by Cloudflare (do not assume the project name is available).
- Test mobile appearance, subjects, lesson flow, offline/online changes, and installed PWA behaviour. Initial deployment is demonstration-only.
- Every subsequent push to `main` can deploy automatically after Git integration is configured.

Official references:
- https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/
- https://developers.cloudflare.com/pages/configuration/build-configuration/
- https://developers.cloudflare.com/pages/configuration/git-integration/

## 3. Validate before calling it live
1. Confirm GitHub Actions green: `npm install`, `npm test`, `npm run build`.
2. Confirm Cloudflare Pages status is **Success** and provides an actual `pages.dev` URL.
3. Confirm CSS and JavaScript load: verify styling and interactive controls.
4. Confirm the app shell is served on direct refresh and the PWA manifest/icon loads.
5. Confirm this is **demo mode**. The Cloudflare PWA is not yet authenticated against private Google Sheets.

## 4. Production blocking integration (future)
Google Apps Script HTML Service's `google.script.run` cannot be called as a privileged RPC directly from this Cloudflare site. The production plan must add a verified identity and API boundary, account isolation, and server-owned marking/entitlement decisions. Never turn the Apps Script project into a public, unauthenticated, owner-privileged endpoint. Design, review and test the bridge before enrolling families or taking payment.

## 5. Helpful Codex task after connecting Cloudflare
> Inspect this repo's existing React/Vite PWA. Using the official Cloudflare Skills and MCP, confirm whether the Cloudflare account has a Pages project connected to Arvin8786/Bijak_Tutor. If none exists, help me create a Pages project using Git integration on main with build command npm run build and output dist. Ask for OAuth authorization when required. Deploy the demo and report the verified Pages URL and deployment logs. Do not deploy the unverified Apps Script backend, add Firebase, or claim production authentication is enabled.
