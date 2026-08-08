import { authService } from "@src/services/auth_service.ts";
import type { Command } from "commander";

export function authenticateUserCommand(program: Command) {
  program
  .command("login")
  .description("Login or SignUp with migrant!")
    .action(() => {
      authService.authenticateUser();
    });
}