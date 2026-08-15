import { appContext, type CommandDefinition } from "@src/exports.ts";

export const loginCommand: CommandDefinition = {
  name: "login",
  description: "Authenticate your Migrant account",
  busyLabel: "Waiting for browser...",
  execute: async (_args, ctx) => {
    await appContext.services.authService.authenticateUser();

    if (!(await appContext.services.authService.checkLoginGuard())) {
      throw new Error("Authentication failed or was cancelled.");
    }

    const user = await appContext.services.authService.getCurrentUser();
    if (user) {
      ctx.success(`Successfully Logged in as ${user.email}!`);
      // here we store users session locally.
    }
  },
};