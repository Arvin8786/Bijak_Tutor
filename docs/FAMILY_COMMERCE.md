# Family linking, purchases and referrals

Parents must sign in with a verified, administrator-approved Google account. Adding a child records guardian consent and immediately creates an active email link belonging only to that parent. The child must sign in using that separate Google identity; first sign-in binds the Google subject. A parent cannot remove, change, move or restore a link. An administrator can disable, remove (soft removal, preserving audit/history) or restore it. Existing account blocking still applies to every request.

Parents may link any number of children. RM100 purchases lifetime Premium for two active child profiles; RM30 purchases each additional lifetime Premium slot. Children beyond those slots use Free modules until the extra purchase is verified. Active profiles use their creation order for Premium slots. Only administrator removal can free/reorder that allocation; parents cannot swap accounts to evade the rule. Premium Kasih remains a separate reviewed sponsorship. Legacy timed memberships remain valid until expiry; explicit administrator tier changes override earlier purchases until another qualifying purchase. Lifetime means no scheduled expiry, while account suspension and administrator controls remain effective.

## Payment records and files

`Orders` snapshots server-calculated prices, discount, referral and commission rate. A quote expires after 30 minutes or the discount campaign end, whichever is earlier. Discount usage is reserved by unexpired quotes, submitted orders and completed purchases. A parent submits a unique receipt reference and a PDF/PNG/JPEG of at most 1 MB. No client-supplied total is accepted. Only an administrator's verification of cleared funds changes the order to PAID and grants access. Repeated reviews are idempotent. Refund records reverse entitlements and unpaid commission; no money is moved by this application. Refunds involving an already recorded commission payout require separate reconciliation.

Google Sheets stores private upload metadata and order records; the file bytes remain in a private owner-only top-level Google Drive folder. Payment proof is readable only by its parent and administrator. Current payment QR is readable by verified parents and administrator. Students cannot retrieve uploads. The app fetches bounded file content through authenticated RPC and previews it locally with a revocable Blob URL; it does not send private documents to a third-party PDF viewer or publish Drive links. Kasih evidence now uses the same in-app preview. The existing Kasih retention task applies to scholarship evidence; payment proof is retained until the owner manages its retention separately.

Administrator > Payment controls provides the Touch ’n Go QR image upload. The administrator must supply their actual receiving QR. The app does not generate a payee QR, contact WhatsApp automatically, initiate payments or send money. The contact link opens WhatsApp for +60 11-5444 3154 without pre-filling private child or payment details.

## Referrals and commissions

Each active parent receives an opaque referral code whose private row maps to their verified Google subject, name and Gmail address. Links contain the code, never the Gmail address. Referral arrival is remembered only in the current tab's session storage. The first new Google onboarding attempt fixes attribution; existing accounts, direct arrivals and self-referrals cannot later be reassigned. Parents see successful referred parents and earnings without exposing the referred parent's email, child records or documents.

Only the initial verified lifetime Premium subscription earns a single commission, calculated in integer sen on the amount after discount. Extra-child payments do not generate another referral commission. The administrator configures a rate from 0–100% with two decimal places; the initial default is 0 until configured. Rates and discounts are snapshotted on each quote; changing a campaign or rate does not rewrite existing quotes or paid earnings.

At month close (Asia/Kuala_Lumpur), paid, unreversed commissions become eligible for reconciliation. The administrator independently transfers funds, then records the actual transfer reference. No automatic payout integration exists. The payout stores all included order IDs in one authoritative row, preventing duplicate payout even if a derived detail write fails. Current-month earnings remain pending. Parent portals show successful referrals and recorded payout history.

## Deployment

1. Deploy Commerce.gs and the updated source with the existing authenticated backend. Never run a new credential setup or replace existing private properties.
2. Add the existing repository manifest's Drive and Apps Script trigger scopes to the live project, preserving its existing Google user-email scope. The owner must approve these new permissions; do not grant them silently.
3. Run `setupBijakFamilyCommerce` as the owner. It adds only missing columns/tables, creates/verifies private upload storage and installs the existing daily Kasih evidence-retention task. It does not make any file or spreadsheet public.
4. Update the existing web-app deployment. Keep its URL and origins unchanged. Publish GitHub Pages after tests and build pass.
5. In the admin portal upload the actual Touch ’n Go QR, confirm payment instructions, set commission rate and configure any discount start/end and use limit. Test a fictional purchase in a private test environment before inviting families. Never approve a fake purchase or actual commission payout in production as a test.
