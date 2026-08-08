import { supabase } from "@src/exports.ts";
import fs from "fs";
import http from "http";
import open from "open";
import path from "path";

const LOCAL_DIR = path.join(process.cwd(), ".local");
const SESSION_FILE = path.join(LOCAL_DIR, "session.json");

class AuthService {
  async authenticateUser() {
    try {
      const PORT = 54321;
      const REDIRECT_URI = `http://localhost:${PORT}/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          skipBrowserRedirect: true,
          redirectTo: REDIRECT_URI,
        },
      });

      if (error) throw error;

      if (data?.url) {
        console.log("Opening browser for Google authentication...");
        await open(data.url);
        await this.startLocalCallbackServer(PORT);
      }
    } catch (err: any) {
      console.error("Login failed:", err.message);
    }
  }

  private startLocalCallbackServer(port: number): Promise<void> {
    return new Promise((resolve) => {
      const server = http.createServer(async (req, res) => {
        const urlObj = new URL(req.url || "", `http://localhost:${port}`);

        if (urlObj.pathname === "/callback") {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <body>
                <h2>Authenticating with Migrant CLI...</h2>
                <script>
                  const hash = window.location.hash;
                  if (hash) {
                    fetch('/save-token', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ hash: hash })
                    }).then(() => {
                      document.body.innerHTML = '<h2>Success! You can close this window and return to your terminal.</h2>';
                    });
                  }
                </script>
              </body>
            </html>
          `);
          return;
        }

        if (urlObj.pathname === "/save-token" && req.method === "POST") {
          let body = "";
          req.on("data", chunk => body += chunk);
          req.on("end", async () => {
            const { hash } = JSON.parse(body);
            
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");

            if (accessToken && refreshToken) {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (!error && data.session) {
                this.saveSessionToFile(data.session);
                console.log(`\nSuccessfully logged in as: ${data.session.user.email}`);
              }
            }

            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("OK");
            
            server.close();
            resolve();
          });
        }
      });

      server.listen(port);
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
}

export const authService = new AuthService();
