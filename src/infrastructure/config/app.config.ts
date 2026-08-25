interface AppConfig {
  port: number;
  supabaseUrl: string;
  supabaseKey: string;
  secret: string;
  cronSecret: string;
  nodeEnv: string;
  openRouterApiKey: string;
}



export const appConfig: AppConfig = {
  port: parseInt(process.env.PORT || "5000", 10),
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_KEY!,
  secret: process.env.SECRET!,
  cronSecret: process.env.CRON_SECRET!,
  nodeEnv: process.env.NODE_ENV!,
  openRouterApiKey: process.env.OPENROUTER_API_KEY!,
};