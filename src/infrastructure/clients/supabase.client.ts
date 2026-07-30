import { appConfig } from "@src/exports.ts";
import { createClient } from "@supabase/supabase-js";
import type { GeneratedDatabase } from "../../types/database.types.ts";

export const supabase = createClient<GeneratedDatabase>(
  appConfig.supabaseUrl,
  appConfig.supabaseKey
);