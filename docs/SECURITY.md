# Security boundaries

1. Browser code and cached answers are never authoritative for paid access or mastery.
2. Private Google Sheets must not be shared with student accounts.
3. Apps Script web apps running as owner have privileged access: require verified identity, ownership checks and strictly scoped operations.
4. Never expose script-owner secrets, OAuth credentials, scholarship evidence or student records in GitHub or Cloudflare static assets.
5. Log assessment changes, membership approvals, parent-child linking and administrator actions. Minimise personal data in logs.
6. Protect against replay, fraudulent receipts, direct API access, answer scraping and children accessing other family profiles.
7. Keep the first release in **demo only** until an end-to-end independent review passes.
