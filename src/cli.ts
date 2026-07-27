import { registerCommands } from "@src/exports.ts";
import { Command } from "commander";

const program = new Command();

program.name("migrant").description("CLI for migrant.").version("0.0.1");

registerCommands(program);
program.parse();