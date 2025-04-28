# Supersaas V3

> [!WARNING]  
> Supersaas V3 is still in beta. Expect minor bugs, I am working really fast to get these fixed.

> [!NOTE]  
> I suggest using this verion over the V2 - Its already quite stable and functional. I am still writing the docs. I will release it very soon (DM me in case if you need any help)

There are two versions of the repo

1. `main` - The main branch with the new Supersaas V3 code, this uses (NuxtHub)[https://hub.nuxt.com/] for deployment, a cloudflare D1 database and a cloudflare R2 bucket.
2. `postgres` - This branch is a 1 to 1 copy of the `main` branch but uses a postgres database and a custom S3 compatible blob storage.

You can find a demo here - [https://v3.supersaas.dev](https://v3.supersaas.dev)

## What's new in V3?

- Typescript only - no more mix of JS and TS as it was in V2, so I had to rewrite it from scratch. Not just the utils, the whole codebase is now in TS, the apis, the vue components, the nuxt middleware, the nuxt server, etc.

- Teams/Workspaces - Supersaas now has teams and workspaces, you can create multiple teams and switch between them. Act as an admin and invite users to your team. Kick people out of the team. Cancel invites.

- Stripe integration - A much better and more robust Stripe integration.

- A lot of code cleanup and refactoring.

## Tech Stack

- [Nuxt 3](https://nuxt.com)
- [Nuxt UI v3](https://ui3.nuxt.dev/)
- [TailwindCSS V4](https://tailwindcss.com)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Cloudflare D1, R2, Workers, KV, Pages for the NuxtHub people](https://hub.nuxt.com)
- [Postgres for the postgres folks](https://www.postgresql.org)
- [VueUse](https://vueuse.org/)

## Env Variables

| NAME       | Key                             | Value                                         |
| ---------- | ------------------------------- | --------------------------------------------- |
| APP_CONFIG | APP_NAME                        | Supersaas                                     |
| APP_CONFIG | APP_DESCRIPTION                 | The complete Nuxt 3 SaaS starter kit.         |
| APP_CONFIG | LOGO_URL                        | https://supersaas.dev/logo.png                |
| APP_CONFIG | BASE_URL                        | http://localhost:3000                         |
| EMAIL      | RESEND_API_TOKEN                | (empty)                                       |
| EMAIL      | FROM_EMAIL                      | fayaz@mail.supersaas.dev                      |
| EMAIL      | EMAIL_PROVIDER                  | resend                                        |
| AUTH       | NUXT_OAUTH_GOOGLE_CLIENT_ID     | (empty)                                       |
| AUTH       | NUXT_OAUTH_GOOGLE_CLIENT_SECRET | (empty)                                       |
| SESSION    | NUXT_SESSION_PASSWORD           | (empty)                                       |
| STRIPE     | NUXT_STRIPE_SECRET_KEY          | (empty)                                       |
| STRIPE     | NUXT_STRIPE_WEBHOOK_SECRET      | (empty)                                       |
| DEV        | MOCK_EMAIL                      | true                                          |
| TWILIO     | TWILIO_ACCOUNT_SID              | (empty)                                       |
| TWILIO     | TWILIO_AUTH_TOKEN               | (empty)                                       |
| TWILIO     | TWILIO_PHONE_NUMBER             | (empty)                                       |
| S3         | S3_ACCESS_KEY_ID                | (empty)                                       |
| S3         | S3_SECRET_ACCESS_KEY            | (empty)                                       |
| S3         | S3_BUCKET                       | (empty)                                       |
| S3         | S3_REGION                       | (empty)                                       |
| S3         | S3_ENDPOINT                     | (empty)                                       |
| S3         | S3_PUBLIC_ENDPOINT              | (empty)                                       |
| POSTGRES   | POSTGRES_URL                    | postgresql://postgres@127.0.0.1:5432/postgres |

Make sure to install the dependencies with [pnpm](https://pnpm.io/installation#using-corepack)

Once you have the env variables, you can install the dependencies with:

```bash
#pnpm
pnpm install

#yarn
yarn install

#npm
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Running Migrations

> NuxtHub

If you are using **NuxtHub**, you don't need to apply the migrations manually. The migrations are applied automatically when the dev server starts.

> [!NOTE]  
> Always push the migrations to your repo if you are using NuxtHub, because the builds are triggered on Git push which looks for migrations folder in the repo.

> Postgres

1. Generating the migrations, run the following command to generate the migrations from the Drizzle schema.

```bash
pnpm db:generate
```

2. Apply the migrations, run the following command to apply the migrations to the database. This will gracefully apply the migrations to the database and prompts you to confirm any destructive changes.

```bash
pnpm db:migrate
```

3. Push Migrations. - Push and Apply the migrations to the database directly

```bash
pnpm db:push
```

## Production

Build the application for production:

```bash
pnpm build
```
