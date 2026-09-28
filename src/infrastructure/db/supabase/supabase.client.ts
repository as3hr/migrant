import { createClient } from "@supabase/supabase-js";
import { appConfig } from "../../config/app.config.ts";

export const supabase = createClient(
  appConfig.supabaseUrl,
  appConfig.supabaseKey
);