# Account portals on GitHub Pages

Google Identity Services signs in on the approved GitHub Pages origin. The top-level app stays there. A hidden Apps Script HTML-service transport exchanges bounded, correlated messages only with that origin and calls a server-side RPC allowlist. Every operation still verifies Google identity, account status and ownership/administrator permissions. The endpoint URL is public service configuration, not a secret or an editor-access credential. Static lesson assets in the public repository remain public.

- Administrator: access approvals/revocation, verified family/student links, guardian enrolment review, usage overview, module/tier policy, membership assignment, manual payment review ledger, Premium Kasih review, and parent feedback/replies. No learning navigation.
- Parent: reports only for children whose parentSub matches the verified Google subject; guardian enrolment consent, private feedback and administrator replies, and Premium Kasih applications. No student learning navigation. A student pairing is activated only after administrator review and is bound to the student’s verified Google identity at first sign-in.
- Student: linked learner profile, learning resources and server-marked lesson assessments, subject to family account and tier rules. No parent, payment or administrator access.

Usage is approximate activity reporting from visible pages with recent interaction, not verified attendance. The server clamps reports to elapsed wall time, rejects duplicate event IDs, and isolates records by linked child. Parent results count server-marked lesson checks; unrelated games are not represented as tests.

Payment controls record an operator’s manual verification or rejection. They do not charge cards, transfer funds or issue refunds. Membership changes are separate explicit administrator actions.

Deploy Transport.html and RolePortals.gs with the generated Apps Script bundle. Run the owner-only table initializer for additive Enrolments, ParentFeedback and UsageEvents tables, then update the existing web-app deployment. Only the transport response enables iframe embedding and it has no visual controls; messages require the fixed Pages origin, channel and source window. The normal app response retains the default frame protection.

Premium Kasih document uploads still require the owner’s private Drive folder and Drive authorization/retention setup described in TIERS_AND_GOOGLE_SETUP.md. Do not represent uploads as active when Service settings says documents are not configured. Never share the database or evidence folder publicly. No credentials are shipped to Pages, and private requests/results are not cached by the service worker.
