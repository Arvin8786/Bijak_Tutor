# BijakLearn Junior implementation plan

## Phase 0 (this PR)
- [x] Initialize canonical GitHub project and primary school PWA demo.
- [x] Add a deterministic independent-evidence mastery prototype with tests.
- [ ] Import the complete v6 ZIP curriculum package with source checks.
- [ ] Replace placeholder PWA icons; verify installation on real devices.

## Phase 1 — security and data
- [ ] Google Sheets schema: Families, Guardians, Students, Entitlements, Lessons, Questions, Attempts, Mastery, Reviews, Scholarships.
- [ ] Google Apps Script backend deployment and audited access controls.
- [ ] OIDC verification and signed session strategy for Cloudflare-hosted PWA; no insecure public Apps Script endpoints.
- [ ] Verify parent-child account ownership, data minimisation and export/deletion.
- [ ] Server-side generated assessment sessions, marking and replay protection.

## Phase 2 — educational pilot
- [ ] Import and verify current KSSR Semakan Year 1 Mathematics standards against the latest applicable alignment documents.
- [ ] Qualified teacher checks on all questions, explanations and curriculum references.
- [ ] Original diagrams, mind maps and topic-wise teaching flows.
- [ ] Evidence-based misconceptions, independent cross-questions and delayed retention.
- [ ] AI runs locally where supported; deterministic fallback when unsupported.

## Phase 3 — parent and Premium Kasih
- [ ] Parent dashboard based on actual verified learning evidence.
- [ ] Manual bank payment verification and annual scholarship renewal.
- [ ] Secure private scholarship evidence handling (not stored in public Sheets/GitHub).
- [ ] Accessibility, safety, performance, offline replay and disaster-recovery testing.

Production gate: no real child data, financial documents or paid subscriptions until identity, authorisation, integrity, consent and data retention are verified end to end.
