# Sewa Garasi

Web app for a garage rental company (Uji Kompetensi Pemrogram).
Stack: **Next.js 16 (App Router) + TypeScript + Prisma 7 + PostgreSQL**, tests with **Vitest**.

## Features

| Role | Feature | Page |
|---|---|---|
| Penyewa | Register (NIK, name, phone, email, password) | `/register` |
| Penyewa / Admin | Log in, log out | `/login` |
| Penyewa | New rental: vehicle details, daily/monthly, garage that fits the vehicle, live total, payment proof upload | `/tenant/rent` |
| Penyewa | My rentals | `/tenant` |
| Admin | Approve / reject new tenants | `/admin` |
| Admin | Create garages in bulk (IDs S001, C010, E003...) | `/admin/garages` |
| Admin | Extend a rental, remaining cost, payment proof | `/admin/extend` |
| Admin | Reports per month, per day, per garage type, per tenant | `/admin/reports` |

## Setup (first time)

```bash
npm install
```

```bash
cp .env.example .env
```

Then fill `SESSION_SECRET` and `ADMIN_PASSWORD` in `.env`.

Create the local database folder (only once):

```bash
initdb -D .db -U postgres --auth=trust -E UTF8 --locale=en_US.UTF-8
```

```bash
npm run db:start
```

```bash
createdb -h localhost -p 5433 -U postgres garage_rental
```

```bash
npm run db:migrate
```

```bash
npm run seed
```

## Every day

```bash
npm run db:start
```

```bash
npm run dev
```

Open http://localhost:3000 and log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.

```bash
npm test
```

```bash
npm run db:stop
```

## Rules used

- Monthly price = 25 × daily price. A monthly rental lasts 30 days.
- Daily rental: 1 to 30 days. End date = start date + number of days.
- Charging cost (electric car in an electric garage only) = battery kWh × price per kWh.
- Extension amount = extra days × daily price. The new end date must be after the old one.
- Payment proof images are saved in `public/uploads/` (works with `npm run dev`).

## Folders

```
prisma/                 schema, migrations, seed
src/domain/             classes from the class diagram (no database code)
src/lib/                prisma client, session, dates, upload, guards
src/app/                pages and server actions
tests/                  unit tests (Vitest)
docs/                   unit test scenario table for the report
.claude/skills/         project rules for AI assistants
```
