<div align="center">

# ICO Terminals - Public Digital Audit

**Scope:** icoterminals.com, public website, recruitment journey, cookies, SEO, security headers  
**Method:** Public-source review, Firecrawl scrape, HTTP header inspection, sitemap review, Wappalyzer  
**Date:** 3 June 2026  
**Author:** Philippe Godfroy

</div>

---

## Why this audit exists

International Car Operators is a logistics business where IT directly touches daily operations: terminal planning, vehicle processing, gate flows, customer communication, safety, recruitment and compliance.

This is a constructive public audit. It does not include intrusive scanning, exploitation attempts, credential testing or private systems. The goal is to show how I look at a company's digital surface as an IT candidate: find visible risks, prioritize them, and translate them into practical fixes.

---

## Executive summary

| # | Finding | Area | Severity | Fix effort |
|---|---------|------|----------|------------|
| 1 | Missing modern browser security headers | Security baseline | High | Low |
| 2 | Cookie statement contains a copy/paste domain error: `fujioilghana.com` | Compliance / trust | High | Low |
| 3 | Cookie policy lists Google Analytics under "Functional & statistical cookies" | Privacy / consent clarity | Medium | Low |
| 4 | Public Drupal login route is visible in page navigation output | Attack surface hygiene | Medium | Low |
| 5 | Contact form privacy link points to `/en/node/4` instead of canonical privacy URL | UX / maintainability | Medium | Low |
| 6 | `robots.txt` still contains the Drupal example sitemap comment | SEO hygiene | Low | Trivial |
| 7 | Sitemap shows several important pages last modified in 2023-2024 | Content governance | Low | Medium |
| 8 | Website technology detection only exposes Google Tag Manager externally | Positive signal | Good | Maintain |

---

## 1. High - Missing modern browser security headers

**Page checked:** `https://www.icoterminals.com/en`  
**Observed server:** `nginx`  
**Observed framework indicators:** Drupal response headers

The response includes useful legacy protections:

```http
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
```

However, the public response inspected on 3 June 2026 did not show these common hardening headers:

```http
strict-transport-security
content-security-policy
referrer-policy
permissions-policy
```

### Why it matters

For a logistics company, the public website may not be the most critical system, but it is still a trusted entry point for customers, applicants and partners. Browser headers are a cheap baseline control that reduces exposure to downgrade, clickjacking-adjacent, script-injection and data-leakage classes of issues.

### Suggested fix

Add and test a conservative header baseline:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'
```

The CSP should be rolled out in `Content-Security-Policy-Report-Only` first because the site uses Google Tag Manager, YouTube embeds and reCAPTCHA.

---

## 2. High - Cookie statement contains a wrong external domain

**Page:** `https://www.icoterminals.com/en/cookie-statement`

The cookie statement contains this text:

```text
pages of fujioilghana.com
```

This appears to be a copy/paste error from another legal template.

### Why it matters

Cookie and privacy pages exist to create trust. A wrong company domain inside a legal page makes the policy look unreviewed, which can weaken confidence with customers, applicants and auditors.

### Suggested fix

Replace the domain with `icoterminals.com` and review the full cookie statement for template leftovers.

---

## 3. Medium - Google Analytics is grouped under "Functional & statistical cookies"

**Page:** `https://www.icoterminals.com/en/cookie-statement`

The cookie statement lists `_ga`, `_gid` and `_gat` under:

```text
4.1 Functional & statistical cookies
```

The same page also says non-functional cookies, including analytical cookies, are only stored with consent.

### Why it matters

The wording can confuse users and administrators: are analytics cookies essential, statistical, optional, or consent-based? For GDPR/ePrivacy clarity, analytics should be clearly separated from strictly necessary functional cookies unless a documented exemption applies.

### Suggested fix

Separate cookie categories:

| Category | Examples | Consent |
|----------|----------|---------|
| Strictly necessary | language/session/security | No opt-in required |
| Analytics | `_ga`, `_gid`, `_gat` | Consent unless configured under a valid exemption |
| Marketing / embedded media | YouTube, GTM marketing tags | Consent |

---

## 4. Medium - Public Drupal login route appears in navigation output

Scraped public pages expose a user menu item:

```text
Log in -> https://www.icoterminals.com/en/user/login
```

`robots.txt` correctly disallows `/user/login`, `/user/password`, `/user/register` and admin paths. Still, the login route is visible in the rendered navigation output.

### Why it matters

This is not a vulnerability by itself. It is an attack-surface hygiene issue: public CMS login pages attract automated credential stuffing and bot noise. If only administrators need this login, the visible link does not help normal users.

### Suggested fix

Remove the login item from public navigation for anonymous visitors, keep admin access through a known internal URL, and ensure rate limiting/MFA is enforced for CMS accounts.

---

## 5. Medium - Contact form privacy link uses a technical node URL

**Page:** `https://www.icoterminals.com/en/contact`

The contact form text links privacy policy acceptance to:

```text
https://www.icoterminals.com/en/node/4
```

The footer uses the cleaner canonical URL:

```text
https://www.icoterminals.com/en/privacy-policy
```

### Why it matters

Using `/node/4` is technically functional, but it exposes CMS internals and is easier to break during migrations or content restructuring. For a consent checkbox, the destination should be human-readable and canonical.

### Suggested fix

Update the form link to `/en/privacy-policy` and verify the Dutch form points to the Dutch canonical privacy page.

---

## 6. Low - `robots.txt` still contains the default sitemap example

`robots.txt` ends with:

```text
# Sitemap: https://www.example.com/sitemap.xml
```

The real sitemap exists at:

```text
https://www.icoterminals.com/sitemap.xml
```

### Suggested fix

Replace the example comment with:

```text
Sitemap: https://www.icoterminals.com/sitemap.xml
```

This is a small SEO hygiene improvement and removes a visible template leftover.

---

## 7. Low - Content governance opportunity in sitemap

The sitemap shows important pages with older `lastmod` dates, for example:

| Page | Sitemap lastmod |
|------|-----------------|
| `Digitalization and innovation` | 2023-04-27 |
| `Sustainability` | 2023-06-05 |
| `Services` | 2024-01-30 |
| Home page | 2024-02-27 |

ICO is visibly investing in digitalization, green logistics, dredging, terminal expansion and vehicle flows. The public content does not always reflect the same pace.

### Suggested fix

Create a quarterly content review checklist for strategic pages: digitalization, sustainability, terminals, jobs and safety. This is useful for both SEO and employer branding.

---

## 8. Positive signal - Clean external technology footprint

Wappalyzer detected only:

```text
Google Tag Manager
```

The site does not expose a noisy stack of marketing widgets or client-side tools. That is a good sign for performance, privacy and maintainability.

### Suggested next step

Keep GTM governed with a tag inventory:

| Tag | Owner | Purpose | Consent category | Last reviewed |
|-----|-------|---------|------------------|---------------|
| Google Analytics | Marketing / IT | Web analytics | Analytics | Quarterly |
| reCAPTCHA | IT | Form abuse prevention | Security / functional | Quarterly |
| YouTube embeds | HR / Marketing | Employer branding | Embedded media | Quarterly |

---

## 30-day action plan

| Week | Action | Owner |
|------|--------|-------|
| 1 | Fix cookie statement domain, privacy form link and robots sitemap line | Website admin |
| 1 | Remove public anonymous login menu item if not needed | Drupal admin |
| 2 | Add HSTS, Referrer-Policy and Permissions-Policy headers | IT / hosting partner |
| 2-3 | Deploy CSP in report-only mode and collect violations | IT / web agency |
| 3 | Split cookie categories and align GTM tags with consent states | IT + marketing |
| 4 | Review strategic pages with old sitemap dates | Marketing + business owners |

---

## Tools used

```bash
firecrawl search "ICO Terminals International Car Operators website" --limit 5
firecrawl map https://www.icoterminals.com --limit 50
firecrawl scrape https://www.icoterminals.com/en
firecrawl scrape https://www.icoterminals.com/en/contact
firecrawl scrape https://www.icoterminals.com/en/cookie-statement
firecrawl scrape https://www.icoterminals.com/en/privacy-policy
firecrawl scrape https://www.icoterminals.com/en/about-ico/digitalization-and-innovation
wappalyzer https://www.icoterminals.com/en
curl -I https://www.icoterminals.com/en
curl -s https://www.icoterminals.com/robots.txt
curl -s https://www.icoterminals.com/sitemap.xml
```

---

## Positioning as an IT candidate

This audit shows the type of IT work I want to do: practical, careful, business-aware and security-minded. I am interested in helping ICO keep its digital systems reliable for the people who depend on them: terminal teams, office staff, applicants, customers and partners.

