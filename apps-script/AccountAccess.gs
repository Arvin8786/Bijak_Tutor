/** Account activation for the authenticated web app. Premium plans are checked separately. */
function isAccountAdmin_(user) {
 const adminSub = String(props_().getProperty('ACCOUNT_ADMIN_GOOGLE_SUB') || '').trim();
 return adminSub !== '' && user.sub === adminSub;
}

function requireAccountAdmin_(token) {
 const user = verify_(token);
 if (!isAccountAdmin_(user)) throw Error('Account administrator access required.');
 return user;
}

function accountKey_(sub) {
 // Keep the Google subject as exact text even when it contains only digits.
 return 'google:' + sub;
}

function latestAccountEvents_() {
 const latest = new Map();
 for (const event of rows_('AccountAccess')) latest.set(event.accountKey, event);
 return latest;
}

function appendAccountEvent_(account, status, actorSub, reason) {
 append_('AccountAccess', {
  accountKey: account.accountKey,
  email: account.email,
  displayName: account.displayName,
  status,
  changedAt: new Date().toISOString(),
  changedBy: accountKey_(actorSub),
  reason,
 });
 SpreadsheetApp.flush();
}

function accountStatus_(user) {
 const key = accountKey_(user.sub);
 const event = latestAccountEvents_().get(key);
 if (event) return event.status;
 // Existing parents keep access until an administrator explicitly revokes it.
 return rows_('Parents').some(parent => String(parent.googleSub) === user.sub) ? 'ACTIVE' : 'PENDING';
}

function requireActiveAccount_(user, requestOnSignIn) {
 if (isAccountAdmin_(user)) return;
 let status = accountStatus_(user);
 if (status === 'PENDING' && requestOnSignIn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
   const accountKey = accountKey_(user.sub);
   const event = latestAccountEvents_().get(accountKey);
   if (event) {
    status = event.status;
   } else if (rows_('Parents').some(parent => String(parent.googleSub) === user.sub)) {
    status = 'ACTIVE';
   } else {
    appendAccountEvent_({accountKey, email: user.email, displayName: user.name}, 'PENDING', user.sub, '');
   }
  } finally {
   lock.releaseLock();
  }
 }
 if (status === 'ACTIVE') return;
 if (status === 'PENDING') throw Error('[ACCOUNT_PENDING] Your account is waiting for approval.');
 throw Error('[ACCOUNT_REVOKED] Your account access has been blocked.');
}

function listAccountAccess(token) {
 const admin = requireAccountAdmin_(token);
 const accounts = latestAccountEvents_();
 for (const parent of rows_('Parents')) {
  if (!parent.googleSub) continue;
  const accountKey = accountKey_(parent.googleSub);
  if (!accounts.has(accountKey)) {
   accounts.set(accountKey, {accountKey, email: parent.email, displayName: parent.displayName, status: 'ACTIVE'});
  }
 }
 accounts.delete(accountKey_(admin.sub));
 return Array.from(accounts.values(), account => ({
  id: account.accountKey,
  email: String(account.email || ''),
  name: String(account.displayName || ''),
  status: account.status,
 })).sort((a, b) => Number(b.status === 'PENDING') - Number(a.status === 'PENDING') || a.email.localeCompare(b.email));
}

function setAccountAccess(token, accountKey, status, reason) {
 const admin = requireAccountAdmin_(token);
 if (typeof accountKey !== 'string' || !/^google:[A-Za-z0-9_-]{1,255}$/.test(accountKey)) {
  throw Error('Select a valid account.');
 }
 if (accountKey === accountKey_(admin.sub)) throw Error('The administrator account is managed in Script Properties.');
 if (!['ACTIVE', 'REVOKED'].includes(status)) throw Error('Select a valid access status.');
 const note = typeof reason === 'string' ? reason.trim() : '';
 if (note.length > 250 || (status === 'REVOKED' && !note)) throw Error('Enter a reason of 1 to 250 characters to block an account.');

 const lock = LockService.getScriptLock();
 lock.waitLock(10000);
 try {
  let account = latestAccountEvents_().get(accountKey);
  if (!account) {
   const parent = rows_('Parents').find(parent => accountKey_(parent.googleSub) === accountKey);
   if (!parent) throw Error('Account not found.');
   account = {accountKey, email: parent.email, displayName: parent.displayName, status: 'ACTIVE'};
  }
  if (account.status !== status) appendAccountEvent_(account, status, admin.sub, note);
  return {id: accountKey, status};
 } finally {
  lock.releaseLock();
 }
}
