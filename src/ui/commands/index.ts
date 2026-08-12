import { CommandRegistry } from "@src/exports.ts";
import { askCommand } from "./ask.command.ts";
import { clearCommand } from "./clear.command.ts";
import { connectCommand } from "./connect.command.ts";
import { exitCommand } from "./exit.command.ts";
import { createHelpCommand } from "./help.command.ts";
import { loginCommand } from "./login.command.ts";
import { scanCommand } from "./scan.command.ts";

function buildRegistry(): CommandRegistry {
  const registry = new CommandRegistry();

  registry.register(loginCommand);
  registry.register(connectCommand);
  registry.register(scanCommand);
  registry.register(askCommand);
  registry.register(clearCommand);
  registry.register(exitCommand);
  registry.register(createHelpCommand(registry));

  return registry;
}

export const commandRegistry = buildRegistry();