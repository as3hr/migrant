import dotenv from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath =
  process.env.NODE_ENV === "production" ?
  "../../.env.prod" 
  : "../../.env.dev";

dotenv.config({
  path: path.resolve(__dirname, envPath)
});

interface AppConfig {
  port: number;
  supabaseUrl: string;
  supabaseKey: string;
  jwtSecret: string;
  cronSecret: string;
  nodeEnv: string;
}

export const appConfig: AppConfig = {
  port: parseInt(process.env.PORT || "5000", 10),
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_KEY!,
  jwtSecret: process.env.JWT_SECRET!,
  cronSecret: process.env.CRON_SECRET!,
  nodeEnv: process.env.NODE_ENV!,
};
