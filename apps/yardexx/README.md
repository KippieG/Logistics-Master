# YardExx Platform

[![Deployed on Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=yardexx-platform&style=flat-square)](https://yardexx-platform.vercel.app)

**De Airbnb voor Terminalcapaciteit — Privé repository**

Volledig anoniem kopen en verkopen van surplus terminalcapaciteit: container, RoRo, droge bulk, tank, koeling. België-first, uitbreiding naar Europa.

---

## Tech stack

- **Next.js 15** — App Router, TypeScript
- **Tailwind CSS v4** — styling
- **PostgreSQL** — productie database (in-memory store voor MVP)
- **Prisma** — ORM (klaar voor productie, swap uit lib/db.ts)
- **JWT via jose** — authenticatie

## Lokaal starten

```bash
cp .env.example .env.local
# Vul DATABASE_URL en JWT_SECRET in

npm install
npm run dev
```

Open http://localhost:3000

## Routes

| Route | Beschrijving |
|-------|-------------|
| `/` | Homepage / hero |
| `/marketplace` | Alle actieve listings (filter op type, regio) |
| `/listings/new` | Nieuwe listing publiceren |
| `/listings/[id]` | Listing detail + aanvraag |
| `/auth` | Login / registratie |
| `/api/listings` | REST API — GET + POST |

## MVP → Productie

De app gebruikt nu een in-memory store (`lib/db.ts`). Voor productie:

1. Installeer Prisma: `npm install prisma @prisma/client`
2. Maak `prisma/schema.prisma` met de types uit `types/index.ts`
3. Vervang de functies in `lib/db.ts` door Prisma client calls
4. Zet `DATABASE_URL` in je .env.local

## Roadmap

- [ ] PostgreSQL + Prisma integratie
- [ ] Terminalverificatie flow
- [ ] Anoniem matching-algoritme
- [ ] Notificaties (e-mail bij match)
- [ ] Dashboard per terminal
- [ ] Betalingsintegratie (Stripe)
- [ ] Rotterdam uitbreiding (Q3 2026)

---

*Privé. Niet publiek delen.*
