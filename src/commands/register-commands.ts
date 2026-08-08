import type { Command } from "commander";
import { authenticateUserCommand } from "./authenticate-command.ts";
import { registerScanCommand } from "./scan.command.ts";
import { registerUserQueryCommand } from "./user-query-command.ts";

export function registerCommands(program: Command) {
  authenticateUserCommand(program);
  registerScanCommand(program);
  registerUserQueryCommand(program);
}
