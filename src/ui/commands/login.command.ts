import { appContext, type CommandDefinition } from "@src/exports.ts";

export const loginCommand: CommandDefinition = {
  name: "login",
  description: "Authenticate your Migrant account",
  busyLabel: "Waiting for browser...",
  execute: async (_args, ctx) => {
    await appContext.services.authService.authenticateUser();

    const user = await appContext.services.authService.getCurrentUser();
    if (user) {
      ctx.success(`Successfully logged in as ${user.email}!`);
    } else {
      throw new Error("Authentication failed or was cancelled.");
    }
  },
};