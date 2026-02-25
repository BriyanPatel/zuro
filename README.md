# Zuro — Backend scaffolding for real projects


Stop setting up Express boilerplate from scratch. `zuro-cli init` gives you a production-ready Express + TypeScript backend in 60 seconds. Then add auth, database, email, and more as modules — one command at a time.

```bash
npx zuro-cli init my-app
```

---

## Why Zuro?

Every backend project starts the same way. You spend 2 hours configuring TypeScript, wiring up security middleware, setting up logging, and copy-pasting `.env` validation before writing a single route.

Zuro skips all of that. You get clean, readable TypeScript you fully own — no hidden runtime, no framework lock-in, no magic.

---

## Quick Start

```bash
# Create your project
npx zuro-cli init my-app
cd my-app

# Add the modules you need
npx zuro-cli add database
npx zuro-cli add auth
npx zuro-cli add mailer

# Start building
npm run dev
```

Works with npm, pnpm, and bun.

---

## Available Modules

| Module | Command | What You Get |
|---|---|---|
| **Core** | `zuro-cli init` | Express, TypeScript, Helmet, CORS, Pino logger, Zod env validation |
| **Database** | `zuro-cli add database` | Drizzle ORM with PostgreSQL or MySQL |
| **Auth** | `zuro-cli add auth` | Better-Auth — signup, login, sessions |
| **Validator** | `zuro-cli add validator` | Zod middleware for request body validation |
| **Error Handler** | `zuro-cli add error-handler` | Custom error classes, consistent API responses |
| **Mailer** | `zuro-cli add mailer` | Send emails via Resend or SMTP (Nodemailer) with templates |

> **Smart dependency resolution:** Running `zuro-cli add auth` automatically installs `database` and `error-handler` if they're not already present. No need to remember the order.

---

## What Gets Generated

Every file Zuro generates is plain TypeScript — readable, editable, and fully yours.

```
my-app/
├── src/
│   ├── app.ts
│   ├── env.ts
│   ├── lib/
│   ├── routes/
│   ├── controllers/
│   └── middleware/
├── db/
│   ├── index.ts
│   └── schema.ts
├── .env
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── zuro.json
```

---

## Tech Stack

Zuro doesn't reinvent the wheel. Every module uses libraries you already know and trust.

| Category | Library |
|---|---|
| Framework | Express.js |
| Language | TypeScript |
| Database ORM | Drizzle |
| Auth | Better-Auth |
| Validation | Zod |
| Email | Resend / Nodemailer |
| Security | Helmet |
| Logging | Pino |

---

## Built For

- **Hackathon teams** — ship auth, database, and email in under 2 minutes, spend your 48 hours on the actual product
- **College & capstone projects** — production-grade architecture without the setup tax
- **Bootcamps & cohorts** — give every student the same clean, consistent baseline

---

## Documentation

Full docs at [zuro-cli.devbybriyan.com/docs](https://zuro-cli.devbybriyan.com/docs)

- [Init](https://zuro-cli.devbybriyan.com/docs/init)
- [Database](https://zuro-cli.devbybriyan.com/docs/database)
- [Auth](https://zuro-cli.devbybriyan.com/docs/auth)
- [Validator](https://zuro-cli.devbybriyan.com/docs/validator)
- [Error Handler](https://zuro-cli.devbybriyan.com/docs/error-handler)
- [Mailer](https://zuro-cli.devbybriyan.com/docs/mailer)

---

## Local Development

```bash
# Install dependencies
corepack pnpm install

# Build CLI
corepack pnpm --filter zuro-cli build

# Run local registry
corepack pnpm dev:registry

# In another terminal
export ZURO_REGISTRY_URL=http://127.0.0.1:8787
cd packages/cli
npm link
zuro-cli init
```

### Project Structure

```
apps/web              # marketing site + docs (Next.js)
packages/cli          # zuro-cli npm package
packages/templates    # module templates + registry builder
packages/config       # shared tsconfig
```

---

## Contributing

Contributions are welcome. If you find a bug or want to suggest a new module, open an issue and let's talk.

---

## License

MIT — use it, fork it, build on it.

---

<p align="center">Built by <a href="https://devbybriyan.com">Briyan Patel</a> · <a href="https://zuro-cli.devbybriyan.com">Website</a> · <a href="https://zuro-cli.devbybriyan.com/docs">Docs</a></p>

