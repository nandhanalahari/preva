# Preva

Predictive home health dashboard for nurses and patients.

## Demo credentials (after running seed)

After running `node scripts/seed-auth.mjs`:

| Role    | Login                    | Password    |
|---------|--------------------------|-------------|
| **Nurse**  | `nandhu.alahari@gmail.com` | **`nurse123`** |
| **Patient** | `mary.t` (or `robert.c`, `linda.g`) | **`patient123`** |

The nurse account and three patient accounts are created by the seed script; use the passwords above to sign in.

## Setup

1. Copy `.env.example` to `.env.local` and set `MONGODB_URI` and `NEXTAUTH_SECRET`.
2. Seed the database: `node scripts/seed-mongo.mjs` then `node scripts/seed-auth.mjs`.
3. Run `npm run dev`.
