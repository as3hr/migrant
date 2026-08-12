import { BASE_URL, supabase } from "@src/exports.ts";
import type { User } from "@supabase/supabase-js";
import fs from "fs";
import getPort from "get-port";
import http from "http";
import open from "open";
import path from "path";

const LOCAL_DIR = path.join(process.cwd(), ".local");
const SESSION_FILE = path.join(LOCAL_DIR, "session.json");

export class AuthService {
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
  
            this.saveSessionToFile(data.session);
  
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

  private saveSessionToFile(session: any) {
    if (!fs.existsSync(LOCAL_DIR)) {
      fs.mkdirSync(LOCAL_DIR, { recursive: true });
    }
    fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), "utf-8");
  }

  async checkLoginGuard(): Promise<boolean> {
    if (!fs.existsSync(SESSION_FILE)) {
      return false;
    }

    try {
      const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE, "utf-8"));
      
      const { data, error } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      });

      if (error || !data.session) {
        return false;
      }

      this.saveSessionToFile(data.session);
      return true;
    } catch {
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try { 
      const { data } = await supabase.auth.getSession();
      if (data.session && data.session.user) {
        const user = data?.session?.user;
        return user; 
      }
      return null;
    }
    catch (e) {
      console.log(`Error in fetching user`, e);
      return null;
    }
  }
}