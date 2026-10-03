import type { User } from "@supabase/supabase-js";
import getPort from "get-port";
import http from "node:http";
import open from "open";
import { appContext, type CommandContext } from "../../domain/index.ts";
import { credentialStore, pool, resetDb, supabase, tblDatabases, tblUserSession } from "../../infrastructure/index.ts";
import { BASE_URL, emitEvent } from "../../utils/index.ts";

export class AuthService {

  async authenticateUser() {
    try {
      const port = await getPort({ port: 3000 });
      const callbackPromise = this.startLocalCallbackServer(port);

      const loginUrl =
          `${BASE_URL}/login?cli_callback=` +
          encodeURIComponent(`http://127.0.0.1:${port}/callback`);

      await open(loginUrl);

      await callbackPromise;
    } catch (err: any) {
      console.error("Login failed:", err);
      throw err;
    }
  }
  
  private async startLocalCallbackServer(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout>;

      const server = http.createServer(async (req, res) => {
        const origin = req.headers.origin;
  
        if (origin) {
          res.setHeader("Access-Control-Allow-Origin", origin);
        } else {
          res.setHeader("Access-Control-Allow-Origin", "*");
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
            clearTimeout(timeoutId);
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
            clearTimeout(timeoutId);
            reject(error);
          }
        });
      });
  
      server.listen(port, "127.0.0.1", () => {
        timeoutId = setTimeout(() => {
          server.close();
          reject(new Error("Login timed out. No response received from browser."));
        }, 5 * 60 * 1000);
      });
  
      server.on("error", (err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
    });
  }

  async checkLoginGuard(): Promise<User | null> {
    try {
      const row = tblUserSession.getUserSession();

      if (!row) {
        return null;
      }

      const { data: activeData } = await supabase.auth.getSession();
      if (activeData.session) {
        return activeData.session.user;
      }


      const sessionData = JSON.parse(row.session_data);
      const { data, error } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      });

      if (error || !data.session) {
        tblUserSession.deleteSession(row.user_id);
        return null;
      }

      this.saveSession(data.session);
      return data.session.user;
    } catch (e) {
      console.error("Error in checkLoginGuard:", e);
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await this.checkLoginGuard();
      return user;
    } catch (e) {
      console.error("Error in fetching current user:", e);
      return null;
    }
  }

  private saveSession(session: any) {
    const sessionData = JSON.stringify(session, null, 2);
    tblUserSession.setSession(session.user.id, sessionData);
  }

  async logOut(ctx: CommandContext) {
    const user = await this.getCurrentUser();
  
    if (!user) {
      ctx.exit();
      return;
    }

    const connectionKeys =
      tblDatabases.getLocalDbsConnectionKeys(user.id);
  
    await Promise.all(
      connectionKeys.map((key: string) => credentialStore.delete(key))
    );

    resetDb();

    appContext.workspace.databases.map(async (db) => {
      try {
        await pool.close(db.id);
      } catch (e) { }
    });

    emitEvent.emit('logout');
  }
}