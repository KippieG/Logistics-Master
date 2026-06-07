# 🛡️ ECS European Containers: Comprehensive Digital Presence Audit

![Audit Scope](https://img.shields.io/badge/SCOPE-WEB_LINKEDIN_PORTALS-orange?style=for-the-badge)
![Date](https://img.shields.io/badge/DATE-JUNE_2026-blue?style=for-the-badge)
![Severity](https://img.shields.io/badge/MAX_SEVERITY-CRITICAL-red?style=for-the-badge)

<div align="center">
**Scope:** ecs.be · LinkedIn (company + CEO) · Customer Portals · Legal & Compliance  
**Method:** Manual review · curl/HTTP inspection · page source analysis · LinkedIn data  
**Author:** Philippe Godfroy
</div>

---

## 📋 Summary Table

| # | Finding | Area | Severity | Fix Effort |
|---|---------|------|----------|------------|
| 1 | Supply Chain Portal completely dead (DNS NXDOMAIN) | Broken functionality | 🔴 Critical | Low |
| 2 | Both customer portals use HTTP, not HTTPS | Security | 🟠 High | Low |
| 3 | T&C: no click-wrap, UK carrier doc 14 months old | Legal | 🟠 High | Medium |
| 4 | GDPR: advertising cookies fire without consent category | Compliance | 🟠 High | Low |
| 5 | 3 different company names in use: "ECS Group" / "European Containers" / "Intermodal Supply Chain" | Brand consistency | 🟡 Medium | Low |
| 6 | Website links to old LinkedIn URL (301 redirect, never updated after rebrand) | Brand consistency | 🟡 Medium | Trivial |
| 7 | CEO LinkedIn: default abstract banner, no ECS brand — 1,949 followers see nothing | Brand | 🟡 Medium | Trivial |
| 8 | ECS active on 2 social channels vs. 4–5 industry standard | Marketing | 🟡 Medium | Medium |
| 9 | All T&C PDFs publicly indexable via guessable paths | Info disclosure | 🟢 Low | Low |

---

## 1. 🔴 Critical — Broken Customer Portal

**Page:** [ecs.be/nl/mijn-portaalsites](https://www.ecs.be/nl/mijn-portaalsites)

The portal page lists two customer-facing links:

| Portal | URL | Status |
|--------|-----|--------|
| Intermodal Transport Portal | `http://customerportal-intermodal.ecs.be` | ✅ Reachable |
| Supply Chain Portal | `http://customerportal-supplychain.ecs.be` | 🔴 **Dead** |

```bash
$ curl -o /dev/null -s -w "%{http_code}" http://customerportal-supplychain.ecs.be
000   ← no connection at all (DNS_PROBE_FINISHED_NXDOMAIN)
```

**Root cause:** `customerportal-supplychain.ecs.be` has no DNS record — the subdomain was decommissioned without updating the link on ecs.be.

**Impact:** A customer or new prospect clicks "Supply Chain Portal" and hits a blank browser error. No fallback, no redirect, no message from ECS. For a company positioning itself as a supply chain partner, this is the first thing a prospect might click after reading the services page.

**Fix:** Update the link to the current portal URL or set a DNS redirect.

---

## 2. 🟠 High — Customer Portals Served Over HTTP

Both portal links on the ECS website use `http://` — not `https://`:

```
http://customerportal-intermodal.ecs.be
http://customerportal-supplychain.ecs.be
```

Customer portal sessions — login, shipment data, track & trace — transmitted over unencrypted HTTP are vulnerable to interception. Modern browsers flag HTTP login pages with a prominent "Not secure" warning, which actively undermines trust at the login screen.

**Fix:** Force HTTPS on both subdomains. Update the links on ecs.be.

---

## 3. 🟠 High — Terms & Conditions: No Click-Wrap, Outdated UK Document

**Page:** [ecs.be/nl/algemene-voorwaarden](https://www.ecs.be/nl/algemene-voorwaarden)

### 3a. No click-wrap acceptance
All six T&C documents are plain PDF downloads with no acceptance mechanism. Without click-wrap, proving in a dispute that a customer accepted the current version of the T&C is significantly harder under both Belgian and UK contract law.

### 3b. Document version matrix

| Stakeholder | Entity | Last Updated | Status |
|-------------|--------|--------------|--------|
| Customer | ECS NV / 2XL NV | Sep 2025 | ✅ |
| Customer | ECS Trucking BV | Aug 2025 | ✅ |
| Customer | 2XL France SAS | Aug 2025 | ✅ |
| Supplier & Contractor | ECS NV / 2XL NV | Sep 2025 | ✅ |
| Transport Carrier (non-UK) | ECS NV / 2XL NV | Aug 2025 | ✅ |
| Transport Carrier (UK) | ECS NV / 2XL NV | **Jul 2024** | ⚠️ 14 months old |

The UK carrier T&C has not been updated since July 2024. A document predating Brexit-related HMRC/RHA updates may no longer reflect current obligations.

---

## 4. 🟠 High — GDPR Cookie Consent Gap

**Source:** Page source of ecs.be — `eu_cookie_compliance` configuration block

The consent popup presents **two** categories:
- ✅ Functionele en statistische cookies
- ☐ Analytische cookies

**The gap:** `advertisement` and `social_media` cookies — including the **Facebook pixel** (`_fbp`) and **LinkedIn Insight Tag** (`lidc`) — are loaded but have **no corresponding consent category in the UI**.

---

## 5. 🟡 Medium — LinkedIn Brand Name Inconsistency

ECS operates under **three different names** across its own channels simultaneously:
- `ecs.be`: ECS European Containers
- `LinkedIn URL`: `ecs-european-containers` → 301 redirect
- `LinkedIn Page Name`: ECS Intermodal Supply Chain
- `CEO Profile`: **ECS Group**

---

## 6. 🎭 Executive Branding: Before & After Analysis
The CEO's profile carries LinkedIn's **default abstract grey-teal background** — no ECS logo, no brand colour.

### Side-by-Side Comparison
![Before and after comparison](./screenshots/comparison.png)

| Aspect | Before (Abstract) | After (Branded) |
| :--- | :--- | :--- |
| **Visual Signal** | Generic Abstract | ECS Burgundy & Gold Identity |
| **Messaging** | None | "Together We Excel" Tagline |
| **Authority** | Passive profile | Engineering Leader Profile |

> **Audit Action:** I designed a custom **ECS-branded banner** (`#8D1D45` / `#F8CE3E`) to instantly elevate executive authority.

---

## 7. 📐 Operational Flow Visualization

```mermaid
graph TD
    A[Cargo Arrival at Gate] --> B{Customs Status?}
    B -- Green -- > C[Automated High-Bay Warehouse]
    B -- Red -- > D[Manual Audit Lane / Customs]
    C --> E[SSI Schäfer Stacker Cranes]
    E --> F[Orbiter Shuttles / Picking]
    F --> G[JIT Dispatch for UK Ferry]
    G --> H[UK Distribution Center]
```

---

## 8. 🛡️ Digital Brexit Strategy (Case Study)
ECS reageerde op de Brexit door **"Customs as Code"** te implementeren.
- **Middleware:** Directe API-koppeling TMS ↔ PLDA/GVMS.
- **Resultaat:** Gate-to-gate tijd van **240 min naar 45 min** (-81%).
- **ROI:** Besparing van ca. **€40.000 per week** aan vermeden stilstandkosten.

---

## 9. 🟢 Low — T&C PDFs Fully Indexable
The `robots.txt` on ecs.be does not disallow `/sites/default/files/`. All T&C documents are guessable by search engines or researchers.

---

## Related: Solutions I Already Built for ECS

| Project | What it does | Stack |
|---------|-------------|-------|
| [**eco-match-engine**](https://github.com/KippieG/eco-match-engine) | Eliminates empty return mileage by AI-matching open trips. | Python · FastAPI |
| [**delay-dna**](https://github.com/KippieG/delay-dna) | Predicts shipment delays combining weather, customs, and ferry data. | React · Node.js |
| [**ecs-ecoload**](https://github.com/KippieG/ecs-ecoload) | Super Mega Trailer load optimizer & live reefer monitor. | .NET 10 · Angular |

---
*Geauditeerd door Philippe Godfroy (Logistics Master Hub)*
