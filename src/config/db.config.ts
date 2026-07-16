import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types.js";
import { appConfig } from "./app.config.js";
import PoolConnector from "./pool_connector.js";

export const supabase = createClient<Database>(
  appConfig.supabaseUrl,
  appConfig.supabaseKey
);

export const pool = new PoolConnector();