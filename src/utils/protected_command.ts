import { appContext } from "@src/exports.ts";

export async function protectedComand(func: Function) {
    const isLoggedIn = await appContext.services.authService.checkLoginGuard();
      
    if (!isLoggedIn) {
      throw new Error("You must be logged in. Run /login first.");
    }

    func();
}