import { createClient } from "@supabase/supabase-js";
import { Pool } from 'pg';
import type { Database } from "../types/database.types.js";
import { appConfig } from "./app.config.js";

export const supabase = createClient<Database>(
  appConfig.supabaseUrl,
  appConfig.supabaseKey
);

export const pool = new Pool({
  connectionString: appConfig.databaseUrl,
});