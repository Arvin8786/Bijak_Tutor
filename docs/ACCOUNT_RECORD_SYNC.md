# Connected family records

Google Sheets remains the database. Each authenticated RPC reads a new snapshot; row caching exists only inside that single request. Private responses are never cached in the service worker.

Children holds current learner details. StudentAccounts holds current sign-in links; the last event for each studentKey is authoritative. Enrolments is history, with current child details and link status reflected in parent views. Parents holds display/contact details; changing contact email does not change Google credentials or verified subject identity.

Use Access & family links to edit parent details or edit a child's details/email, explicitly restore a missing profile, grant/disable student sign-in, or remove a link. Corrections preserve childId, family ownership, test results and usage history. Old email bindings are revoked. Stale admin forms reject saves rather than overwrite newer Sheet edits. Removal is audited and only administrators can restore it.

Deploy the updated runtime .gs files and App.html together to the existing Apps Script deployment before merging the frontend. Copy updated StudentAccess.gs and SheetSetup.gs (and the updated core helpers) into the existing Sheet-bound project to enable its simple onEdit handler. No additional scopes or installable trigger are needed. Manual cell edits then synchronize related rows. Structural row deletion cannot be reversed automatically; missing profiles fail closed and remain visible for administrator repair.

Open consoles refresh every 15 seconds while visible and on focus; Refresh records / Refresh account details reload immediately. This is polling, not an instantaneous push channel. Forms being edited preserve their drafts; refresh and reopen an editor to obtain a newer snapshot.

Use original header names and preserve childId, parentSub and googleSub identity fields as text. Do not delete historical access events to unblock an account: use Grant/Restore access. Manually changing one historical row may be superseded by a later event.

The reported orphaned live child link was explicitly kept disabled; no profile or access should be restored as part of deployment.
