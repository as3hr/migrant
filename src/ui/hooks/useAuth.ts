import { useEffect, useState } from "react";
import { appContext } from "../../domain/index.ts";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export interface UseAuthReturn {
  authStatus: AuthStatus;
  isLoggingIn: boolean;
  loginError: string | null;
  userEmail: string | undefined;
  checkAuth: () => Promise<boolean>;
  triggerLogin: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>();

  const checkAuth = async (): Promise<boolean> => {
    try {
      const user = await appContext.services.authService.checkLoginGuard();
      if (user) {
        setUserEmail(user?.email ?? undefined);
        setAuthStatus("authenticated");
        return true;
      } else {
        setAuthStatus("unauthenticated");
        return false;
      }
    } catch {
      setAuthStatus("unauthenticated");
      return false;
    }
  };

  const triggerLogin = async (): Promise<void> => {
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      await appContext.services.authService.authenticateUser();
      const success = await checkAuth();
      if (!success) {
        setLoginError("Login failed. Please try again.");
      }
    } catch (err: any) {
      setLoginError(err?.message ?? "Authentication failed");
      setAuthStatus("unauthenticated");
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    void checkAuth();
  }, []);

  return {
    authStatus,
    isLoggingIn,
    loginError,
    userEmail,
    checkAuth,
    triggerLogin,
  };
}
