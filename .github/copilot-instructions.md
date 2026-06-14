# Agent Instructions

## Project Context

This is a cloud-agnostic full-stack monorepo **template**. It provides the foundation for building a new product: authentication, organizations/teams, notifications (SMS/email/push), file storage, background jobs, and durable workflows. There is no business domain yet — add your own routes, schemas, and screens on top of the generic shell.

It is built on Expo (React Native) for the client and Hono on Cloudflare Workers for the API — a single codebase serving iOS, Android, and Web. It deploys primarily to Cloudflare, but the package abstractions (db, blob, email, sms, kv) are designed to swap providers.

## Tech Stack

| Category | Technology |
| --- | --- |
| Client | Expo SDK 55, React Native, React 19, Expo Router (typed routes) |
| Styling | StyleSheet + `useTheme` hook + Styled Components |
| Backend | Hono on Cloudflare Workers (Vite build) |
| Database | PostgreSQL via Drizzle ORM (Neon + Cloudflare Hyperdrive) |
| Auth | better-auth (organizations, teams, email/password, 2FA, phone OTP) |
| AI | Vercel AI SDK with Workers AI / AWS Bedrock |
| Workflows | Cloudflare Workflows + Queues |
| Blob storage | R2 / S3 / Vercel Blob (pluggable) |
| Validation | Zod + @hono/zod-validator |
| Data fetching | TanStack Query |
| Monorepo | pnpm workspaces |

## Monorepo Structure

```
apps/
  client/   Expo app — app/ (routes), components/, lib/, hooks/, providers/, styles/
  server/   Hono API — src/{index,routes,middleware,auth,config,helpers,services,workflows}
packages/
  ai/ blob/ db/ email/ kv/ pdf/ providers/ shared/ sms/ workflows/
```

Workspace packages use the `@repo/*` namespace (e.g. `@repo/db`, `@repo/shared`).

## Architecture Guidelines

### Multi-tenant / organization data

Strict tenant isolation via better-auth organizations + teams. Every org-scoped table has an `organization_id` foreign key, and every query filters by it.

### Backend patterns

- **Route helpers:** Use `createApp()` from `apps/server/src/helpers/hono.ts` to create sub-routers.
- **Config service:** Access env vars through the `ConfigService` singleton in `apps/server/src/config/config-service.ts`. Never read `process.env` directly in handlers.
- **Auth middleware:** `authMiddleware` sets `user` and `session` on the Hono context.
- **RBAC:** Check authorization with `requirePermission(resource, action)` middleware (`apps/server/src/middleware/require-permission.ts`), backed by the access-control roles in `apps/server/src/auth/permissions.ts`.
- **Service layer:** Keep route handlers thin; put DB queries and business logic in `apps/server/src/services/`.

### Authentication & authorization

- Server auth config: `apps/server/src/auth/server.ts`. Client: `apps/client/lib/auth.ts`.
- Organization roles: `owner`, `admin`, `member`. Extend `RESOURCES`/`ROLE_PERMISSIONS` in `packages/shared/src/permissions.ts` and the access-control statements in `apps/server/src/auth/permissions.ts` together.

### Data management

- **Single source of truth:** PostgreSQL via Drizzle. Schema lives in `packages/db/src/schema/`.
- **Schema-first:** Edit schemas, then `pnpm db:generate` to create a migration and `pnpm db:push` to apply.
- **File storage:** Use the `@repo/blob` abstraction; presign uploads rather than routing files through the Worker.

### Background work

- Use `@repo/workflows` for durable, multi-step background operations (survives restarts).
- Dispatch async jobs through the job queue; register handlers in `apps/server/src/jobs/register-handlers.ts`.

### UI/UX

- **Theming:** Never hardcode colors. Use the `useTheme` hook with tokens in `apps/client/styles/theme.ts`.
- **Cross-platform:** Code must work on iOS, Android, and Web unless platform-specific (note it in comments).
- **Test IDs:** Add `testID` to interactive components for Maestro E2E tests.
- **Forms:** Zod for validation, React Hook Form for state.

### Security

- Validate all API inputs with Zod at the boundary.
- Protect routes with auth middleware; check permissions for sensitive actions. Never trust client input for authorization.
- Store client secrets in Expo Secure Store. Validate file type/size on upload.

### Testing

- **Unit/integration:** Vitest (server + packages).
- **E2E:** Maestro flows in `apps/client/.maestro/`.

## Important Notes

- Generated code should support iOS, Android, and Web unless it's a platform-specific feature.
- Always add `testID`s to new interactive UI elements.
- Do not run `pnpm db:generate` / `db:push` automatically — leave migrations to the developer.
