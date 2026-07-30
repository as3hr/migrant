import type { Command } from "commander";
import { registerScanCommand } from "./scan.command.ts";
import { registerUserQueryCommand } from "./user-query-command.ts";

export function registerCommands(program: Command) {
  registerScanCommand(program);
  registerUserQueryCommand(program);
}
