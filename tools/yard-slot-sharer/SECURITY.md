# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `main` branch | Yes |

## Privacy by design

YardEx is built around anonymity within the port ecosystem. The following design decisions are **intentional security properties** — do not change them without considering the privacy implications:

- `company_id` is never returned in any listing or request API response visible to other terminals.
- Real company names, contact details, and VAT numbers are stored in separate nullable columns (`company_real_name`, `contact_email`, etc.) and are only revealed programmatically after a deal reaches `confirmed` status.
- JWT tokens are short-lived (7 days) and contain only `id`, `alias`, and `zone` — not the full company record.

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please send a private report to: **philgodf@gmail.com**

Include:
- A description of the vulnerability and its potential impact
- Steps to reproduce (proof-of-concept if available)
- Affected component (API route, client page, database query, etc.)

You will receive an acknowledgement within 48 hours. We aim to ship a fix or mitigation within 14 days for critical issues.

## Security practices in the codebase

| Practice | Implementation |
|----------|---------------|
| Password hashing | bcryptjs, cost factor 10 |
| Authentication | JWT (HS256), verified on every protected route via `requireAuth` middleware |
| SQL injection prevention | Parameterised queries (`pg` library, `$1/$2` placeholders) everywhere |
| CORS | Restricted to `CLIENT_URL` environment variable |
| Secrets | Never committed — `server/.env` is in `.gitignore`; only `.env.example` (with placeholder values) is tracked |
| Input validation | Required fields validated before DB insert; numeric fields typed in schema |

## Known limitations (MVP)

- No rate limiting on `/api/auth/login` or `/api/auth/register` — brute-force protection should be added before a production deployment (e.g. express-rate-limit).
- No email verification step — registered accounts are immediately active. A `verified` flag exists in the schema for future use.
- No HTTPS enforcement in the Express app itself — handled at the reverse proxy / hosting layer.
