// components/auth-provider.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const supabase = createClient();
    
    // ✅ Set up listener immediately after createClient
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in successfully');
        
        if (session.provider_token) {
          localStorage.setItem('google_access_token', session.provider_token);
          console.log('Stored access token:', session.provider_token);
        }
        
        if (session.provider_refresh_token) {
          localStorage.setItem('google_refresh_token', session.provider_refresh_token);
          console.log('Stored refresh token');
        }
        
        localStorage.setItem("session", JSON.stringify(session));
        
        // Debug all token fields
        console.log('All session tokens:', {
          provider_token: session.provider_token,
          provider_refresh_token: session.provider_refresh_token,
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }
      
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_refresh_token');
        localStorage.removeItem('session');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}