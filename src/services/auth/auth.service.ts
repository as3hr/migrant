import type { User } from "@supabase/supabase-js";
import getPort from "get-port";
import http from "node:http";
import open from "open";
import { appContext, type CommandContext } from "../../domain/index.ts";
import { supabase } from "../../infrastructure/index.ts";
import { credentialStore } from "../../infrastructure/security/credential_store.ts";
import { LocalSessionRepository, LocalWorkspaceRepository } from "../../local/index.ts";
import { BASE_URL } from "../../utils/index.ts";

export class AuthService {
  private sessionRepo: LocalSessionRepository;
  private workspaceRepo: LocalWorkspaceRepository;

  constructor() {
    this.sessionRepo = new LocalSessionRepository();
    this.workspaceRepo = new LocalWorkspaceRepository();
  }

  async authenticateUser() {
    try {
      const port = await getPort({ port: 3000 });
      const callbackPromise = this.startLocalCallbackServer(port);

      const loginUrl =
          `${BASE_URL}/login?cli_callback=` +
          encodeURIComponent(`http://127.0.0.1:${port}/callback`);

      console.log("Opening browser for authentication...");
      await open(loginUrl);

      await callbackPromise;
    } catch (err: any) {
      console.error("Login failed:", err);
      throw err;
    }
  }
  
  private async startLocalCallbackServer(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        const origin = req.headers.origin;
  
        if (origin === BASE_URL) {
          res.setHeader(
            "Access-Control-Allow-Origin",
            BASE_URL
          );
        }
  
        res.setHeader(
          "Access-Control-Allow-Methods",
          "POST, OPTIONS"
        );
  
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type"
        );
  
        res.setHeader(
          "Access-Control-Allow-Private-Network",
          "true"
        );
  
        res.setHeader("Vary", "Origin");
  
        if (req.method === "OPTIONS") {
          res.writeHead(204);
          return res.end();
        }
  
        const url = new URL(
          req.url || "",
          `http://127.0.0.1:${port}`
        );
  
        if (
          url.pathname !== "/callback" ||
          req.method !== "POST"
        ) {
          res.writeHead(404);
          return res.end();
        }
  
        let body = "";
  
        req.on("data", (chunk) => {
          body += chunk;
        });
  
        req.on("end", async () => {
          try {
            const {
              access_token,
              refresh_token,
            } = JSON.parse(body);
  
            if (!access_token || !refresh_token) {
              throw new Error("Missing authentication tokens");
            }
  
            const { data, error } =
              await supabase.auth.setSession({
                access_token,
                refresh_token,
              });
  
            if (error || !data.session) {
              throw error ?? new Error(
                "Failed to establish session"
              );
            }
  
            this.saveSession(data.session);
  
            res.writeHead(200, {
              "Content-Type": "application/json",
            });
  
            res.end(
              JSON.stringify({
                success: true,
              })
            );
  
            console.log(
              `\nSuccessfully logged in as: ${data.session.user.email}`
            );
  
            server.close();
            resolve();
          } catch (error) {
            console.error("CLI callback error:", error);
  
            res.writeHead(400, {
              "Content-Type": "application/json",
            });
  
            res.end(
              JSON.stringify({
                success: false,
              })
            );
  
            server.close();
            reject(error);
          }
        });
      });
  
      server.listen(port, "127.0.0.1", () => {
        console.log(
          `CLI authentication callback listening on http://127.0.0.1:${port}/callback`
        );
      });
  
      server.on("error", reject);
    });
  }

  async checkLoginGuard(): Promise<boolean> {
    try {
      const { data: activeData } = await supabase.auth.getSession();
      if (activeData.session) {
        return true;
      }

      const row = this.sessionRepo.getUserSession();
      if (!row) {
        return false;
      }

      const sessionData = JSON.parse(row.session_data);
      const { data, error } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      });

      if (error || !data.session) {
        this.sessionRepo.deleteSession(row.user_id);
        return false;
      }

      this.saveSession(data.session);
      return true;
    } catch (e) {
      console.error("Error in checkLoginGuard:", e);
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const isLoggedIn = await this.checkLoginGuard();
      if (!isLoggedIn) return null;

      const { data } = await supabase.auth.getSession();
      return data.session?.user ?? null;
    } catch (e) {
      console.error("Error in fetching current user:", e);
      return null;
    }
  }

  private saveSession(session: any) {
    const sessionData = JSON.stringify(session, null, 2);
    this.sessionRepo.setSession(session.user.id, sessionData);
  }

  async logOut(ctx: CommandContext) {
    const user = await this.getCurrentUser();
  
    if (!user) {
      ctx.exit();
      return;
    }
  
    ctx.log("Removing saved database credentials...");
  
    const connectionKeys =
      this.workspaceRepo.getLocalDbsConnectionKeys(user.id);
  
    await Promise.all(
      connectionKeys.map((key) => credentialStore.delete(key))
    );
  
    ctx.log("Removing workspaces and session...");
  
    for (const db of appContext.workspace.databases) {
      this.workspaceRepo.deleteLocalWorkspaceDb(db.id);
    }
  
    this.sessionRepo.deleteSession(user.id);
    await supabase.auth.signOut();
  
    appContext.workspace.databases = [];
  
    ctx.success("Logged out successfully.");
    ctx.exit();
  }
}