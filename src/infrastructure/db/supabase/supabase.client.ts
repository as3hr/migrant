import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../types/database.types.ts";
import { appConfig } from "../../config/app.config.ts";

export const supabase = createClient<Database>(
  appConfig.supabaseUrl,
  appConfig.supabaseKey
);