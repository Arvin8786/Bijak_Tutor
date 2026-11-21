# ProEase Studio / BijakLearn account roles

The configured owner can use the same verified Google account with each sign-in option: **Parent**, **Student**, or **BijakLearn Team**. These are the real interfaces backed by the existing private spreadsheet. There is no separate testing workspace.

- Team sign-in opens account approval, individual child access, profile correction, membership, payment review, video publishing and other operational controls.
- Parent sign-in opens the owner's own family dashboard, enrolment, reports and payments. It cannot call team operations.
- The first Student sign-in creates one persistent learner profile for the owner, linked to that same Google account. Subsequent sign-ins reuse it. Its initial year is 1, stream SK and language English; edit these in the team console. Owner learning access includes Premium modules while their module policy remains enabled. No payment or subscription is fabricated.
- Owner learner attempts and reported usage are actual stored records visible in the owner's parent dashboard. The team console can edit or disable this learner. Disabled, removed or missing owner profiles are never silently restored on sign-in.

The exception is restricted to the exact Google subject stored in `ACCOUNT_ADMIN_GOOGLE_SUB`, verified by Google on every request. An email match or client-selected role alone cannot grant it. The frontend retains the chosen role in an in-memory request envelope; the backend verifies the Google token and owner identity before honouring it. Student and parent role envelopes cannot invoke team operations or access other families.

Other parents still require team approval. They link their children's separate Google accounts through the parent portal. Only the team can remove, correct or disable existing student links. RM100 lifetime Premium includes two child slots; extra Premium slots cost RM30. Pending extra slots retain Free access.

After changing roles, sign out and choose the desired sign-in option. Open parent and child consoles refresh data every 15 seconds while visible, when focused, and through manual refresh controls. Corrections preserve learner IDs and history; changing a student email revokes the previous identity.
