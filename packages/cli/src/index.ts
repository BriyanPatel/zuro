#!/usr/bin/env node
import { Command, InvalidArgumentError } from "commander";
import { init } from "./commands/init";
import { add } from "./commands/add";

const program = new Command();

program
    .name("zuro-cli")
    .description("Zuro CLI tool")
    .version("0.0.1");

program
    .command("init")
    .description("Initialize a new Zuro project")
    .action(init);

program
    .command("add <module>")
    .description("Add a module to your project")
    .option(
        "--auth-provider <provider>",
        "Auth provider for auth module (better-auth|jwt)",
        (value) => {
            if (value === "better-auth" || value === "jwt") {
                return value;
            }

            throw new InvalidArgumentError("auth-provider must be 'better-auth' or 'jwt'");
        }
    )
    .option("-y, --yes", "Skip prompts and use defaults")
    .action((module, options) => add(module, options));

program.parse(process.argv);
