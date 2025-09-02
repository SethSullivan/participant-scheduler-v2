import { createClient } from "@supabase/supabase-js";
/**
 * Admin client that bypasses RLS policies
 * WARNING: Only use in server-side code (API routes, Server Components)
 * NEVER import this in client components
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    
    console.log("Admin client debug:", {
        hasUrl: !!url,
        hasKey: !!key,
        urlLength: url?.length,
        keyLength: key?.length,
        keyPrefix: key?.substring(0, 4)
    });
    
    if (!url) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    }
    
    if (!key) {
        throw new Error("Missing SUPABASE_SECRET_KEY");
    }
    
    try {
        const client = createClient(url, key, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
        });
        
        console.log("Supabase admin client created successfully");
        return client;
        
    } catch (error) {
        console.error("Failed to create Supabase client:", error);
        throw error;
    }
}
