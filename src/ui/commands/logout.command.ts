import { appContext, type CommandDefinition } from "@src/exports.ts";

export const logoutCommand: CommandDefinition = {
  name: "logout",
  description: "Logout from your Migrant account",
  busyLabel: "Logging you out...",
  requiresAuth: true,
  execute: async (_args, ctx) => {
    await appContext.services.authService.logOut(ctx);    
  },
};