# Environment Variables

Complete reference for every environment variable ORVIX reads at runtime.
Variables are read by Node.js via `process.env`, so any deployment platform
that injects env vars (Vercel, Render, Fly, Railway, Docker `--env-file`,
systemd `Environment=`, etc.) will work.

The web app reads them in `apps/web/` (Next.js auto-loads `.env.local`,
`.env.production`, etc.). The AI service (`apps/ai/`) reads them in
`apps/ai/`. The packages read them in their respective locations.

Cloud-workspace compatibility: the Minimax cloud auto-injects the secret
`NEON_DATABASE_URL` into the process environment. The `@orvix/db` factory
aliases it to `DATABASE_URL` at module load. So you can use either name.

---

## Quick reference

| Variable | Required? | Default | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | **Yes (prod)** | — | Postgres connection string (used by Prisma) |
| `NEON_DATABASE_URL` | Alias | — | Same as `DATABASE_URL` (cloud-workspace compatibility) |
| `ORVIX_DB_BACKEND` | No | auto | `prisma` or `memory`; auto-selects on `DATABASE_URL` |
| `AUTH_SECRET` | **Yes (prod)** | dev placeholder | 32+ char random string for JWT signing |
| `EMAIL_SERVER` | Optional | — | SMTP URL for magic-link login |
| `EMAIL_FROM` | Optional | — | From address for magic-link emails |
| `GOOGLE_CLIENT_ID` | Optional | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | — | Google OAuth client secret |
| `MICROSOFT_CLIENT_ID` | Optional | — | Microsoft Entra ID client ID |
| `MICROSOFT_CLIENT_SECRET` | Optional | — | Microsoft Entra ID client secret |
| `MICROSOFT_ISSUER` | Optional | `https://login.microsoftonline.com/common/v2.0` | Microsoft Entra ID issuer URL |
| `ORVIX_S3_BUCKET` | Optional | — | S3-compatible bucket name |
| `ORVIX_S3_ENDPOINT` | Optional | AWS | S3 endpoint (R2, MinIO, B2, etc.) |
| `ORVIX_S3_REGION` | Optional | `auto` | S3 region |
| `ORVIX_S3_ACCESS_KEY_ID` | Optional | — | S3 access key |
| `ORVIX_S3_SECRET_ACCESS_KEY` | Optional | — | S3 secret key |
| `ORVIX_S3_FORCE_PATH_STYLE` | Optional | `0` | Set to `1` for R2/MinIO/LocalStack |
| `ORVIX_STORAGE_ROOT` | No | `/tmp/orvix-storage-dev` | Local adapter root (dev only) |
| `ORVIX_AI_DEFAULT_PROVIDER` | Optional | — | `openai` / `anthropic` / `gemini` / `openrouter` / `ollama` |
| `ORVIX_OPENAI_API_KEY` | Optional | — | OpenAI API key |
| `ORVIX_ANTHROPIC_API_KEY` | Optional | — | Anthropic API key |
| `ORVIX_GEMINI_API_KEY` | Optional | — | Gemini API key |
| `ORVIX_OPENROUTER_API_KEY` | Optional | — | OpenRouter API key |
| `ORVIX_OLLAMA_BASE_URL` | Optional | `http://127.0.0.1:11434` | Ollama server URL |
| `ORVIX_AI_URL` | No | `http://127.0.0.1:3001` | Web → AI service URL |
| `ORVIX_ALLOW_DEV_BOOTSTRAP` | No | `0` | Set to `1` to enable `/api/dev/*` routes |
| `NODE_ENV` | No | `development` | Standard Node env flag |

---

## Database (Postgres / Neon)

### `DATABASE_URL`

The Postgres connection string Prisma uses.

**Format:** `postgresql://USER:PASS@HOST:PORT/DB?sslmode=require`

**Example (Neon):**
```
DATABASE_URL=postgresql://neondb_owner:AbCdEf123456@ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Notes:**
- The `sslmode=require` is required for Neon.
- For local Postgres, drop the `sslmode` and use a regular URL.
- The `@orvix/db` factory picks the Prisma backend if this is set, or `ORVIX_DB_BACKEND=prisma` is set.

### `NEON_DATABASE_URL` (alias)

Cloud-workspace convenience. The Minimax cloud stores the Neon URL as
`NEON_DATABASE_URL`. The factory aliases it to `DATABASE_URL` at module
load. You don't need to set both.

### `ORVIX_DB_BACKEND`

Explicit backend override. Values:
- `prisma` — always use Prisma
- `memory` — always use the in-memory repository (dev, tests, no DB needed)

If unset, the factory auto-selects: `prisma` if `DATABASE_URL` is set, else `memory`.

---

## Auth (Auth.js v5)

### `AUTH_SECRET`

Random 32+ character string used to sign JWTs.

**Generate one:**
```bash
openssl rand -base64 32
```

**Required in production.** Defaults to `phase-0-dev-secret-do-not-ship` for dev.

### `EMAIL_SERVER` and `EMAIL_FROM`

Magic-link login (no password). `EMAIL_SERVER` is an SMTP URL; `EMAIL_FROM` is the From address.

**Example (Mailgun):**
```
EMAIL_SERVER=smtp://postmaster@mg.example.com:password123@smtp.mailgun.org:587
EMAIL_FROM=noreply@orvix.app
```

**Example (Resend):**
```
EMAIL_SERVER=smtp://resend:re_xxx@smtp.resend.com:587
EMAIL_FROM=noreply@orvix.app
```

If both are set, the magic-link provider registers. If unset, users can't log in via email (use OAuth or the dev memory session).

### Google OAuth

1. Go to https://console.cloud.google.com/apis/credentials
2. Create an OAuth 2.0 client (Web application)
3. Add authorized redirect URI: `https://YOUR-DOMAIN/api/auth/callback/google`
4. Copy the client ID and secret:
```
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

### Microsoft Entra ID

1. Go to https://portal.azure.com → App Registrations → New Registration
2. Set redirect URI: `https://YOUR-DOMAIN/api/auth/callback/microsoft-entra-id`
3. Create a client secret
4. Copy the values:
```
MICROSOFT_CLIENT_ID=00000000-0000-0000-0000-000000000000
MICROSOFT_CLIENT_SECRET=xxx~xxx
MICROSOFT_ISSUER=https://login.microsoftonline.com/common/v2.0
```

For single-tenant, set `MICROSOFT_ISSUER=https://login.microsoftonline.com/YOUR-TENANT-ID/v2.0`.

---

## File storage (S3-compatible)

ORVIX uses an `Storage` interface with two adapters: S3 (prod) and Local (dev).
The factory picks S3 when `ORVIX_S3_BUCKET` is set, Local otherwise.

### Local adapter (dev / no S3)

The local adapter writes to `ORVIX_STORAGE_ROOT`. No config required — files
land in `/tmp/orvix-storage-dev` by default. **This is not durable; use S3 in
production.**

### S3 / Cloudflare R2 / MinIO / Backblaze B2

The S3 adapter uses AWS Signature V4 over raw fetch (no AWS SDK dep). Works
with any S3-compatible service.

**Cloudflare R2:**
```
ORVIX_S3_BUCKET=orvix-uploads-prod
ORVIX_S3_ENDPOINT=https://ACCT.r2.cloudflarestorage.com
ORVIX_S3_REGION=auto
ORVIX_S3_ACCESS_KEY_ID=xxx
ORVIX_S3_SECRET_ACCESS_KEY=xxx
ORVIX_S3_FORCE_PATH_STYLE=1
```

**AWS S3:**
```
ORVIX_S3_BUCKET=orvix-uploads-prod
ORVIX_S3_REGION=us-east-1
ORVIX_S3_ACCESS_KEY_ID=AKIA...
ORVIX_S3_SECRET_ACCESS_KEY=xxx
# No endpoint, no force-path-style
```

**MinIO / LocalStack:**
```
ORVIX_S3_BUCKET=orvix
ORVIX_S3_ENDPOINT=http://localhost:9000
ORVIX_S3_REGION=us-east-1
ORVIX_S3_ACCESS_KEY_ID=minioadmin
ORVIX_S3_SECRET_ACCESS_KEY=minioadmin
ORVIX_S3_FORCE_PATH_STYLE=1
```

---

## AI providers

Set at least one key. If multiple are set, the `ORVIX_AI_DEFAULT_PROVIDER`
value determines the preferred ordering. Otherwise, the router tries them
in the order they appear in the `buildModelRouter` source code (openai →
anthropic → gemini → openrouter → ollama).

### `ORVIX_OPENAI_API_KEY`
Get one at https://platform.openai.com/api-keys
```
ORVIX_OPENAI_API_KEY=sk-...
```

### `ORVIX_ANTHROPIC_API_KEY`
Get one at https://console.anthropic.com/settings/keys
```
ORVIX_ANTHROPIC_API_KEY=sk-ant-...
```

### `ORVIX_GEMINI_API_KEY`
Get one at https://aistudio.google.com/app/apikey
```
ORVIX_GEMINI_API_KEY=AIza...
```

### `ORVIX_OPENROUTER_API_KEY`
Get one at https://openrouter.ai/keys
```
ORVIX_OPENROUTER_API_KEY=sk-or-...
```

### `ORVIX_OLLAMA_BASE_URL`
Ollama is a local model server. Install from https://ollama.com.
```
ORVIX_OLLAMA_BASE_URL=http://127.0.0.1:11434
```

### `ORVIX_AI_DEFAULT_PROVIDER`
The provider to try first when multiple are configured.
```
ORVIX_AI_DEFAULT_PROVIDER=openai   # or anthropic / gemini / openrouter / ollama
```

### `ORVIX_AI_URL`
The URL the web app uses to reach the Fastify AI service. Defaults to
`http://127.0.0.1:3001` (local dev). In production, set this to your
AI service URL.
```
ORVIX_AI_URL=https://ai.orvix.app
```

---

## Dev-only API routes

### `ORVIX_ALLOW_DEV_BOOTSTRAP`

When set to `1`, enables the dev-only API routes:
- `POST /api/dev/bootstrap` — creates a fully-bootstrapped workspace + user
- `POST /api/dev/seed` — adds curated sample work items to the workspace

In any environment other than `development`, these routes return **404**
unless `ORVIX_ALLOW_DEV_BOOTSTRAP=1`. Always set to `0` in production.

```
ORVIX_ALLOW_DEV_BOOTSTRAP=1
```

---

## Standard Node

### `NODE_ENV`

Set to `production` in any live deployment. The dev server defaults to
`development`. The Prisma client logs SQL in dev, errors only in prod.
```
NODE_ENV=production
```

### `PORT`

Optional. The Next.js dev server defaults to 3000. Vercel sets it
automatically. Override only if needed.
```
PORT=3000
```

---

## Setup checklist (copy-paste)

```bash
# Minimal dev setup (in-memory repo, no DB)
cat > apps/web/.env.local <<'EOF'
ORVIX_ALLOW_DEV_BOOTSTRAP=1
ORVIX_OPENAI_API_KEY=sk-...    # any one AI key
EOF

# Production-ready dev setup
cat > apps/web/.env.local <<'EOF'
DATABASE_URL=postgresql://USER:PASS@HOST/neondb?sslmode=require
ORVIX_DB_BACKEND=prisma
AUTH_SECRET=$(openssl rand -base64 32)
EMAIL_SERVER=smtp://user:pass@smtp.example.com:587
EMAIL_FROM=noreply@orvix.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ORVIX_S3_BUCKET=orvix-uploads
ORVIX_S3_REGION=us-east-1
ORVIX_S3_ACCESS_KEY_ID=...
ORVIX_S3_SECRET_ACCESS_KEY=...
ORVIX_AI_DEFAULT_PROVIDER=openai
ORVIX_OPENAI_API_KEY=sk-...
ORVIX_ALLOW_DEV_BOOTSTRAP=0
EOF
```

---

## What's required to deploy

For a production deploy, the **minimum** set is:

- `DATABASE_URL` (or `NEON_DATABASE_URL`)
- `AUTH_SECRET`
- One of the OAuth providers OR email login
- At least one AI provider key
- `ORVIX_DB_BACKEND=prisma` (or auto-detect via `DATABASE_URL`)

Everything else has sensible defaults or is dev-only.
