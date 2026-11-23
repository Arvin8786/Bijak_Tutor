# Password sign-in

Parents can enable password sign-in from their existing Google-verified parent console. Their verified Google email and family ID are retained. Team sign-in uses Google. A student can use their username, generated user ID, or optional linked email. For an existing child, open the child's profile in the parent console to set or reset the password.

The private **User Authentication** tab contains the user ID, username, email, phone number and the role and family linkage. The server stores a per-account salt and PBKDF2-HMAC-SHA256 verifier with 600,000 iterations. The console never reads or displays saved passwords. Resetting a password changes the credential version and invalidates prior password sessions. An approved parent or student profile remains subject to the existing access controls.

## Deployment

Run `npm install`, `npm test` and `npm run build`. Install the generated Apps Script release files, including PasswordKdf.gs, PasswordLearningData.gs, PasswordAccounts.gs, PasswordLearningSetup.gs and AccountHttp.gs. Run `setupPasswordSignInAndLearning` as the script owner from the editor before publishing the new backend version. Rerunning setup preserves authentication records, existing lesson edits and module policies. Publish the frontend on the existing GitHub Pages site.

## Language lessons

The SK Years 1–6 additions are supplementary vocabulary activities with Malay instructions. Vocabulary was checked against the [Iban numeral reference](https://lingweb.eva.mpg.de/channumerals/Iban.htm), the [Central Dusun numeral reference](https://lingweb.eva.mpg.de/channumerals/Kadazan-Dusun.htm), and the [KPM Bahasa Semai Year 1 textbook](https://www.tutor.com.my/uploads/books/book_69204470a08f4.pdf). Lesson activities are original and their records retain the educator-review status.
