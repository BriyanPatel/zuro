# Zuro

Opinionated backend scaffolding for real projects.

Zuro gives you a clean Express + TypeScript foundation, then lets you add backend modules as your project grows.

Built for:
- college students learning backend architecture
- hackathon teams shipping fast
- cohorts and bootcamps standardizing project setup

## Quick Start

Use the beta release:

```bash
npx zuro-cli@beta init
```

Add modules:

```bash
npx zuro-cli@beta add database
npx zuro-cli@beta add auth
npx zuro-cli@beta add validator
npx zuro-cli@beta add error-handler
```

## Documentation

- Docs: https://zuro-cli.devbybriyan.com/docs
- Registry: https://registry.devbybriyan.com/channels/stable.json

## What You Get

- Express + TypeScript starter
- Environment validation with Zod
- Structured logging with Pino
- Pluggable module system (registry-driven)
- Safe file generation with checksum validation

## Available Modules

- `core` (base runtime)
- `database-pg`
- `database-mysql`
- `validator`
- `error-handler`
- `auth`

## Project Structure

```text
apps/web              # marketing site + docs
packages/cli          # zuro-cli package
packages/templates    # module templates + registry builder
packages/config       # shared tsconfig
```

## Local Development

### 1) Install

```bash
corepack pnpm install
```

### 2) Build CLI

```bash
corepack pnpm --filter zuro-cli build
```

### 3) Run Local Registry

```bash
corepack pnpm dev:registry
```

In another terminal:

```bash
export ZURO_REGISTRY_URL=http://127.0.0.1:8787
cd packages/cli
npm link
zuro-cli init
```

## Release

Publish beta:

```bash
cd packages/cli
npm version prerelease --preid=beta
npm publish --tag beta --access public --auth-type=web
```

## License

MIT
