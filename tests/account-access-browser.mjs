import assert from 'node:assert/strict';

export async function checkAccountAccessBrowser(browser, base) {
 const page = await browser.newPage({viewport: {width: 768, height: 850}});
 try {
  await page.addInitScript(() => {
   window.testAccountStatus = 'PENDING';
   window.BIJAKLEARN_GOOGLE_CLIENT_ID = 'test-client';
   let signIn;
   function invoke(method, credential, id, status) {
    const operator = credential === 'test-operator';
    if (method === 'listAccountAccess' && operator) {
     return [{id: 'google:test-family', name: 'Test Family', email: 'family@example.test', status: window.testAccountStatus}];
    }
    if (method === 'setAccountAccess' && operator) {
     window.testAccountStatus = status;
     return {id, status};
    }
    if (!operator && window.testAccountStatus !== 'ACTIVE') throw Error('[ACCOUNT_' + window.testAccountStatus + ']');
    if (method === 'getBootstrap') return {
     parent: {name: operator ? 'Test Operator' : 'Test Family'},
     canManageAccounts: operator,
     children: operator ? [] : [{id: 'child-1', name: 'Test child', year: 1, school: 'SK'}],
     access: {active: false, plan: 'FREE'},
     lessons: [],
    };
    throw Error('Unexpected mock request: ' + method);
   }
   window.google = {
    accounts: {id: {
     initialize(options) { signIn = options.callback; },
     renderButton(container) {
      for (const [label, credential] of [['Test family sign-in', 'test-family'], ['Test operator sign-in', 'test-operator']]) {
       const button = document.createElement('button');
       button.textContent = label;
       button.onclick = () => signIn({credential});
       container.append(button);
      }
     },
    }},
    script: {run: {
     withSuccessHandler(success) {
      return {withFailureHandler: failure => new Proxy({}, {
       get: (_, method) => (...args) => {
        try { success(invoke(method, ...args)); } catch (error) { failure(error); }
       },
      })};
     },
    }},
   };
  });
  await page.goto(base);
  await page.getByRole('button', {name: 'English'}).click();
  await page.getByRole('button', {name: 'Continue'}).click();
  await page.getByRole('button', {name: 'Test family sign-in'}).click();
  await page.getByRole('alert').filter({hasText: 'waiting for administrator approval'}).waitFor();
  await page.getByRole('button', {name: 'Test operator sign-in'}).click();
  await page.getByRole('button', {name: 'Manage account access'}).click();
  await page.getByRole('button', {name: 'Approve'}).click();
  await page.getByRole('button', {name: 'Grant access'}).click();
  await page.getByRole('status').filter({hasText: 'Active: family@example.test'}).waitFor();
  await page.getByRole('button', {name: 'Block', exact: true}).click();
  assert.equal(await page.getByRole('button', {name: 'Block access'}).isEnabled(), false);
  await page.getByLabel('Reason for blocking').fill('Test block');
  await page.getByRole('button', {name: 'Block access'}).click();
  await page.getByRole('status').filter({hasText: 'Blocked: family@example.test'}).waitFor();
  await page.getByRole('button', {name: 'Restore access'}).click();
  await page.getByRole('button', {name: 'Grant access'}).click();
  await page.getByRole('status').filter({hasText: 'Active: family@example.test'}).waitFor();
  await page.getByRole('button', {name: 'Sign out'}).click();
  await page.getByRole('button', {name: 'Test family sign-in'}).click();
  await page.getByRole('button', {name: 'Parent insights'}).waitFor();
  assert.equal(await page.getByRole('button', {name: 'Manage account access'}).count(), 0);
  await page.evaluate(() => { window.testAccountStatus = 'REVOKED'; });
  await page.getByRole('button', {name: 'Parent insights'}).click();
  await page.getByLabel('Parent PIN', {exact: true}).fill('123456');
  await page.getByRole('button', {name: 'View child report'}).click();
  await page.getByRole('alert').filter({hasText: 'Your account access has been blocked'}).waitFor();
  assert.equal(await page.getByRole('button', {name: 'Sign out'}).count(), 0);
 } finally {
  await page.close();
 }
}
