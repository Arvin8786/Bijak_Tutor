# BijakLearn Junior public address: custom domain

The current working public website is `https://arvin8786.github.io/Bijak_Tutor/`.

To show a branded address instead of the GitHub address, use a **custom domain you control**, for example `learn.your-domain.com`. This is not a deceptive redirect or hiding a destination; it changes the website's legitimate public address.

## GitHub Pages custom domain
1. Buy or use a domain you own. Choose a host such as `learn.your-domain.com`.
2. At the DNS provider, create a CNAME for `learn` to `arvin8786.github.io` (no `https://`, no `/Bijak_Tutor`).
3. In GitHub repository → Settings → Pages → Custom domain, enter exactly `learn.your-domain.com`. Save and enable **Enforce HTTPS** once GitHub issues a certificate.
4. Verify the custom domain in your GitHub account/domain settings before using it. DNS changes can take time.
5. Keep the existing GitHub Pages source set to **GitHub Actions** and keep the app's Vite base path relative (`base:'./'`), which works under both the project path and a custom-domain root.
6. Test opening the custom address directly, installing the PWA, sharing lesson pages and refreshing.
7. An optional repository `public/CNAME` file can be created with the **real supplied domain** if needed; do not put a guessed domain there.

## About short links and masking
A short-link service only redirects and typically reveals the final website URL once opened. A custom domain or correctly configured reverse proxy makes the site appear at your chosen brand address. Avoid URL masking using frames: it interferes with navigation, PWA installation, accessibility and browser security.

**No domain or DNS changes have been made by this code update.** The user or authorised domain administrator must supply the actual domain and configure DNS.

## Language and educational scope
The new welcome page offers Bahasa Melayu, English, 简体中文 and தமிழ் for key navigation and welcome labels. Lesson texts themselves retain their authored language; choosing another display language does **not** translate or certify every lesson. The new Practice Arena and flashcards are formative activities drawn from authored content.
