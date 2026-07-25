import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types.ts";
import { appConfig } from "./app.config.ts";
import PoolConnector from "./pool_connector.ts";

export const supabase = createClient<Database>(
  appConfig.supabaseUrl,
  appConfig.supabaseKey
);

export const pool = new PoolConnector();