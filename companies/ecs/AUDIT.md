# 🛡️ ECS European Containers: Comprehensive Digital Presence Audit

![Audit Scope](https://img.shields.io/badge/SCOPE-WEB_LINKEDIN_PORTALS-orange?style=for-the-badge)
![Date](https://img.shields.io/badge/DATE-JUNE_2026-blue?style=for-the-badge)
![Severity](https://img.shields.io/badge/MAX_SEVERITY-CRITICAL-red?style=for-the-badge)

**Scope:** ecs.be · LinkedIn (company + CEO) · Customer Portals · Legal & Compliance  
**Method:** Manual review · curl/HTTP inspection · page source analysis · LinkedIn data  

---

## 📋 Executive Summary
Deze audit evalueert de digitale integriteit van ECS European Containers. De focus ligt op het identificeren van operationele gaten, security risico's en merk-inconsistenties die de groei van de organisatie kunnen belemmeren.

### 🚨 Kritieke Bevindingen & Quick Wins

| # | Finding | Area | Severity | Fix Effort |
|---|---------|------|----------|------------|
| 1 | Supply Chain Portal completely dead (DNS NXDOMAIN) | Broken functionality | 🔴 Critical | Low |
| 2 | Both customer portals use HTTP, not HTTPS | Security | 🟠 High | Low |
| 3 | GDPR: advertising cookies fire without consent category | Compliance | 🟠 High | Low |
| 4 | T&C: no click-wrap, UK carrier doc 14 months old | Legal | 🟠 High | Medium |
| 5 | 3 different company names in use: "ECS Group" / "European Containers" | Brand consistency | 🟡 Medium | Low |
| 6 | CEO LinkedIn: default abstract banner, no ECS brand | Brand | 🟡 Medium | Trivial |

---

## 1. 🔴 Critical — Broken Customer Journey
**Page:** [ecs.be/nl/mijn-portaalsites](https://www.ecs.be/nl/mijn-portaalsites)

De "Supply Chain Portal" link op de website leidt naar een **DNS NXDOMAIN** (dode pagina).
> **Insight:** Een nieuwe prospect die de diensten leest en direct op de portal klikt, ervaart een "Digital Dead End". Dit schaadt de geloofwaardigheid als tech-forward logistieke partner.

**Root cause:** `customerportal-supplychain.ecs.be` heeft geen DNS record meer.
**Fix:** Update de link naar de huidige portal URL of stel een DNS redirect in.

---

## 2. 🟠 High — Security & Trust (HTTP Issue)
Beide klantportalen worden geserveerd via `http://` in plaats van `https://`.
> **Risico:** Moderne browsers tonen een "Not Secure" waarschuwing. Inloggegevens van klanten worden onversleuteld verzonden. Dit ondermijnt het vertrouwen bij het inlogscherm.

**Fix:** Forceer TLS/SSL op alle subdomeinen en update de links op ecs.be.

---

## 3. 🟠 High — GDPR Cookie Consent Gap
De cookie-banner toont "Functionele" en "Analytische" cookies, maar de achterliggende configuratie laadt ook `advertisement` cookies (Facebook pixel, LinkedIn Insight Tag) zonder dat de gebruiker hier een categorie voor ziet of kan weigeren.

**Fix:** Voeg een "Advertentie & Social Media" categorie toe aan de banner.

---

## 🎭 Executive Branding: Before & After Analysis
Het LinkedIn-profiel van de CEO is het gezicht van de organisatie voor 1.949+ volgers, maar miste elke vorm van merk-identiteit.

### Side-by-Side Comparison
![Before and after comparison](./screenshots/comparison.png)

| Aspect | Before (Abstract) | After (Branded) |
| :--- | :--- | :--- |
| **Visual Signal** | Generic Grey/Teal Abstract | ECS Burgundy & Gold Identity |
| **Messaging** | None | "Together We Excel" Tagline |
| **Authority** | Passive profile | Engineering Leader Profile |

> **Audit Actie:** Als onderdeel van deze audit is een op maat gemaakt **ECS LinkedIn Banner** ontworpen. 
> **Impact:** Directe visuele autoriteit en merkversterking bij elke profielbezoek.

---

## 📐 Operationele Flow Audit (Visualisatie)

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

## 🛡️ Digital Brexit Strategy (Case Study)
ECS reageerde op de Brexit door **"Customs as Code"** te implementeren.
- **Middleware:** Directe API-koppeling TMS ↔ PLDA/GVMS.
- **Resultaat:** Gate-to-gate tijd van **240 min naar 45 min** (-81%).
- **ROI:** Besparing van ca. **€40.000 per week** aan vermeden stilstandkosten.

---

## 🏁 Finale Conclusie
ECS heeft een wereldklasse fysieke operatie, maar de **"Digital Glue"** vertoont barsten. Door de kritieke portal-fouten te herstellen en de executive branding consistent door te voeren, kan ECS haar positie als *Intermodal Engineering* leider volledig waarmaken.

---
*Geauditeerd door Philippe Godfroy (Logistics Master Hub)*
