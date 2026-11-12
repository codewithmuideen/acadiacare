# Staff application: secure submission (TODO before applications go live)

## Why this is separate

The application form (`/application`) recreates the original form in full, including:

- **Health data**: the medical questionnaire (UK GDPR Article 9, special category data)
- **Criminal offence data**: convictions and pending prosecutions (UK GDPR Article 10)

This data must not be sent by ordinary email (including a Resend notification), stored in
browser storage, sent to analytics, or posted to an unprotected endpoint. A consent
checkbox alone does not make processing compliant.

## Current behaviour (safe by default)

- Answers are held in React state for the current browser tab only. Nothing is written to
  localStorage, sessionStorage, cookies, analytics or any third party.
- Leaving the page with unsent answers shows the browser's "leave site?" warning.
- `src/lib/submitApplication.js` only submits if `VITE_SECURE_APPLICATION_ENDPOINT` is set.
  It is currently empty, so pressing **Submit** shows a clear message that the application
  has **not** been sent, with the phone number and email for applying another way.
- `api/application.js` deliberately returns `501`.

## What the secure backend needs

Agree these with Acadia's data protection lead / DPO before building:

1. **Lawful basis and conditions**: Article 6 basis, Article 9 condition (likely
   employment, Schedule 1 Part 1 para 1 DPA 2018) and Article 10 / Schedule 1 condition,
   with an **Appropriate Policy Document**.
2. **DPIA**: a Data Protection Impact Assessment for processing health and criminal data.
3. **Transport**: HTTPS only, HSTS, strict CORS to `https://acadiacare.co.uk`.
4. **Storage**: a UK/EEA-hosted database or HR system with encryption at rest. Consider
   field-level encryption for medical and conviction answers.
5. **Access control**: named staff accounts with MFA, role-based access, audit log of who
   viewed or exported each application.
6. **Notifications**: email staff a link only ("New application received, sign in to view"),
   never the answers themselves.
7. **Retention**: documented periods (e.g. unsuccessful applicants deleted after N months),
   automated deletion, and a process for subject access and erasure requests.
8. **Abuse protection**: rate limiting and bot protection (e.g. Turnstile).
9. **Saving drafts** (optional): only server-side, behind a magic-link or account, never in
   browser storage.
10. **Privacy notice**: update `/privacy-policy` (it still references the Data Protection
    Act 1998) with a recruitment privacy notice covering all of the above.

Off-the-shelf options include a UK-hosted applicant tracking system with an API, or a
custom endpoint backed by an encrypted database.

## Connecting it

The endpoint should accept `POST` JSON matching `applicationSchema` in
`src/lib/applicationSchema.js` (validate it again on the server) and respond with
`{ "ok": true }` only after the data is durably stored. Then set, at build time:

```
VITE_SECURE_APPLICATION_ENDPOINT=https://<your-secure-endpoint>
```

(This is a URL, not a secret, so a `VITE_` variable is appropriate.)

## Wording that needs legal review

- The consent text in `src/data/application.js` was updated from "Data Protection Act 1998"
  to "UK GDPR and the Data Protection Act 2018", keeping the original meaning.
- The original declaration mentioned "checks ... as required under the EEA regulations 2003".
  That reference was removed as outdated; confirm the correct current wording.
