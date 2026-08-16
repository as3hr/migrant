import { appContext, BASE_URL, LocalSessionRepository, LocalWorkspaceRepository, supabase, type CommandContext } from "@src/exports.ts";
import { credentialStore } from "@src/infrastructure/security/credential_store.ts";
import type { User } from "@supabase/supabase-js";
import getPort from "get-port";
import http from "http";
import open from "open";

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
        console.error("Login failed:", err.message);
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

  private saveSession(session: any) {
    const sessionData = JSON.stringify(session, null, 2);
    this.sessionRepo.setSession(session.user.id, sessionData);
  }

  async checkLoginGuard(): Promise<boolean> {
    const row = this.sessionRepo.getUserSession();
    if (!row) {
      return false;
    }

    try {
      const sessionData = JSON.parse(row.session_data);
      
      const { data, error } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      });

      if (error || !data.session) {
        return false;
      }

      this.saveSession(data.session);
      return true;
    } catch {
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try { 
      let { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        const restored = await this.checkLoginGuard();
        if (restored) {
          const fallback = await supabase.auth.getSession();
          data = fallback.data;
        }
      }

      if (data.session && data.session.user) {
        return data.session.user; 
      }
      return null;
    }
    catch (e) {
      console.error(`Error in fetching user:`, e);
      return null;
    }
  }

  async logOut(ctx: CommandContext) {
    const user = await this.getCurrentUser();
  
    if (!user) {
      ctx.exit();
      return;
    }
  
    ctx.log("Removing saved database credentials...");
  
    const connectionKeys =
      this.workspaceRepo.getDbsConnectionKeys(user.id);
  
    await Promise.all(
      connectionKeys.map((key) => credentialStore.delete(key))
    );
  
    ctx.log("Removing workspaces and session...");
  
    for (const db of appContext.workspace.databases) {
      this.workspaceRepo.deleteWorkspaceDb(db.id);
    }
  
    this.sessionRepo.deleteSession(user.id);
    await supabase.auth.signOut();
  
    appContext.workspace.databases = [];
    appContext.workspace.activeDbId = "";
  
    ctx.success("Logged out successfully.");
    ctx.exit();
  }
}