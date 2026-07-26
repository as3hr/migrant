import { appConfig } from "@src/exports.ts";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database.types.ts";

export const supabase = createClient<Database>(
  appConfig.supabaseUrl,
  appConfig.supabaseKey
);