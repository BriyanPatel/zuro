# zuro-cli

A CLI for scaffolding backend foundations and modules in your project.

## init

Use the `init` command to create a production-ready Express + TypeScript backend foundation.

The `init` command installs core dependencies, creates base files, and prepares your project for module-based backend development.

```bash
npx zuro-cli init
```

## add

Use the `add` command to add modules to your project.

The `add` command scaffolds module files, installs required dependencies, and updates relevant project setup.

```bash
npx zuro-cli add [module]
```

Example:

```bash
npx zuro-cli add auth
```

Available modules include:

- `database`
- `auth`
- `validator`
- `error-handler`

## Documentation

Visit https://zuro-cli.devbybriyan.com/docs to view the documentation.

## License

Licensed under the MIT license.
