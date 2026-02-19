import chalk from "chalk";

export function showNonZuroProjectMessage() {
    console.log(chalk.yellow("This directory looks like an existing project that wasn't created with Zuro CLI."));
    console.log("");
    console.log(chalk.yellow("We stopped here because we don't want to make unnecessary changes to your project."));
    console.log("");
    console.log("Zuro CLI works in:");
    console.log("- a fresh/empty directory, or");
    console.log("- an existing project already managed by Zuro CLI.");
}
