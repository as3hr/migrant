interface AppConfig {
  supabaseUrl: string;
  supabaseKey: string;
  openRouterApiKey: string;
}

export const appConfig: AppConfig = {
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_KEY!,
  openRouterApiKey: process.env.OPENROUTER_API_KEY!,
};