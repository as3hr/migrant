import { authService } from "@src/exports.ts";

export async function protectedComand(func: Function) {
    const isLoggedIn = await authService.checkLoginGuard();
      
    if (!isLoggedIn) {
      console.error("Error: You must be logged in to perform this action.");
      console.error("Please run: migrant login");
      process.exit(1);
    }

    func();
}