#!/usr/bin/env node
import { Command } from "commander";
import { init } from "./commands/init";
import { add } from "./commands/add";

const program = new Command();

program
    .name("zuro")
    .description("Zuro CLI tool")
    .version("0.0.1");

program
    .command("init")
    .description("Initialize a new Zuro project")
    .action(init);

program
    .command("add <module>")
    .description("Add a module to your project")
    .action(add);

program.parse(process.argv);
