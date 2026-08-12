import type { CommandDefinition } from "@src/exports.ts";
import { authService } from "@src/services/auth/auth_service.ts";

export const loginCommand: CommandDefinition = {
  name: "login",
  description: "Authenticate your Migrant account",
  busyLabel: "Waiting for browser...",
  execute: async (_args, ctx) => {
    await authService.authenticateUser();

    if (!(await authService.checkLoginGuard())) {
      throw new Error("Authentication failed or was cancelled.");
    }

    const user = await authService.getCurrentUser();
    ctx.success(user ? `Logged in as ${user.email}` : "Logged in");
  },
};