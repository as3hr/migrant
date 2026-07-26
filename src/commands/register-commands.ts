import type { Command } from "commander";
import { registerScanCommand } from "./scan.command.ts";

export function registerCommands(program: Command) {
  registerScanCommand(program);
}
