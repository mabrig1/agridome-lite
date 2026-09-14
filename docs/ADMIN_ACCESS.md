# Administrator dashboard and knowledge base

The app reserves administrator access for **victoryonline1@gmail.com**. This is a server-enforced identity restriction, not a public registration flow. Email alone does not authenticate a visitor.

## Activate access

1. Install dependencies with `npm ci`.
2. Run `npm run admin:setup` in the project root on a trusted computer.
3. Save the generated password in a password manager. The command writes a salted scrypt password hash and random session-signing secret to the ignored `.env.local` file. It does not store the plaintext password.
4. In the intended Vercel project's server environment, add `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` using the values in that file. Set the values for each environment that needs administrator access. Do not prefix them with `NEXT_PUBLIC_`.
5. Deploy once, then open `/admin/login` or use **Administrator sign in** on the farm dashboard. Enter the designated email and generated password.
6. Check that `/admin` redirects to sign-in in a private browser window, while a signed-in administrator sees the 13 operating guides. Search for “soil” and test Sign out.

There is no hardcoded password. Missing or malformed configuration disables sign-in and rejects existing sessions. Adding the email to source does not activate live access until the deployment secrets are set.

## Password reset / session revocation

Run `npm run admin:setup -- --rotate`, save the new password, replace both server environment values, and redeploy. The changed password hash and signing secret invalidate earlier sessions. Never send secrets in a pull request, issue, screenshot or public chat.

## Access boundary

- `/admin` checks the signed session on the server before rendering knowledge articles, including search and RSC requests.
- `/api/admin/session` enforces credentials and checks cookie signatures/expiry. Sessions last two hours, use HttpOnly cookies, SameSite=Strict, and Secure in production.
- Sign-in and sign-out require same-origin requests. Login request size and password length are bounded.
- The login endpoint allows five attempts per minute per Vercel forwarded IP per process. This is an additional in-memory safeguard, not a shared cross-instance rate limiter. Retain the generated high-entropy password and configure platform rate limiting if exposure grows.
- Administrator documents and session endpoints send private/no-store headers and use NetworkOnly service-worker rules. Articles are not imported into public client bundles.
- Sign-out clears the current browser's cookie. For suspected cookie theft, rotate deployment credentials to revoke all sessions.
- The existing `/pilot-coordinator` workspace remains a local file-processing feature. This change protects the knowledge base; it does not add a cloud participant database or change existing farmer tool access.
- General how-to article source is in this public repository. The application restricts access to its administrator dashboard, but source-controlled content is not a place for confidential operational information or secrets.

## Verification

`npm test` covers credential checks, tampered/expired sessions, fail-closed configuration, session revocation, login throttling, request origin checks, session responses and logout. `npm run build` validates the production application. After building, `npm run test:admin-http` starts a temporary local production server with disposable credentials and verifies HTML/RSC access protection, authenticated search, private responses and logout.

On a deployed preview, also verify anonymous redirects, correct/incorrect password handling, guide search, logout and the absence of administrator documents in Cache Storage. Public offline farm features should continue working.
