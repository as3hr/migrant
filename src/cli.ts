import { Command } from "commander";
import { EmbeddingService, registerCommands } from "@src/exports.ts";

export const aiService = new EmbeddingService();
const program = new Command();

program.name("migrant").description("CLI for migrant.").version("0.0.1");

registerCommands(program);
program.parse();