# zuro-cli

The backend builder for busy developers.

## Usage

```bash
npx zuro-cli@beta init
```

Add modules:

```bash
npx zuro-cli@beta add database
npx zuro-cli@beta add auth
```

## Docs

- https://zuro-cli.devbybriyan.com/docs

## Registry

Default registry:

- https://registry.devbybriyan.com/channels/stable.json

Override for local testing:

```bash
export ZURO_REGISTRY_URL=http://127.0.0.1:8787
```

## Development

```bash
corepack pnpm install
corepack pnpm --filter zuro-cli build
corepack pnpm --filter zuro-cli lint
```
