import { createClient } from "@supabase/supabase-js";
/**
 * Admin client that bypasses RLS policies
 * WARNING: Only use in server-side code (API routes, Server Components)
 * NEVER import this in client components
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
        }
    );
};
