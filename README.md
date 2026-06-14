# Full-Stack Template

A batteries-included, cloud-agnostic full-stack monorepo template. It ships authentication, organizations/teams, SMS, email, file storage, background jobs, and durable workflows out of the box — ready to build a new product on top of.

Primarily deployed to **Cloudflare** (Workers, Hyperdrive, KV, R2, Queues, Workflows, Email), but the package abstractions (db, blob, email, sms, kv) are designed to swap providers.

## Stack

- **Client** — Expo (React Native) + Expo Router. iOS, Android, and Web from one codebase.
- **Server** — Hono on Cloudflare Workers. Serves `/api/*` and the web app's static assets.
- **Auth** — better-auth with organizations, teams, email/password, email verification, 2FA, and phone (SMS OTP).
- **DB** — Drizzle ORM + PostgreSQL (via Neon + Cloudflare Hyperdrive at the edge).
- **Infra** — OpenTofu (Terraform) provisions Neon, Hyperdrive, KV, R2, Queues, and Turnstile.

## Monorepo layout

```
apps/
  client/   Expo app (auth, org, settings, notifications screens)
  server/   Hono API on Cloudflare Workers
packages/
  ai/         LLM provider abstraction (Workers AI / Bedrock)
  blob/       Object storage (R2 / S3 / Vercel Blob)
  db/         Drizzle schema, client, migrations
  email/      React Email templates + SMTP/CF Email transport
  kv/         Key-value store (Cloudflare KV / Redis)
  pdf/        PDF generation (PDFKit)
  providers/  Pluggable provider registry (SMS via Twilio)
  shared/     Shared types, validators, permissions
  sms/        SMS templates + transport
  workflows/  Cloudflare Workflows + job queue abstraction
infra/        OpenTofu config + deploy scripts
```

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in values
docker compose up -d         # local postgres, s3 (localstack), mailpit
pnpm db:push                 # apply schema to your local db
pnpm dev                     # run server + client
```

## Common scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Run the server and the mobile client |
| `pnpm dev:web` | Run the web client |
| `pnpm dev:server` | Run the Cloudflare Worker locally |
| `pnpm check` | Lint, format check, and typecheck |
| `pnpm test` | Run all workspace tests |
| `pnpm db:generate` | Generate a new Drizzle migration |
| `pnpm db:push` | Push schema changes to the database |
| `pnpm deploy:dev` / `pnpm deploy:prod` | Build and deploy to Cloudflare |

## Renaming the template

Workspace packages use the `@repo/*` namespace. The app identity (`app`, `app.example.com`, `com.example.app`) appears in `wrangler.toml`, `apps/client/app.config.ts`, and `infra/tofu/terraform.tfvars` — update these before shipping.
