import { appContext, type CommandContext, type CommandDefinition } from "../../domain/index.ts";
import { pool } from "../../infrastructure/db/pool.ts";

export function parseCommandInput(input: string): {
  name: string;
  args: string;
} | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) {
    return null;
  }

  const spaceIndex = trimmed.indexOf(" ");

  if (spaceIndex === -1) {
    const name = trimmed.slice(1);
    return name ? { name, args: "" } : null;
  }

  const name = trimmed.slice(1, spaceIndex);
  if (!name) {
    return null;
  }

  return { name, args: trimmed.slice(spaceIndex + 1).trim() };
}

export async function requireAuth(): Promise<void> {
  const isLoggedIn = await appContext.services.authService.checkLoginGuard();
  if (!isLoggedIn) {
    throw new Error("You must be logged in. Run /login first.");
  }
}

export async function runCommand(
  command: CommandDefinition,
  args: string,
  ctx: CommandContext,
): Promise<void> {
  if (command.requiresAuth) {
    await requireAuth();
  }

  if (command.requiresConnection && Object.keys(pool.pools).length === 0) {
    throw new Error("No database connected. Run /connect first.");
  }

  const originalLog = console.log;
  const originalError = console.error;

  const sink = (...values: unknown[]): void => {
    const line = values.map(formatConsoleValue).join(" ");
    for (const part of line.split("\n")) {
      ctx.log(part.length > 0 ? part : " ");
    }
  };

  console.log = sink;
  console.error = sink;

  try {
    await command.execute(args, ctx);
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return String(error);
}

function formatConsoleValue(value: unknown): string {
  if (value instanceof Error) {
    return value.message;
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}